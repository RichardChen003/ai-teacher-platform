// 统一 API 客户端：同域 /api（生产由 Worker 处理，开发由 vite proxy 转发）
const BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** Demo 免登录模式标记（sessionStorage：仅当前标签页会话有效，重开浏览器回到登录页） */
const DEMO_KEY = "aiteacher.demo";

export function isDemoMode(): boolean {
  return sessionStorage.getItem(DEMO_KEY) === "1";
}
export function setDemoMode(on: boolean) {
  if (on) sessionStorage.setItem(DEMO_KEY, "1");
  else sessionStorage.removeItem(DEMO_KEY);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  if (isDemoMode()) headers["x-demo"] = "1";
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.ok === false) {
    throw new ApiError(body?.code ?? "UNKNOWN", body?.message ?? `请求失败 (${res.status})`);
  }
  return body.data as T;
}

// ---------- 健康 / 用户 ----------
export const health = () => api<{ service: string; version: string }>("/health");
export const getMe = () => api<Record<string, unknown>>("/me");
export const updateMe = (patch: Record<string, unknown>) =>
  api<Record<string, unknown>>("/me", { method: "PATCH", body: JSON.stringify(patch) });

// ---------- 认证（可选，Demo 模式可跳过） ----------
export async function signUp(name: string, email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.error) throw new ApiError("AUTH_FAILED", body?.message ?? "注册失败");
  return body;
}
export async function signIn(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.error) throw new ApiError("AUTH_FAILED", body?.message ?? "登录失败");
  return body;
}

// ---------- 知识点图谱 ----------
export const getKnowledgeTree = (subject: string, stage: string) =>
  api<Array<{ id: string; name: string; children?: Array<{ id: string; name: string }> }>>(
    `/knowledge-tree?subject=${subject}&stage=${encodeURIComponent(stage)}`
  );

// ---------- 诊断 ----------
export type Question = {
  id: string;
  subject?: string;
  stage?: string;
  gradeLevel?: number;
  knowledgePointId?: string;
  type: "single_choice" | "multi_choice" | "short_answer";
  difficulty?: number;
  content: string;
  options?: Array<{ key: string; text: string }>;
};

export function startDiagnosis(input: { subject: string; grade: number; questionCount: number }) {
  return api<{ assessmentId: string; questions: Question[] }>("/diagnosis", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type MasteryItem = {
  knowledge_point_id: string;
  name: string;
  level: number;
  confidence: number;
  attempts: number;
};

export type DiagnosisReport = {
  assessmentId: string;
  subject: string;
  score: number;
  maxScore: number;
  overallLevel: string;
  items: MasteryItem[];
  weakPoints: string[];
  summary: string;
};

export function submitDiagnosis(assessmentId: string, answers: Array<{ questionId: string; answer: string; timeSpentSec?: number }>) {
  return api<{ assessmentId: string; score: number; maxScore: number; detail: Array<{ questionId: string; correct: boolean; correctAnswer: string; analysis: string }> }>(
    `/diagnosis/${assessmentId}/submit`,
    { method: "POST", body: JSON.stringify({ answers }) }
  );
}
export const getDiagnosisReport = (assessmentId: string) =>
  api<DiagnosisReport>(`/diagnosis/${assessmentId}/report`);

// ---------- 大纲 ----------
export type LessonBrief = {
  id: string;
  seq: number;
  title: string;
  objectives: string[];
  knowledgePointIds: string[];
  durationMin: number;
  status: "pending" | "prepared" | "delivered";
  pptAssetId?: string | null;
  quizAssessmentId?: string | null;
};

export type Syllabus = {
  id: string;
  subject: string;
  stage: string;
  grade_level: number;
  status: string;
  structure: {
    goal: string;
    weeks: number;
    totalLessons: number;
    hoursPerWeek: number;
  };
  lessons: LessonBrief[];
};

export function generateSyllabus(input: { subject: string; grade: number; hoursPerWeek: number; weeks: number }) {
  return api<Syllabus>("/syllabus/generate", { method: "POST", body: JSON.stringify(input) });
}
export const getActiveSyllabus = (subject = "math") =>
  api<Syllabus | null>(`/syllabus/active?subject=${subject}`);

// ---------- 课时 / 课件 ----------
export type Slide = {
  title: string;
  bulletPoints: string[];
  formula?: string;
  example?: string;
};

export type Deck = {
  lessonId: string;
  title: string;
  narration: string[];   // 每页讲稿（数字人朗读）
  slides: Slide[];
};

export const getLessonDeck = (lessonId: string) => api<Deck>(`/lessons/${lessonId}/deck`);
export const generatePpt = (lessonId: string) =>
  api<{ assetId: string; slideCount: number; deck: Deck }>(`/lessons/${lessonId}/ppt`, { method: "POST" });

// ---------- 知识点精品课 PPT ----------
export type RichBlock =
  | { type: "text"; content: string; size?: number; color?: string; bold?: boolean; align?: "left" | "center" }
  | { type: "list"; items: string[] }
  | { type: "formula"; content: string; note?: string }
  | { type: "mnemonic"; content: string; title?: string }
  | { type: "def"; title: string; content: string }
  | { type: "example"; question: string; solution?: string; tip?: string }
  | { type: "practice"; question: string; hint?: string }
  | { type: "steps"; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "columns"; left: RichBlock[]; right: RichBlock[] }
  | { type: "balance"; left: string; right: string; caption?: string }
  | { type: "numberline"; from: number; to: number; marks: Array<{ n: number; label?: string; color?: string }> }
  | { type: "summary"; points: string[] };

export type RichSlide =
  | { layout: "cover"; title: string; subtitle?: string; meta?: string[]; notes?: string }
  | { layout: "divider"; section: string; title?: string; subtitle?: string; notes?: string }
  | { layout: "content"; section: string; title: string; blocks: RichBlock[]; notes?: string };

export type RichDeck = {
  design: string;
  title: string;
  subject?: string;
  grade?: string;
  author?: string;
  school?: string;
  slides: RichSlide[];
};

export function generateKnowledgePpt(input: { subject: string; grade: number; name: string; children?: string[] }) {
  return api<{ deck: RichDeck; slideCount: number; pptxBase64: string; filename: string }>(
    "/knowledge-points/ppt",
    { method: "POST", body: JSON.stringify(input) }
  );
}

// ---------- 课后小测 ----------
export function generateQuiz(lessonId: string) {
  return api<{ assessmentId: string; questions: Question[] }>(`/lessons/${lessonId}/quiz`, { method: "POST" });
}
export const getQuiz = (lessonId: string) =>
  api<{ assessmentId: string; status: string; score: number | null; maxScore: number | null; questions: Question[] } | null>(
    `/lessons/${lessonId}/quiz`
  );
export function submitQuiz(lessonId: string, answers: Array<{ questionId: string; answer: string; timeSpentSec?: number }>) {
  return api<{ assessmentId: string; score: number; maxScore: number; detail: Array<{ questionId: string; correct: boolean; correctAnswer: string; analysis: string }> }>(
    `/lessons/${lessonId}/quiz/submit`,
    { method: "POST", body: JSON.stringify({ answers }) }
  );
}
