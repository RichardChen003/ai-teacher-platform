import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateDiagnosisSchema, SubmitAssessmentSchema } from "@aiteacher/shared";
import { drawQuestions, newId, now } from "../db";
import { requireUserId } from "./auth";
import { judgeAnswer, updateMastery, buildReport } from "../lib/mastery";
import type { Env } from "../env";

/**
 * 入测诊断（模块①）—— MVP 全流程
 *  POST /api/diagnosis          发起入测：智能组卷（分层抽样）
 *  GET  /api/diagnosis/:id      取试卷（不含答案）
 *  POST /api/diagnosis/:id/submit  交卷 → 客观题自动判分 + 解答题近似判分 → 掌握度更新
 *  GET  /api/diagnosis/:id/report  诊断报告（掌握度聚合 + 规则化建议）
 */
export const diagnosisRoutes = new Hono<{ Bindings: Env }>()
  .post("/diagnosis", zValidator("json", CreateDiagnosisSchema), async (c) => {
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const input = c.req.valid("json");
    const stage = input.grade <= 9 ? "初中" : "高中";
    // 高三（12）为总复习阶段：诊断覆盖整个高中内容；其余年级按年级精确匹配
    const isReview = input.grade === 12;
    const kps = isReview
      ? await c.env.DB.prepare(
          "SELECT id FROM knowledge_points WHERE subject = ? AND stage = ?"
        )
          .bind(input.subject, stage)
          .all()
      : await c.env.DB.prepare(
          "SELECT id FROM knowledge_points WHERE subject = ? AND stage = ? AND grade_level = ?"
        )
          .bind(input.subject, stage, input.grade)
          .all();
    const kpIds = (kps.results ?? []).map((r: any) => String(r.id));
    // 组卷：按知识点分层抽样（题库为空时返回空卷提示）
    const picked = await drawQuestions(c, {
      subject: input.subject,
      gradeLevel: isReview ? null : input.grade,
      stage,
      knowledgePointIds: kpIds.length ? kpIds : [""],
      count: input.questionCount,
    });
    const questionIds = picked.map((q: any) => String(q.id));
    const id = newId("asm");
    await c.env.DB.prepare(
      `INSERT INTO assessments (id, user_id, kind, subject, stage, grade_level, status, question_ids, meta)
       VALUES (?, ?, 'diagnosis', ?, ?, ?, 'in_progress', ?, ?)`
    )
      .bind(id, userId, input.subject, stage, input.grade, JSON.stringify(questionIds), JSON.stringify(input))
      .run();
    // 返回不含答案的试卷
    const questions = picked.map((q: any) => ({
      id: q.id,
      subject: q.subject,
      stage: q.stage,
      gradeLevel: q.grade_level,
      knowledgePointId: q.knowledge_point_id,
      type: q.type,
      difficulty: q.difficulty,
      content: q.content,
      options: q.options ? JSON.parse(q.options) : undefined,
    }));
    return c.json({ ok: true, data: { assessmentId: id, questions } }, 201);
  })
  .get("/diagnosis/:id", async (c) => {
    const id = c.req.param("id");
    const asm = await c.env.DB.prepare("SELECT * FROM assessments WHERE id = ?").bind(id).first();
    if (!asm) return c.json({ ok: false, code: "NOT_FOUND", message: "测评不存在" }, 404);
    return c.json({ ok: true, data: asm });
  })
  .post("/diagnosis/:id/submit", zValidator("json", SubmitAssessmentSchema), async (c) => {
    const id = c.req.param("id");
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const input = c.req.valid("json");

    const asm = await c.env.DB.prepare("SELECT * FROM assessments WHERE id = ? AND user_id = ?")
      .bind(id, userId)
      .first<any>();
    if (!asm) return c.json({ ok: false, code: "NOT_FOUND", message: "测评不存在" }, 404);
    if (asm.status !== "in_progress") {
      return c.json({ ok: false, code: "ALREADY_SCORED", message: "该测评已交卷" }, 409);
    }

    const questionIds = JSON.parse(String(asm.question_ids)) as string[];
    const qs: any[] = [];
    for (const qid of questionIds) {
      const q = await c.env.DB.prepare("SELECT * FROM questions WHERE id = ?").bind(qid).first<any>();
      if (q) qs.push(q);
    }

    let score = 0;
    let maxScore = qs.length;
    const detail: Array<Record<string, unknown>> = [];
    for (const q of qs) {
      const ans = input.answers.find((a) => a.questionId === q.id);
      const { correct, manualReview } = judgeAnswer(q, ans?.answer ?? "");
      const gained = correct ? 1 : 0;
      score += gained;
      const aid = newId("ans");
      await c.env.DB.prepare(
        `INSERT INTO assessment_answers (id, assessment_id, question_id, user_answer, is_correct, score, max_score, time_spent_sec, answered_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      )
        .bind(aid, id, q.id, ans?.answer ?? "", correct ? 1 : 0, gained, 1, ans?.timeSpentSec ?? null)
        .run();
      if (q.knowledge_point_id) {
        await updateMastery(c, userId, String(q.knowledge_point_id), correct, id);
      }
      detail.push({
        questionId: q.id,
        correct,
        manualReview,
        correctAnswer: q.answer,
        analysis: q.analysis,
      });
    }

    await c.env.DB.prepare(
      "UPDATE assessments SET status = 'scored', score = ?, max_score = ?, completed_at = ? WHERE id = ?"
    )
      .bind(score, maxScore, now(), id)
      .run();

    return c.json({ ok: true, data: { assessmentId: id, score, maxScore, detail } });
  })
  .get("/diagnosis/:id/report", async (c) => {
    const id = c.req.param("id");
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);

    const asm = await c.env.DB.prepare(
      "SELECT * FROM assessments WHERE id = ? AND user_id = ?"
    ).bind(id, userId).first<any>();
    if (!asm) return c.json({ ok: false, code: "NOT_FOUND", message: "测评不存在" }, 404);

    const questionIds = JSON.parse(String(asm.question_ids)) as string[];
    // 聚合本卷涉及知识点的掌握度
    const kpNames = new Map<string, string>();
    const rows = await c.env.DB.prepare(
      `SELECT DISTINCT kp.id AS kid, kp.name AS name FROM questions q
       JOIN knowledge_points kp ON kp.id = q.knowledge_point_id
       WHERE q.id IN (${questionIds.map(() => "?").join(",")})`
    )
      .bind(...questionIds)
      .all<any>();
    for (const r of rows.results ?? []) kpNames.set(String(r.kid), String(r.name));

    const mastery = await c.env.DB.prepare(
      `SELECT knowledge_point_id, alpha, beta, level, confidence, attempts, correct_count FROM mastery
       WHERE user_id = ?`
    )
      .bind(userId)
      .all<any>();

    const items = (mastery.results ?? [])
      .filter((m: any) => kpNames.has(String(m.knowledge_point_id)))
      .map((m: any) => ({
        knowledge_point_id: String(m.knowledge_point_id),
        name: kpNames.get(String(m.knowledge_point_id)) ?? "未知知识点",
        level: Number(m.level),
        confidence: Number(m.confidence),
        attempts: Number(m.attempts),
      }));

    const report = buildReport(items);
    return c.json({
      ok: true,
      data: {
        assessmentId: id,
        subject: asm.subject,
        score: asm.score,
        maxScore: asm.max_score,
        overallLevel: report.overall,
        items: report.items,
        weakPoints: report.weakPoints,
        summary: report.summary,
      },
    });
  });
