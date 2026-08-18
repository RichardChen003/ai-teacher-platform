// D1 数据访问层 —— 统一封装查询/写入，避免路由内散落 SQL
import type { Env } from "./env";

export function db(c: { env: Env }): D1Database {
  return c.env.DB;
}

export function newId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

export function now(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

// ---------- users ----------
export async function getUser(c: { env: Env }, userId: string) {
  return c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
}

/** 首次登录自动建档（auth_user 登录后调用） */
export async function ensureUserProfile(
  c: { env: Env },
  authUser: { id: string; email: string; name: string }
) {
  const existing = await getUser(c, authUser.id);
  if (existing) {
    // 仅同步 auth_user 的邮箱到业务表（改邮箱后 getMe 显示一致）。
    // 注意：绝不反向同步 name —— users.name 是学习档案里用户自定义的昵称，
    // auth_user.name 是注册时快照，若同步会把用户改过的昵称打回原样（曾踩坑）。
    const emailChanged = String(existing.email ?? "") !== String(authUser.email ?? "");
    if (emailChanged) {
      await c.env.DB.prepare("UPDATE users SET email = ?, updated_at = ? WHERE id = ?")
        .bind(authUser.email, now(), authUser.id)
        .run();
      return getUser(c, authUser.id);
    }
    return existing;
  }
  await c.env.DB.prepare(
    "INSERT INTO users (id, email, name, role, weekly_hours) VALUES (?, ?, ?, 'student', 4)"
  )
    .bind(authUser.id, authUser.email, authUser.name)
    .run();
  return getUser(c, authUser.id);
}

/** API 字段名(camelCase) → 数据库列名(snake_case) 映射 */
const PROFILE_FIELD_MAP: Record<string, string> = {
  name: "name",
  grade: "grade",
  subject: "subject",
  textbookVersion: "textbook_version",
  goalDate: "goal_date",
  weeklyHours: "weekly_hours",
  avatarUrl: "avatar_url",
};

/** 数据库行 → API 响应对象（camelCase） */
export function profileToApi(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row };
  out.textbookVersion = out.textbook_version;
  out.goalDate = out.goal_date;
  out.weeklyHours = out.weekly_hours;
  out.avatarUrl = out.avatar_url;
  delete out.textbook_version;
  delete out.goal_date;
  delete out.weekly_hours;
  delete out.avatar_url;
  return out;
}

export async function upsertUserProfile(
  c: { env: Env },
  userId: string,
  patch: Record<string, unknown>
) {
  // 仅保留合法字段，并映射为数据库列名
  const entries = Object.entries(patch)
    .filter(([k]) => PROFILE_FIELD_MAP[k] !== undefined && patch[k] !== undefined)
    .map(([k, v]) => [PROFILE_FIELD_MAP[k], v] as const);
  if (!entries.length) return getUser(c, userId);
  const sets = entries.map(([col]) => `${col} = ?`).join(", ");
  const values = entries.map(([, v]) => String(v));
  await c.env.DB.prepare(
    `UPDATE users SET ${sets}, updated_at = ? WHERE id = ?`
  )
    .bind(...values, now(), userId)
    .run();
  return getUser(c, userId);
}

// ---------- knowledge_points ----------
export async function listKnowledgePoints(c: { env: Env }, subject?: string, stage?: string) {
  let sql = "SELECT * FROM knowledge_points";
  const conds: string[] = [];
  const values: string[] = [];
  if (subject) {
    conds.push("subject = ?");
    values.push(subject);
  }
  if (stage) {
    conds.push("stage = ?");
    values.push(stage);
  }
  if (conds.length) sql += " WHERE " + conds.join(" AND ");
  sql += " ORDER BY order_index ASC";
  return c.env.DB.prepare(sql).bind(...values).all();
}

// ---------- questions ----------
const IN_CHUNK = 90; // Cloudflare D1 变量上限为 100（非 SQLite 的 999），分批查询避免 too many SQL variables

export async function drawQuestions(
  c: { env: Env },
  opts: {
    subject: string;
    gradeLevel: number | null; // null = 不限年级（高三总复习覆盖整个高中）
    stage: string;
    knowledgePointIds: string[];
    count: number;
    textbookVersion?: string;  // 教材版本过滤；"通用"或空 = 不按版本过滤
  }
) {
  // MVP：按知识点分组抽样，难度分层（基础 40% / 中档 40% / 拔高 20%）
  // 进阶：IRT 自适应组卷（见 docs/01 §5.1）
  const gradeCond = opts.gradeLevel === null ? "" : "AND grade_level = ? ";
  // 教材过滤：指定了具体版本（非"通用"）时，题目版本需等于该版本或"通用"（不限教材题）
  const tb = opts.textbookVersion && opts.textbookVersion !== "通用" ? opts.textbookVersion : null;
  const tbCond = tb ? "AND (textbook_version = ? OR textbook_version = '通用') " : "";
  const gradeParams = opts.gradeLevel === null ? [] : [opts.gradeLevel];
  const tbParams = tb ? [tb] : [];

  /** 查询一批知识点对应的题目（分批避免 IN 子句超限） */
  async function queryChunk(kpChunk: string[], useTb: boolean) {
    const kpIn = kpChunk.map(() => "?").join(",");
    const cond = useTb ? tbCond : "";
    const params = [opts.subject, ...gradeParams, ...(useTb ? tbParams : []), ...kpChunk];
    const r = await c.env.DB.prepare(
      `SELECT * FROM questions
       WHERE subject = ? AND review_status = 'approved'
         ${gradeCond}${cond} AND knowledge_point_id IN (${kpIn})
       ORDER BY difficulty ASC`
    )
      .bind(...params)
      .all();
    return (r.results ?? []) as unknown[];
  }

  // 合并去重工具
  function mergeRows(target: unknown[], source: unknown[]) {
    const seen = new Set(target.map((r: any) => String(r.id)));
    for (const r of source) {
      if (!seen.has(String((r as any).id))) {
        target.push(r);
        seen.add(String((r as any).id));
      }
    }
  }

  const kps = opts.knowledgePointIds.filter((k) => k && k !== "");
  let rows: unknown[] = [];
  for (let i = 0; i < kps.length; i += IN_CHUNK) {
    mergeRows(rows, await queryChunk(kps.slice(i, i + IN_CHUNK), true));
  }
  // 降级：指定版本但题量不足 count 时，放宽到全部版本（避免出不了卷）
  if (tb && rows.length < opts.count) {
    const fallback: unknown[] = [];
    for (let i = 0; i < kps.length; i += IN_CHUNK) {
      mergeRows(fallback, await queryChunk(kps.slice(i, i + IN_CHUNK), false));
    }
    mergeRows(rows, fallback);
  }
  return pickStratified(rows, opts.count);
}

function pickStratified(rows: unknown[], count: number): unknown[] {
  // 简化分层：按 difficulty 排序后均匀取 count 个
  const step = Math.max(1, Math.floor(rows.length / count));
  const picked: unknown[] = [];
  for (let i = 0; i < rows.length && picked.length < count; i += step) {
    picked.push(rows[i]);
  }
  return picked;
}
