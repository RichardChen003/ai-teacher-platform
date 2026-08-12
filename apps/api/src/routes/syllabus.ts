import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { GenerateSyllabusSchema } from "@aiteacher/shared";
import { requireUserId } from "./auth";
import { generateSyllabus } from "../lib/teaching";
import type { Env } from "../env";

/**
 * 教学大纲（模块③）—— MVP 规则版生成 + 查询 + 微调
 *  POST /api/syllabus/generate   基于掌握度生成大纲（weak 优先多课时）
 *  GET  /api/syllabus/active     当前生效大纲（含课时列表）
 *  GET  /api/syllabus/:id        取大纲
 *  PATCH /api/syllabus/:id       人工微调标题/目标
 */
export const syllabusRoutes = new Hono<{ Bindings: Env }>()
  .post("/syllabus/generate", zValidator("json", GenerateSyllabusSchema), async (c) => {
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const input = c.req.valid("json");
    const result = await generateSyllabus(c, userId, input);
    return c.json({ ok: true, data: result }, 201);
  })
  .get("/syllabus/active", async (c) => {
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const subject = c.req.query("subject") ?? "math";
    const syl = await c.env.DB.prepare(
      `SELECT * FROM syllabi WHERE user_id = ? AND subject = ? AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`
    )
      .bind(userId, subject)
      .first<any>();
    if (!syl) return c.json({ ok: true, data: null });
    const lessons = (
      await c.env.DB.prepare(
        "SELECT * FROM lessons WHERE syllabus_id = ? ORDER BY seq ASC"
      ).bind(String(syl.id)).all<any>()
    ).results ?? [];
    return c.json({
      ok: true,
      data: {
        ...syl,
        structure: JSON.parse(String(syl.structure)),
        lessons: lessons.map((l) => ({
          id: l.id,
          seq: l.seq,
          title: l.title,
          objectives: JSON.parse(String(l.objectives ?? "[]")),
          knowledgePointIds: JSON.parse(String(l.knowledge_point_ids ?? "[]")),
          durationMin: l.duration_min,
          status: l.status,
        })),
      },
    });
  })
  .get("/syllabus/:id", async (c) => {
    const syl = await c.env.DB.prepare("SELECT * FROM syllabi WHERE id = ?").bind(c.req.param("id")).first<any>();
    if (!syl) return c.json({ ok: false, code: "NOT_FOUND", message: "大纲不存在" }, 404);
    return c.json({ ok: true, data: { ...syl, structure: JSON.parse(String(syl.structure)) } });
  })
  .patch("/syllabus/:id", zValidator("json", GenerateSyllabusSchema.partial()), async (c) => {
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const patch = c.req.valid("json");
    // MVP：仅支持更新标题/目标
    const syl = await c.env.DB.prepare(
      "SELECT * FROM syllabi WHERE id = ? AND user_id = ?"
    ).bind(c.req.param("id"), userId).first<any>();
    if (!syl) return c.json({ ok: false, code: "NOT_FOUND", message: "大纲不存在" }, 404);
    const structure = JSON.parse(String(syl.structure));
    if (patch.targetDate) structure.goal = `目标日期 ${patch.targetDate}：${structure.goal}`;
    await c.env.DB.prepare(
      "UPDATE syllabi SET structure = ?, version = version + 1, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(JSON.stringify(structure), c.req.param("id"))
      .run();
    return c.json({ ok: true, data: { id: c.req.param("id"), structure } });
  });
