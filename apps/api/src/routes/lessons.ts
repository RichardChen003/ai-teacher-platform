import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { SubmitAssessmentSchema } from "@aiteacher/shared";
import { requireUserId } from "./auth";
import { generateDeck, renderPptx, generateQuiz, submitQuiz } from "../lib/teaching";
import { newId } from "../db";
import type { Env } from "../env";

/**
 * 课时（模块④⑤⑥）—— MVP 全流程
 *  GET  /api/lessons?syllabusId=   课时列表
 *  GET  /api/lessons/:id           课时详情
 *  GET  /api/lessons/:id/deck      课件 JSON（网页演示 / 数字人讲解用）
 *  POST /api/lessons/:id/ppt       生成并导出 PPTX（同步，存 R2）
 *  POST /api/lessons/:id/quiz      生成课后小测
 *  GET  /api/lessons/:id/quiz      最近未完成小测
 *  POST /api/lessons/:id/quiz/submit  交卷 → 掌握度更新 → 大纲微调建议
 */
export const lessonsRoutes = new Hono<{ Bindings: Env }>()
  .get("/lessons", async (c) => {
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const syllabusId = c.req.query("syllabusId");
    if (!syllabusId) return c.json({ ok: true, data: [] });
    const rows = (
      await c.env.DB.prepare(
        `SELECT l.* FROM lessons l JOIN syllabi s ON s.id = l.syllabus_id
         WHERE l.syllabus_id = ? AND s.user_id = ? ORDER BY l.seq ASC`
      ).bind(syllabusId, userId).all<any>()
    ).results ?? [];
    return c.json({
      ok: true,
      data: rows.map((l) => ({
        id: l.id,
        seq: l.seq,
        title: l.title,
        objectives: JSON.parse(String(l.objectives ?? "[]")),
        knowledgePointIds: JSON.parse(String(l.knowledge_point_ids ?? "[]")),
        durationMin: l.duration_min,
        status: l.status,
        pptAssetId: l.ppt_asset_id,
        quizAssessmentId: l.quiz_assessment_id,
      })),
    });
  })
  .get("/lessons/:id", async (c) => {
    const lesson = await c.env.DB.prepare("SELECT * FROM lessons WHERE id = ?").bind(c.req.param("id")).first<any>();
    if (!lesson) return c.json({ ok: false, code: "NOT_FOUND", message: "课时不存在" }, 404);
    return c.json({
      ok: true,
      data: {
        ...lesson,
        objectives: JSON.parse(String(lesson.objectives ?? "[]")),
        knowledge_point_ids: JSON.parse(String(lesson.knowledge_point_ids ?? "[]")),
      },
    });
  })
  .get("/lessons/:id/deck", async (c) => {
    const obj = await c.env.PPT_ASSETS.get(`decks/${c.req.param("id")}.json`);
    if (!obj) return c.json({ ok: false, code: "NOT_FOUND", message: "课件未生成，请先生成 PPT" }, 404);
    const deck = await obj.json();
    return c.json({ ok: true, data: deck });
  })
  .post("/lessons/:id/ppt", async (c) => {
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const lesson = await c.env.DB.prepare(
      `SELECT l.* FROM lessons l JOIN syllabi s ON s.id = l.syllabus_id
       WHERE l.id = ? AND s.user_id = ?`
    )
      .bind(c.req.param("id"), userId)
      .first<any>();
    if (!lesson) return c.json({ ok: false, code: "NOT_FOUND", message: "课时不存在" }, 404);

    const kpIds = JSON.parse(String(lesson.knowledge_point_ids ?? "[]")) as string[];
    const kpNames = new Map<string, string>();
    if (kpIds.length) {
      const rows = await c.env.DB.prepare(
        `SELECT id, name FROM knowledge_points WHERE id IN (${kpIds.map(() => "?").join(",")})`
      ).bind(...kpIds).all<any>();
      for (const r of rows.results ?? []) kpNames.set(String(r.id), String(r.name));
    }

    const deck = await generateDeck(c, { ...lesson, subject: lesson.subject ?? "math" }, kpNames);
    // 课件 JSON 存 R2（网页演示/数字人用）
    await c.env.PPT_ASSETS.put(`decks/${String(lesson.id)}.json`, JSON.stringify(deck), {
      httpMetadata: { contentType: "application/json" },
    });
    // PPTX 渲染存 R2
    const buf = await renderPptx(deck);
    const pptxKey = `pptx/${String(lesson.id)}.pptx`;
    await c.env.PPT_ASSETS.put(pptxKey, buf, { httpMetadata: { contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" } });
    // 资产登记
    const assetId = newId("ast");
    await c.env.DB.prepare(
      `INSERT INTO assets (id, owner_id, kind, r2_key, mime, size_bytes, meta, status, created_at)
       VALUES (?, ?, 'pptx', ?, 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ?, ?, 'ready', datetime('now'))`
    )
      .bind(assetId, userId, pptxKey, buf.byteLength, JSON.stringify({ slideCount: deck.slides.length }))
      .run();
    await c.env.DB.prepare("UPDATE lessons SET ppt_asset_id = ?, status = 'prepared' WHERE id = ?")
      .bind(assetId, String(lesson.id))
      .run();

    return c.json({
      ok: true,
      data: { assetId, slideCount: deck.slides.length, deck },
      message: "课件已生成，可在线演示或导出 PPTX",
    });
  })
  .post("/lessons/:id/quiz", async (c) => {
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const lesson = await c.env.DB.prepare(
      `SELECT l.* FROM lessons l JOIN syllabi s ON s.id = l.syllabus_id
       WHERE l.id = ? AND s.user_id = ?`
    )
      .bind(c.req.param("id"), userId)
      .first<any>();
    if (!lesson) return c.json({ ok: false, code: "NOT_FOUND", message: "课时不存在" }, 404);
    const result = await generateQuiz(c, userId, lesson);
    await c.env.DB.prepare("UPDATE lessons SET quiz_assessment_id = ? WHERE id = ?")
      .bind(result.assessmentId, String(lesson.id))
      .run();
    return c.json({ ok: true, data: result }, 201);
  })
  .get("/lessons/:id/quiz", async (c) => {
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const lesson = await c.env.DB.prepare(
      `SELECT l.* FROM lessons l JOIN syllabi s ON s.id = l.syllabus_id
       WHERE l.id = ? AND s.user_id = ?`
    )
      .bind(c.req.param("id"), userId)
      .first<any>();
    if (!lesson) return c.json({ ok: false, code: "NOT_FOUND", message: "课时不存在" }, 404);
    const qid = String(lesson.quiz_assessment_id ?? "");
    if (!qid) return c.json({ ok: true, data: null });
    const asm = await c.env.DB.prepare(
      "SELECT * FROM assessments WHERE id = ? AND user_id = ?"
    ).bind(qid, userId).first<any>();
    if (!asm) return c.json({ ok: true, data: null });
    const ids = JSON.parse(String(asm.question_ids)) as string[];
    const questions: any[] = [];
    for (const qid2 of ids) {
      const q = await c.env.DB.prepare("SELECT * FROM questions WHERE id = ?").bind(qid2).first<any>();
      if (q) questions.push({ id: q.id, type: q.type, content: q.content, options: q.options ? JSON.parse(q.options) : undefined });
    }
    return c.json({
      ok: true,
      data: {
        assessmentId: qid,
        status: asm.status,
        score: asm.score,
        maxScore: asm.max_score,
        questions,
      },
    });
  })
  .post("/lessons/:id/quiz/submit", zValidator("json", SubmitAssessmentSchema), async (c) => {
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const lesson = await c.env.DB.prepare(
      `SELECT l.* FROM lessons l JOIN syllabi s ON s.id = l.syllabus_id
       WHERE l.id = ? AND s.user_id = ?`
    )
      .bind(c.req.param("id"), userId)
      .first<any>();
    if (!lesson) return c.json({ ok: false, code: "NOT_FOUND", message: "课时不存在" }, 404);
    const input = c.req.valid("json");
    const result = await submitQuiz(c, userId, String(lesson.quiz_assessment_id ?? ""), input.answers);
    if (result.error) return c.json({ ok: false, code: "NOT_FOUND", message: result.error }, 404);
    await c.env.DB.prepare("UPDATE lessons SET status = 'delivered' WHERE id = ?")
      .bind(String(lesson.id))
      .run();
    return c.json({ ok: true, data: result });
  });
