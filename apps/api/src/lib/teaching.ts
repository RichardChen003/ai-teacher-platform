// ============================================================
// 教学引擎（MVP 规则版 + LLM 可插拔）：大纲生成 / 课件生成 / PPTX 渲染 / 课后小测
// 说明：规则引擎保证无 LLM key 也可完整跑通闭环；
//      LLM key 存在时 generateSyllabus/generateDeck 自动升级为 LLM 生成，
//      失败或校验不过时静默回退规则版。
// ============================================================
import PptxGenJS from "pptxgenjs";
import type { Env } from "../env";
import { newId, now } from "../db";
import { judgeAnswer, updateMastery } from "./mastery";
import { chatJSON } from "./llm";
import { renderQualityPptx } from "./qualityDeck";

type Ctx = { env: Env };
type Kp = { id: string; name: string; code: string | null; curriculum_ref: string | null };
type Lesson = { id: string; seq: number; title: string; objectives: string[]; knowledge_point_ids: string[]; duration_min: number };
type Question = { id: string; type: string; content: string; options: string | null; answer: string; analysis: string | null; knowledge_point_id: string | null; difficulty: number };

const kpLevel = (m: any): number => (m ? Number(m.level) : 0.5);
const kpName = (kps: Kp[], id: string): string => kps.find((k) => k.id === id)?.name ?? "知识点";

// ============================================================
// ① 大纲生成（规则版）：weak 优先、多课时；[LLM-HOOK] 可替换为 LLM 生成
// ============================================================
export async function generateSyllabus(
  c: Ctx,
  userId: string,
  input: { subject: string; assessmentId?: string; targetDate?: string; weeklyHours?: number }
) {
  const subject = input.subject;
  const kps = (
    await c.env.DB.prepare(
      "SELECT id, name, code, curriculum_ref FROM knowledge_points WHERE subject = ? ORDER BY order_index ASC"
    )
      .bind(subject)
      .all<Kp>()
  ).results ?? [];

  const mastery = (
    await c.env.DB.prepare(
      "SELECT knowledge_point_id, level, confidence, attempts FROM mastery WHERE user_id = ?"
    )
      .bind(userId)
      .all<any>()
  ).results ?? [];

  const levelOf = (kpId: string) => {
    const m = mastery.find((x: any) => String(x.knowledge_point_id) === kpId);
    return { level: kpLevel(m), attempts: m ? Number(m.attempts) : 0 };
  };

  // 排序：weak → medium → good，组内按 level 升序
  const sorted = [...kps].sort((a, b) => {
    const la = levelOf(a.id).level;
    const lb = levelOf(b.id).level;
    const rank = (l: number) => (l < 0.4 ? 0 : l < 0.7 ? 1 : 2);
    return rank(la) - rank(lb) || la - lb;
  });

  // [LLM-HOOK] 有 key 时尝试用 LLM 生成个性化大纲（失败回退规则）
  const llmUnits = await generateSyllabusWithLLM(c, {
    subject,
    kps: sorted.map((k) => ({ id: k.id, name: k.name, level: levelOf(k.id).level, attempts: levelOf(k.id).attempts })),
    weeklyHours: input.weeklyHours,
    targetDate: input.targetDate,
  });
  if (llmUnits && llmUnits.length) {
    const units = llmUnits;
    const lessons: Array<{ seq: number; title: string; objectives: string[]; knowledge_point_ids: string[]; duration_min: number }> = [];
    let seq = 1;
    for (const u of units) {
      for (const l of u.lessons) {
        // 校验知识点 id 必须真实存在，防止 LLM 幻觉
        const kpIds = l.knowledgePointIds.filter((id) => kps.some((k) => k.id === id));
        if (!kpIds.length) continue;
        lessons.push({
          seq: seq++,
          title: `${u.title} · ${l.title}`,
          objectives: l.objectives.slice(0, 3),
          knowledge_point_ids: kpIds,
          duration_min: Math.min(90, Math.max(30, l.durationMin || 45)),
        });
      }
    }
    if (lessons.length) {
      const structure = { goal: `补齐薄弱知识点，稳步提升学科能力${input.targetDate ? `，目标日期 ${input.targetDate}` : ""}`, units: [{ title: "个性化学习方案（AI 生成）", lessons: lessons.map((l) => ({ seq: l.seq, title: l.title, objectives: l.objectives, knowledgePointIds: l.knowledge_point_ids, durationMin: l.duration_min })) }] };
      const sylId = newId("syl");
      await c.env.DB.prepare(
        `INSERT INTO syllabi (id, user_id, subject, title, goal, structure, version, status, source_assessment_id, created_at, updated_at)
         VALUES (?, ?, ?, '个性化学习方案（AI 生成）', ?, ?, 1, 'active', ?, datetime('now'), datetime('now'))`
      )
        .bind(sylId, userId, subject, structure.goal, JSON.stringify(structure), input.assessmentId ?? null)
        .run();
      for (const l of lessons) {
        await c.env.DB.prepare(
          `INSERT INTO lessons (id, syllabus_id, seq, title, objectives, knowledge_point_ids, duration_min, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`
        )
          .bind(newId("lsn"), sylId, l.seq, l.title, JSON.stringify(l.objectives), JSON.stringify(l.knowledge_point_ids), l.duration_min)
          .run();
      }
      return { syllabusId: sylId, structure, lessons: lessons.map((l, i) => ({ ...l, id: `lsn_${sylId}_${i + 1}` })) };
    }
  }

  const units = [];
  const lessons: Array<Omit<Lesson, "id">> = [];
  let seq = 1;
  for (const kp of sorted) {
    const { level } = levelOf(kp.id);
    const need = level < 0.4 ? 2 : level < 0.7 ? 1 : 1;
    for (let i = 0; i < need; i++) {
      const objectives =
        level < 0.4
          ? [`掌握「${kp.name}」的核心概念与基本题型`, `通过例题理解典型解法`, `完成课后小测巩固`]
          : level < 0.7
            ? [`巩固「${kp.name}」薄弱环节`, `突破易错题型`, `完成课后小测查漏`]
            : [`「${kp.name}」进阶提升`, `挑战综合应用题型`, `完成课后小测检验`];
      lessons.push({
        seq: seq++,
        title: `${kp.name}${need > 1 ? (i === 0 ? "（基础）" : "（强化）") : ""}`,
        objectives,
        knowledge_point_ids: [kp.id],
        duration_min: 45,
      });
    }
  }
  units.push({ title: "个性化学习方案", lessons });

  const structure = { goal: "补齐薄弱知识点，稳步提升学科能力", units };
  const sylId = newId("syl");
  await c.env.DB.prepare(
    `INSERT INTO syllabi (id, user_id, subject, title, goal, structure, version, status, source_assessment_id, created_at, updated_at)
     VALUES (?, ?, ?, '个性化学习方案', ?, ?, 1, 'active', ?, datetime('now'), datetime('now'))`
  )
    .bind(sylId, userId, subject, structure.goal, JSON.stringify(structure), input.assessmentId ?? null)
    .run();

  // 实例化课时
  for (const l of lessons) {
    await c.env.DB.prepare(
      `INSERT INTO lessons (id, syllabus_id, seq, title, objectives, knowledge_point_ids, duration_min, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`
    )
      .bind(newId("lsn"), sylId, l.seq, l.title, JSON.stringify(l.objectives), JSON.stringify(l.knowledge_point_ids), l.duration_min)
      .run();
  }

  return { syllabusId: sylId, structure, lessons: lessons.map((l, i) => ({ ...l, id: `lsn_${sylId}_${i + 1}` })) };
}

/** [LLM-HOOK] 用 DeepSeek 生成个性化大纲（结构化 JSON + Zod 校验），失败返回 null */
async function generateSyllabusWithLLM(
  c: Ctx,
  input: {
    subject: string;
    kps: Array<{ id: string; name: string; level: number; attempts: number }>;
    weeklyHours?: number;
    targetDate?: string;
  }
): Promise<Array<{ title: string; lessons: Array<{ title: string; objectives: string[]; knowledgePointIds: string[]; durationMin: number }> }> | null> {
  const { z } = await import("zod");
  const schema = z.object({
    units: z.array(
      z.object({
        title: z.string(),
        lessons: z.array(
          z.object({
            title: z.string(),
            objectives: z.array(z.string()).min(1).max(4),
            knowledgePointIds: z.array(z.string()).min(1),
            durationMin: z.number().int().min(30).max(90).default(45),
          })
        ).min(1),
      })
    ).min(1),
  });
  const kpLine = input.kps.map((k) => `${k.id}|${k.name}|掌握度${Math.round(k.level * 100)}%|做题${k.attempts}次`).join("\n");
  const result = await chatJSON(c.env, {
    system: `你是初中数学教研专家，负责为学生生成个性化教学大纲。
依据学生的知识点掌握度（<40% 薄弱需要 2 课时，40-70% 一般需要 1-2 课时，>70% 良好 1 课时），
结合课标安排合理的教学顺序（薄弱优先，建立知识衔接）。
输出 units 数组：每个 unit 有 title 和 lessons 数组；每个 lesson 有 title/objectives(2-3条)/knowledgePointIds(必须从给定 id 中选取)/durationMin(默认45)。`,
    user: `学科：${input.subject}\n每周可投入：${input.weeklyHours ?? 4} 小时${input.targetDate ? `\n目标日期：${input.targetDate}` : ""}\n\n知识点及掌握度：\n${kpLine}\n\n请生成 2-4 个学习单元，共 8-14 节课的教学大纲。`,
    schema,
    maxTokens: 2048,
  });
  if (!result) return null;
  return result.units;
}

// ============================================================
// ② 课件生成（规则版）：封面/概念/例题/练习/小结 + 口语讲稿
// ============================================================
export async function generateDeck(c: Ctx, lesson: any, kpNames: Map<string, string>): Promise<any> {
  const kpId = String(lesson.knowledge_point_ids?.[0] ?? "");
  const name = kpNames.get(kpId) ?? lesson.title;

  // [LLM-HOOK] 有 key 时尝试用 LLM 生成更丰富的课件（失败回退规则）
  const llmDeck = await generateDeckWithLLM(c, lesson, name);
  if (llmDeck) return llmDeck;

  // 从题库抽例题与练习题（该知识点 approved 题）
  const pool =
    kpId
      ? (await c.env.DB.prepare(
          "SELECT * FROM questions WHERE knowledge_point_id = ? AND review_status = 'approved' ORDER BY difficulty ASC"
        ).bind(kpId).all<Question>()).results ?? []
      : [];
  const example = pool.find((q) => q.type !== "short_answer") ?? pool[0];
  const practice = pool[Math.min(1, pool.length - 1)] ?? pool[0];

  const slides: any[] = [
    {
      layout: "cover",
      title: `第 ${lesson.seq} 课 · ${lesson.title}`,
      blocks: [{ type: "text", content: `本课知识点：${name}` }],
      notes: `同学们好，欢迎来到第${lesson.seq}课，今天我们学习「${name}」。这节课的目标是${(lesson.objectives ?? [])[0] ?? "掌握核心知识"}。`,
    },
    {
      layout: "content",
      title: `${name} · 概念讲解`,
      blocks: [
        { type: "text", content: `1. 核心概念：${name}` },
        { type: "text", content: "2. 先掌握定义与基本性质，再通过例题理解应用" },
        { type: "text", content: "3. 注意与前后知识的联系，形成知识网络" },
      ],
      notes: `我们先来看「${name}」的核心概念。首先，请记住它的定义和基本性质，这是解题的基础。然后我们通过例题来看它怎么用。记得把新知识和以前学过的内容联系起来。`,
    },
  ];

  if (example) {
    slides.push({
      layout: "example",
      title: `例题 · ${name}`,
      blocks: [
        { type: "example", question: example.content, solution: example.analysis ?? "参考解析见课堂讲解" },
      ],
      notes: `下面我们看一道例题：${example.content}。大家先暂停思考一下，然后我们看解题思路。注意每一步的推理依据。`,
    });
  }

  if (practice) {
    slides.push({
      layout: "practice",
      title: `随堂练习 · ${name}`,
      blocks: [{ type: "practice", question: practice.content }],
      notes: `接下来是随堂练习：${practice.content}。请在草稿纸上完成，做完后对照答案检查。这道题考察的是本节课的重点。`,
    });
  }

  slides.push({
    layout: "summary",
    title: "本课小结",
    blocks: [
      { type: "summary", points: [`掌握「${name}」的核心概念`, "理解典型例题的解题步骤", "完成课后小测，检验掌握情况"] },
    ],
    notes: `我们来总结一下。这节课我们学习了「${name}」的概念和典型解法。下课前请完成课后小测，让我看看大家掌握得怎么样，我会根据结果调整下一课的内容。`,
  });

  return {
    lessonId: lesson.id,
    subject: lesson.subject ?? "math",
    title: lesson.title,
    slides,
  };
}

/** [LLM-HOOK] 用 DeepSeek 生成课件 JSON（结构化 + Zod 校验），失败返回 null */
async function generateDeckWithLLM(c: Ctx, lesson: any, kpName: string): Promise<any> {
  const { z } = await import("zod");
  const schema = z.object({
    slides: z.array(
      z.object({
        layout: z.enum(["cover", "content", "example", "practice", "summary", "table"]),
        title: z.string(),
        blocks: z.array(z.any()).min(1).max(6),
        notes: z.string(),
      })
    ).min(3).max(12),
  });
  const objectives = (lesson.objectives ?? []).join("；") || "掌握核心知识";
  const result = await chatJSON(c.env, {
    system: `你是经验丰富的初中数学老师，正在为一对一数字人课堂设计课件。
每页课件包含：layout(cover封面/content讲解/example例题/practice练习/summary小结/table表格)、title、blocks（block 类型：text 文本 / list 列表{items[]} / example 例题{question,solution} / practice 练习{question} / summary 小结{points[]} / table 表格{header[],rows[]}）、notes（给数字人口播的逐字讲稿，口语化、亲切）。
要求：3-6 页，覆盖 概念讲解→例题→练习→小结，内容准确、适合初中生。`,
    user: `课程：第 ${lesson.seq} 课 · ${lesson.title}\n知识点：${kpName}\n教学目标：${objectives}\n请生成课件 JSON。`,
    schema,
    maxTokens: 2048,
  });
  if (!result) return null;
  return { lessonId: lesson.id, subject: lesson.subject ?? "math", title: lesson.title, slides: result.slides };
}

// ============================================================
// ③ PPTX 渲染（pptxgenjs → ArrayBuffer）
// ============================================================
export async function renderPptx(deck: any): Promise<ArrayBuffer> {
  // 精品课 deck（design === "jingpin"）走增强渲染器（深绿主题 + 图形块），
  // 详见 qualityDeck.ts；规则版 deck 走下方简易渲染，保持向后兼容。
  if (deck?.design === "jingpin") return renderQualityPptx(deck);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "AI 老师平台";
  pptx.title = deck.title;

  for (const slide of deck.slides) {
    const s = pptx.addSlide();
    s.background = { color: "FFFFFF" };
    s.addText(slide.title, {
      x: 0.5, y: 0.3, w: 12.3, h: 0.7,
      fontSize: 28, bold: true, color: "185FA5", fontFace: "Microsoft YaHei",
    });
    let y = 1.3;
    for (const b of slide.blocks ?? []) {
      if (y > 6.4) break;
      if (b.type === "text") {
        s.addText(b.content, { x: 0.6, y, w: 12.1, h: 0.5, fontSize: 18, color: "2C2C2A", fontFace: "Microsoft YaHei" });
        y += 0.6;
      } else if (b.type === "list") {
        b.items.forEach((it: string) => {
          s.addText(`• ${it}`, { x: 0.7, y, w: 11.9, h: 0.5, fontSize: 18, color: "2C2C2A", fontFace: "Microsoft YaHei" });
          y += 0.6;
        });
      } else if (b.type === "table") {
        s.addTable(
          [b.header, ...b.rows].map((r) => r.map((cell: string) => ({ text: cell, options: { fontSize: 14, fontFace: "Microsoft YaHei" } }))),
          { x: 0.6, y, w: 12.1, border: { pt: 0.5, color: "B4B2A9" } }
        );
        y += 0.6 + b.rows.length * 0.45;
      } else if (b.type === "example" || b.type === "practice") {
        s.addText("【题目】", { x: 0.6, y, w: 12, h: 0.4, fontSize: 16, bold: true, color: "993C1D", fontFace: "Microsoft YaHei" });
        y += 0.5;
        s.addText(b.question, { x: 0.7, y, w: 11.9, h: 1.0, fontSize: 18, color: "2C2C2A", fontFace: "Microsoft YaHei", valign: "top" });
        y += 1.1;
        if (b.solution) {
          s.addText(`【解析】${b.solution}`, { x: 0.7, y, w: 11.9, h: 1.0, fontSize: 15, color: "5F5E5A", fontFace: "Microsoft YaHei", valign: "top" });
          y += 1.1;
        }
      } else if (b.type === "summary") {
        b.points.forEach((it: string) => {
          s.addText(`✓ ${it}`, { x: 0.7, y, w: 11.9, h: 0.5, fontSize: 18, color: "0F6E56", fontFace: "Microsoft YaHei" });
          y += 0.6;
        });
      }
    }
    // 备注（讲稿）写入 notes
    if (slide.notes) s.addNotes(slide.notes);
  }
  return pptx.write({ outputType: "arraybuffer" }) as Promise<ArrayBuffer>;
}

// ============================================================
// ④ 课后小测：抽题 → 判分 → 掌握度更新 → 大纲微调建议
// ============================================================
export async function generateQuiz(c: Ctx, userId: string, lesson: any) {
  const kpIds = (JSON.parse(String(lesson.knowledge_point_ids ?? "[]")) as string[]) ?? [];
  const picked: Question[] = [];
  for (const kpId of kpIds) {
    const m = await c.env.DB.prepare(
      "SELECT level FROM mastery WHERE user_id = ? AND knowledge_point_id = ?"
    ).bind(userId, kpId).first<any>();
    const need = !m || Number(m.level) < 0.4 ? 3 : Number(m.level) < 0.7 ? 2 : 1;
    const pool = (await c.env.DB.prepare(
      "SELECT * FROM questions WHERE knowledge_point_id = ? AND review_status = 'approved' ORDER BY RANDOM() LIMIT ?"
    ).bind(kpId, need).all<Question>()).results ?? [];
    picked.push(...pool);
  }
  const quizQuestions = picked.slice(0, 8);
  const id = newId("asm");
  await c.env.DB.prepare(
    `INSERT INTO assessments (id, user_id, kind, subject, stage, grade_level, status, question_ids, meta)
     VALUES (?, ?, 'quiz', ?, NULL, NULL, 'in_progress', ?, ?)`
  )
    .bind(id, userId, lesson.subject ?? "math", JSON.stringify(quizQuestions.map((q) => q.id)), JSON.stringify({ lessonId: lesson.id }))
    .run();
  const questions = quizQuestions.map((q) => ({
    id: q.id,
    type: q.type,
    content: q.content,
    options: q.options ? JSON.parse(q.options) : undefined,
  }));
  return { assessmentId: id, questions };
}

export async function submitQuiz(c: Ctx, userId: string, assessmentId: string, answers: Array<{ questionId: string; answer: string }>) {
  const asm = await c.env.DB.prepare("SELECT * FROM assessments WHERE id = ? AND user_id = ?")
    .bind(assessmentId, userId).first<any>();
  if (!asm) return { error: "测评不存在" };
  const meta = JSON.parse(String(asm.meta ?? "{}"));
  const lessonId = meta.lessonId;
  const questionIds = JSON.parse(String(asm.question_ids)) as string[];

  let score = 0;
  const qs: Question[] = [];
  for (const qid of questionIds) {
    const q = await c.env.DB.prepare("SELECT * FROM questions WHERE id = ?").bind(qid).first<Question>();
    if (q) qs.push(q);
  }
  const weakAfter: string[] = [];
  for (const q of qs) {
    const ans = answers.find((a) => a.questionId === q.id);
    const { correct } = judgeAnswer(q, ans?.answer ?? "");
    if (correct) score++;
    await c.env.DB.prepare(
      `INSERT INTO assessment_answers (id, assessment_id, question_id, user_answer, is_correct, score, max_score, answered_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`
    )
      .bind(newId("ans"), assessmentId, q.id, ans?.answer ?? "", correct ? 1 : 0, correct ? 1 : 0)
      .run();
    if (q.knowledge_point_id) {
      const row = await updateMastery(c, userId, String(q.knowledge_point_id), correct, assessmentId);
      if (row.level < 0.4 && row.attempts >= 2) weakAfter.push(String(q.knowledge_point_id));
    }
  }
  await c.env.DB.prepare(
    "UPDATE assessments SET status = 'scored', score = ?, max_score = ?, completed_at = ? WHERE id = ?"
  ).bind(score, qs.length, now(), assessmentId).run();

  // 大纲微调建议（规则）：仍薄弱的知识点 → 建议下一课加复习
  const revision: Record<string, unknown> = {};
  if (weakAfter.length) {
    const kps = (await c.env.DB.prepare(
      `SELECT id, name FROM knowledge_points WHERE id IN (${weakAfter.map(() => "?").join(",")})`
    ).bind(...weakAfter).all()).results ?? [];
    revision.suggestAddReview = {
      knowledgePoints: kps,
      reason: "课后小测后仍处于薄弱水平，建议在下一课插入复习课时",
    };
  } else {
    revision.suggestNext = "本课掌握良好，可按大纲进入下一课";
  }
  if (lessonId) {
    await c.env.DB.prepare(
      `INSERT INTO syllabus_revisions (id, syllabus_id, diff, reason, source_quiz_id, applied, created_at)
       VALUES (?, (SELECT syllabus_id FROM lessons WHERE id = ?), ?, ?, ?, 0, datetime('now'))`
    )
      .bind(newId("rev"), lessonId, JSON.stringify(revision), `课后小测 ${assessmentId}`, assessmentId)
      .run();
  }
  return { assessmentId, score, maxScore: qs.length, revision, weakAfter };
}
