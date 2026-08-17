// ============================================================
// @aiteacher/shared —— 前后端共享类型与 DTO（Zod Schema 同源）
// 约定：后端 Hono 路由用 zodValidator 校验；前端 API client 复用类型
// ============================================================
import { z } from "zod";

// ---------- 基础枚举 ----------
export const ROLES = ["student", "parent", "admin"] as const;
export const STAGES = ["初中", "高中"] as const;
export const QUESTION_TYPES = [
  "single_choice",
  "multi_choice",
  "blank",
  "short_answer",
] as const;
export const ASSESSMENT_KINDS = ["diagnosis", "quiz", "midterm"] as const;
export const ASSET_KINDS = ["ppt", "pptx", "audio", "avatar_video", "image"] as const;

export type Role = (typeof ROLES)[number];
export type Stage = (typeof STAGES)[number];
export type QuestionType = (typeof QUESTION_TYPES)[number];
export type AssessmentKind = (typeof ASSESSMENT_KINDS)[number];
export type AssetKind = (typeof ASSET_KINDS)[number];

// ---------- 地区 → 教材版本映射 ----------
// 按省份给出该地区初中主流教材版本；未列出的省份默认"人教版"。
// 说明：同一省份不同地市/科目可能存在差异，此处取主流值，诊断时可按需放宽。
export const REGION_TEXTBOOKS: Record<string, string> = {
  北京: "人教版",
  天津: "人教版",
  河北: "人教版",
  山西: "人教版",
  内蒙古: "人教版",
  辽宁: "北师大版",
  吉林: "人教版",
  黑龙江: "人教版",
  上海: "沪教版",
  江苏: "苏教版",
  浙江: "浙教版",
  安徽: "人教版",
  福建: "人教版",
  江西: "人教版",
  山东: "人教版",
  河南: "人教版",
  湖北: "人教版",
  湖南: "湘教版",
  广东: "人教版",
  广西: "人教版",
  海南: "人教版",
  重庆: "人教版",
  四川: "北师大版",
  贵州: "人教版",
  云南: "人教版",
  西藏: "人教版",
  陕西: "北师大版",
  甘肃: "人教版",
  青海: "人教版",
  宁夏: "人教版",
  新疆: "人教版",
  台湾: "通用",
  香港: "通用",
  澳门: "通用",
};

export const REGIONS = Object.keys(REGION_TEXTBOOKS);

/** 教材版本集合（含"通用"：不限教材，出题时忽略版本过滤） */
export const TEXTBOOKS = Array.from(
  new Set([...Object.values(REGION_TEXTBOOKS), "通用"])
);

/** 根据地区获取教材版本；未知地区返回"人教版"（全国最普及） */
export function textbookOfRegion(region: string): string {
  return REGION_TEXTBOOKS[region] ?? "人教版";
}

// ---------- 用户 ----------
export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  name: z.string(),
  role: z.enum(ROLES),
  grade: z.number().int().min(7).max(18).nullable(), // 学期粒度：7=初一上 … 18=高三下
  subject: z.string().nullable(),
  textbookVersion: z.string().nullable(),
  goalDate: z.string().nullable(),
  weeklyHours: z.number().min(0.5).max(20).optional(),
  createdAt: z.string(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateProfileSchema = UserProfileSchema.partial().omit({
  id: true,
  email: true,
  role: true,
  createdAt: true,
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ---------- 知识点 ----------
export const KnowledgePointSchema = z.object({
  id: z.string(),
  subject: z.string(),
  stage: z.enum(STAGES),
  gradeLevel: z.number().int().min(7).max(12),
  name: z.string(),
  code: z.string().optional(),
  parentId: z.string().nullable(),
  depth: z.number().int(),
  difficultyBase: z.number().min(0).max(1),
  orderIndex: z.number().int(),
});
export type KnowledgePoint = z.infer<typeof KnowledgePointSchema>;
export type KnowledgeTree = KnowledgePoint[]; // 客户端按 parentId 组树

// ---------- 题目 ----------
export const QuestionSchema = z.object({
  id: z.string(),
  subject: z.string(),
  stage: z.enum(STAGES),
  gradeLevel: z.number().int().min(7).max(12),
  knowledgePointId: z.string(),
  type: z.enum(QUESTION_TYPES),
  difficulty: z.number().min(0).max(1),
  content: z.string(), // 题干，支持 LaTeX
  options: z
    .array(z.object({ key: z.string(), text: z.string() }))
    .optional(),
  answer: z.string(),
  analysis: z.string().optional(),
  source: z.string(),
});
export type Question = z.infer<typeof QuestionSchema>;

// 学生端看到的题（不含答案/解析）
export const QuestionViewSchema = QuestionSchema.omit({ answer: true, analysis: true });
export type QuestionView = z.infer<typeof QuestionViewSchema>;

// ---------- 测评 ----------
export const AssessmentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  kind: z.enum(ASSESSMENT_KINDS),
  subject: z.string(),
  stage: z.enum(STAGES).optional(),
  gradeLevel: z.number().int().min(7).max(12),
  status: z.enum(["in_progress", "completed", "scored"]),
  score: z.number().nullable(),
  maxScore: z.number().nullable(),
  createdAt: z.string(),
});
export type Assessment = z.infer<typeof AssessmentSchema>;

// 入测发起
export const CreateDiagnosisSchema = z.object({
  subject: z.string().min(1),
  grade: z.number().int().min(7).max(18), // 学期粒度：7=初一上 … 18=高三下
  region: z.string().optional(),          // 就读地区（省/市），用于匹配教材版本
  textbookVersion: z.string().optional(), // 教材版本（如 人教版）；未传时由 region 推断
  questionCount: z.number().int().min(10).max(30).default(18),
});
export type CreateDiagnosisInput = z.infer<typeof CreateDiagnosisSchema>;

// 交卷
export const SubmitAssessmentSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
      timeSpentSec: z.number().int().optional(),
    })
  ),
});
export type SubmitAssessmentInput = z.infer<typeof SubmitAssessmentSchema>;

// 诊断报告（掌握度画像）
export const MasteryItemSchema = z.object({
  knowledgePointId: z.string(),
  knowledgePointName: z.string(),
  level: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  attempts: z.number().int(),
  status: z.enum(["weak", "medium", "good"]), // level < 0.4 / < 0.7 / else
});
export const DiagnosisReportSchema = z.object({
  assessmentId: z.string(),
  subject: z.string(),
  overallLevel: z.number().min(0).max(1),
  items: z.array(MasteryItemSchema),
  weakPoints: z.array(z.string()), // 短板知识点 id（按 level 升序 TopN）
  summary: z.string(), // 学习建议（LLM 生成）
  suggestedWeeks: z.number().int(),
});
export type DiagnosisReport = z.infer<typeof DiagnosisReportSchema>;
export type MasteryItem = z.infer<typeof MasteryItemSchema>;

// ---------- 大纲 ----------
export const LessonOutlineSchema = z.object({
  seq: z.number().int(),
  title: z.string(),
  objectives: z.array(z.string()),
  knowledgePointIds: z.array(z.string()),
  durationMin: z.number().int().default(45),
});
export const UnitOutlineSchema = z.object({
  title: z.string(),
  lessons: z.array(LessonOutlineSchema),
});
export const SyllabusStructureSchema = z.object({
  goal: z.string(),
  units: z.array(UnitOutlineSchema),
});
export type SyllabusStructure = z.infer<typeof SyllabusStructureSchema>;

export const GenerateSyllabusSchema = z.object({
  assessmentId: z.string(),
  subject: z.string(),
  targetDate: z.string().optional(), // 目标日期（中考/期末）
  weeklyHours: z.number().min(0.5).max(20).optional(),
});
export type GenerateSyllabusInput = z.infer<typeof GenerateSyllabusSchema>;

export const SyllabusSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subject: z.string(),
  title: z.string(),
  goal: z.string().optional(),
  structure: SyllabusStructureSchema,
  version: z.number().int(),
  status: z.enum(["active", "archived"]),
  sourceAssessmentId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Syllabus = z.infer<typeof SyllabusSchema>;

// ---------- 课时与资产 ----------
export const LessonSchema = z.object({
  id: z.string(),
  syllabusId: z.string(),
  seq: z.number().int(),
  title: z.string(),
  objectives: z.array(z.string()).optional(),
  knowledgePointIds: z.array(z.string()).optional(),
  status: z.enum(["pending", "prepared", "delivered", "reviewed"]),
  pptAssetId: z.string().nullable(),
  quizAssessmentId: z.string().nullable(),
});
export type Lesson = z.infer<typeof LessonSchema>;

export const AssetSchema = z.object({
  id: z.string(),
  kind: z.enum(ASSET_KINDS),
  status: z.enum(["processing", "ready", "failed"]),
  meta: z.record(z.string(), z.any()).optional(),
  error: z.string().optional(),
  downloadUrl: z.string().optional(), // 签名 URL（ready 后）
});
export type Asset = z.infer<typeof AssetSchema>;

// ---------- 课件 JSON（PPT 生成 Schema） ----------
export const SlideBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), content: z.string() }),
  z.object({ type: z.literal("formula"), latex: z.string() }),
  z.object({ type: z.literal("list"), items: z.array(z.string()) }),
  z.object({
    type: z.literal("table"),
    header: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }),
  z.object({ type: z.literal("example"), question: z.string(), solution: z.string().optional() }),
  z.object({ type: z.literal("practice"), question: z.string(), answer: z.string().optional() }),
  z.object({ type: z.literal("summary"), points: z.array(z.string()) }),
]);
export const SlideSchema = z.object({
  layout: z.enum(["cover", "content", "example", "practice", "summary"]),
  title: z.string(),
  blocks: z.array(SlideBlockSchema),
  notes: z.string(), // 口语化讲稿（数字人使用）
});
export const DeckSchema = z.object({
  lessonId: z.string(),
  subject: z.string(),
  title: z.string(),
  slides: z.array(SlideSchema),
});
export type Deck = z.infer<typeof DeckSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type SlideBlock = z.infer<typeof SlideBlockSchema>;

// ---------- 通用响应 ----------
export const ApiOkSchema = z.object({ ok: z.literal(true) });
export const ApiErrorSchema = z.object({
  ok: z.literal(false),
  code: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
