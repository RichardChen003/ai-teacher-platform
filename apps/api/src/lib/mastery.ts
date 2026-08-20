// ============================================================
// 掌握度模型（Beta-binomial）与诊断报告聚合
// 先验 Beta(2,2)：答对 alpha+1，答错 beta+1
// level = alpha/(alpha+beta)；confidence = 1 - 3*var
// ============================================================
import type { Env } from "../env";

export type MasteryRow = {
  user_id: string;
  knowledge_point_id: string;
  alpha: number;
  beta: number;
  level: number;
  confidence: number;
  attempts: number;
  correct_count: number;
};

function betaLevel(alpha: number, beta: number): number {
  return alpha / (alpha + beta);
}

function betaConfidence(alpha: number, beta: number): number {
  const n = alpha + beta;
  if (n <= 0) return 0;
  const variance = (alpha * beta) / (n * n * (n + 1));
  return Math.max(0, Math.min(1, 1 - 3 * variance));
}

/** 单题作答后更新某知识点掌握度（UPSERT） */
export async function updateMastery(
  c: { env: Env },
  userId: string,
  knowledgePointId: string,
  correct: boolean,
  assessmentId: string
): Promise<MasteryRow> {
  const existing = await c.env.DB.prepare(
    "SELECT * FROM mastery WHERE user_id = ? AND knowledge_point_id = ?"
  )
    .bind(userId, knowledgePointId)
    .first<MasteryRow>();

  const alpha0 = existing?.alpha ?? 2;
  const beta0 = existing?.beta ?? 2;
  const attempts0 = existing?.attempts ?? 0;
  const correct0 = existing?.correct_count ?? 0;

  const alpha = alpha0 + (correct ? 1 : 0);
  const beta = beta0 + (correct ? 0 : 1);
  const level = betaLevel(alpha, beta);
  const confidence = betaConfidence(alpha, beta);

  await c.env.DB.prepare(
    `INSERT INTO mastery (id, user_id, knowledge_point_id, alpha, beta, level, confidence, attempts, correct_count, last_assessment_id, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT (user_id, knowledge_point_id) DO UPDATE SET
       alpha = excluded.alpha, beta = excluded.beta, level = excluded.level,
       confidence = excluded.confidence, attempts = excluded.attempts,
       correct_count = excluded.correct_count, last_assessment_id = excluded.last_assessment_id,
       updated_at = datetime('now')`
  )
    .bind(
      `m_${userId.slice(0, 8)}_${knowledgePointId.slice(0, 20)}_${Date.now().toString(36)}`,
      userId,
      knowledgePointId,
      alpha,
      beta,
      level,
      confidence,
      attempts0 + 1,
      correct0 + (correct ? 1 : 0),
      assessmentId
    )
    .run();

  return {
    user_id: userId,
    knowledge_point_id: knowledgePointId,
    alpha,
    beta,
    level,
    confidence,
    attempts: attempts0 + 1,
    correct_count: correct0 + (correct ? 1 : 0),
  };
}

/** 判分：客观题字符串归一化比较；解答题关键词近似（MVP，标注需人工复核） */
export function judgeAnswer(question: {
  type: string;
  answer: string;
  analysis: string | null;
}, userAnswer: string): { correct: boolean; manualReview: boolean } {
  const norm = (s: string) => s.trim().replace(/\s+/g, "").toLowerCase();
  const ua = norm(userAnswer ?? "");
  if (!ua) return { correct: false, manualReview: false };

  if (question.type === "short_answer") {
    // MVP：标准答案中的关键片段出现在作答中即视为得分；标记人工复核
    const keys = norm(question.answer)
      .split(/[=;；,，]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 1);
    const hit = keys.some((k) => ua.includes(k));
    return { correct: hit, manualReview: true };
  }
  return { correct: norm(question.answer) === ua, manualReview: false };
}

/** 报告聚合：按知识点聚合掌握度 + 短板 + 规则化学习建议 */
export function buildReport(
  items: Array<{ knowledge_point_id: string; name: string; level: number; confidence: number; attempts: number }>
) {
  const decorated = items.map((it) => ({
    ...it,
    status: it.level < 0.4 ? "weak" : it.level < 0.7 ? "medium" : "good",
  }));
  const overall =
    items.length === 0 ? 0.5 : items.reduce((s, it) => s + it.level, 0) / items.length;
  const weakPoints = decorated
    .filter((it) => it.status === "weak")
    .sort((a, b) => a.level - b.level)
    .map((it) => it.name);
  const weakNames = decorated.filter((it) => it.status === "weak").map((it) => it.name);
  const mediumNames = decorated.filter((it) => it.status === "medium").map((it) => it.name);
  const goodNames = decorated.filter((it) => it.status === "good").map((it) => it.name);

  const summary = [
    weakNames.length
      ? `薄弱知识点：${weakNames.join("、")}，建议优先安排课时巩固`
      : "未发现明显薄弱点",
    mediumNames.length
      ? `中等掌握：${mediumNames.join("、")}，建议复习巩固后进入新内容`
      : "",
    goodNames.length ? `掌握良好：${goodNames.join("、")}，可适当加快进度` : "",
    weakNames.length ? `预计需要 ${Math.max(1, weakNames.length * 2)} 周补齐短板` : "可进入进阶学习",
  ]
    .filter(Boolean)
    .join("；");

  return { overall, items: decorated, weakPoints, summary };
}
