import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  startDiagnosis,
  submitDiagnosis,
  getDiagnosisReport,
  type Question,
  type DiagnosisReport,
} from "../lib/api";
import { gradeLabel, JUNIOR_GRADES, SENIOR_GRADES } from "../lib/grade";
import { REGIONS, REGION_CITIES, textbookOfRegion, splitRegion } from "@aiteacher/shared";
import RichText from "../components/RichText";

type Phase = "config" | "quiz" | "report";

/* ---------- 答题卡片（诊断 / 小测复用） ---------- */
export function QuestionCard({
  q,
  index,
  total,
  value,
  onChange,
}: {
  q: Question;
  index: number;
  total: number;
  value: string;
  onChange: (v: string) => void;
}) {
  const isChoice = q.type !== "short_answer";
  return (
    <div className="card animate-fade-up p-6">
      <div className="flex items-center justify-between">
        <span className="badge-blue">第 {index + 1} 题 / 共 {total} 题</span>
        <span className="badge-slate">{q.type === "short_answer" ? "解答题" : "选择题"}</span>
      </div>
      <p className="mt-4 text-[15px] font-medium leading-relaxed text-slate-800"><RichText text={q.content} /></p>
      {isChoice && q.options ? (
        <div className="mt-5 grid gap-2.5">
          {q.options.map((opt) => {
            const active = value === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => onChange(opt.key)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  active
                    ? "border-brand-400 bg-brand-50 ring-4 ring-brand-100"
                    : "border-slate-200 bg-white hover:border-brand-200 hover:bg-brand-50/40"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {opt.key}
                </span>
                <span className={active ? "font-medium text-brand-800" : "text-slate-700"}><RichText text={opt.text} /></span>
              </button>
            );
          })}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="输入你的解答过程（可用 计算过程 或 直接写答案）"
          rows={4}
          className="input mt-5 resize-none"
        />
      )}
    </div>
  );
}

/* ---------- 诊断报告（含掌握度条形图） ---------- */
function ReportView({ report, onRestart }: { report: DiagnosisReport; onRestart: () => void }) {
  const navigate = useNavigate();
  const pct = report.maxScore ? Math.round((report.score / report.maxScore) * 100) : 0;
  const ring = 2 * Math.PI * 42;

  return (
    <div className="space-y-6">
      {/* 得分总览 */}
      <div className="card animate-fade-up flex items-center gap-8 p-8">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#eef2f7" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="url(#g1)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * ring} ${ring}`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3e70eb" />
                <stop offset="100%" stopColor="#f95c16" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-800">{pct}</span>
            <span className="text-[10px] text-slate-400">得分率</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">入测诊断报告</h2>
            <span className="badge-green">完成</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            得分 {report.score}/{report.maxScore} · 综合水平
            <span className="mx-1 font-semibold text-brand-600">{report.overallLevel}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{report.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => navigate("/syllabus")}>
              生成专属大纲
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="btn-ghost" onClick={onRestart}>重新诊断</button>
          </div>
        </div>
      </div>

      {/* 知识点掌握度 */}
      <div className="card animate-fade-up-1 p-6">
        <h3 className="font-semibold text-slate-800">知识点掌握度</h3>
        <p className="mt-0.5 text-xs text-slate-400">基于做题情况实时更新，越靠右越熟练</p>
        <div className="mt-5 space-y-4">
          {report.items.map((it) => (
            <div key={it.knowledge_point_id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{it.name}</span>
                <span className="text-xs text-slate-400">
                  {it.attempts} 次作答 · 掌握度 <b className={it.level >= 0.7 ? "text-emerald-600" : it.level >= 0.4 ? "text-amber-600" : "text-rose-600"}>{Math.round(it.level * 100)}%</b>
                </span>
              </div>
              <div className="bar-track">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    it.level >= 0.7
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : it.level >= 0.4
                        ? "bg-gradient-to-r from-amber-400 to-orange-400"
                        : "bg-gradient-to-r from-rose-400 to-rose-500"
                  }`}
                  style={{ width: `${Math.max(4, Math.round(it.level * 100))}%` }}
                />
              </div>
            </div>
          ))}
          {report.items.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">暂无知识点数据，先完成一次诊断吧</p>
          )}
        </div>
      </div>

      {/* 薄弱点 */}
      {report.weakPoints.length > 0 && (
        <div className="card animate-fade-up-2 border-rose-100 bg-rose-50/40 p-6">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-rose-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <h3 className="font-semibold text-rose-700">需要加强的知识点</h3>
          </div>
          <ul className="mt-3 space-y-1.5">
            {report.weakPoints.map((w) => (
              <li key={w} className="flex items-center gap-2 text-sm text-rose-600">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                {w}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-rose-400">大纲已优先安排这些知识点的课程，我们马上开始。</p>
        </div>
      )}
    </div>
  );
}

/* ---------- 诊断页主流程 ---------- */
export default function Diagnosis() {
  const [phase, setPhase] = useState<Phase>("config");
  const [subject, setSubject] = useState("math");
  const [region, setRegion] = useState(""); // 就读地区（空=不限，默认人教版）
  const [grade, setGrade] = useState(7);
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assessmentId, setAssessmentId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(null);

  async function begin() {
    setBusy(true);
    setError("");
    try {
      const res = await startDiagnosis({
        subject,
        grade,
        region: region || undefined,
        questionCount: count,
      });
      if (res.questions.length === 0) {
        setError("题库为空，无法组卷。请先在后台导入题目。");
        setBusy(false);
        return;
      }
      setQuestions(res.questions);
      setAssessmentId(res.assessmentId);
      setAnswers({});
      setCurrent(0);
      setPhase("quiz");
    } catch (e: any) {
      setError(e.message ?? "发起诊断失败");
    }
    setBusy(false);
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? "",
        timeSpentSec: 20,
      }));
      const res = await submitDiagnosis(assessmentId, payload);
      setResult({ score: res.score, maxScore: res.maxScore });
      const rep = await getDiagnosisReport(assessmentId);
      setReport(rep);
      setPhase("report");
    } catch (e: any) {
      setError(e.message ?? "交卷失败");
    }
    setBusy(false);
  }

  const answered = Object.keys(answers).length;

  /* 配置阶段 */
  if (phase === "config") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="page-head">
          <div>
            <h1 className="page-title">入测诊断</h1>
            <p className="page-sub">15 分钟，摸清你的知识掌握情况</p>
          </div>
        </div>
        <div className="card animate-fade-up p-8">
          <SectionLabel icon="📘" text="选择学科" />
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { key: "math", label: "数学", emoji: "📐" },
              { key: "physics", label: "物理", emoji: "⚛️" },
              { key: "chemistry", label: "化学", emoji: "🧪" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSubject(s.key)}
                className={`rounded-xl border p-4 text-center transition-all ${
                  subject === s.key
                    ? "border-brand-400 bg-brand-50 ring-4 ring-brand-100"
                    : "border-slate-200 hover:border-brand-200"
                }`}
              >
                <div className="text-2xl">{s.emoji}</div>
                <div className={`mt-1.5 text-sm font-medium ${subject === s.key ? "text-brand-700" : "text-slate-600"}`}>
                  {s.label}
                </div>
              </button>
            ))}
          </div>

          {/* 就读地区（省→市 两级下拉，中考为市一级考核） */}
          <div className="mt-7">
            <SectionLabel icon="📍" text="就读地区（匹配教材版本）" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              {/* 省份下拉 */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">省份</label>
                <select
                  className="input"
                  value={splitRegion(region).province}
                  onChange={(e) => {
                    const p = e.target.value;
                    if (!p) { setRegion(""); return; }
                    // 选中省份：默认选该省第一个城市（若为直辖市则直接省名）
                    const city = REGION_CITIES[p]?.[0] ?? "";
                    setRegion(city ? `${p}-${city}` : p);
                  }}
                >
                  <option value="">不限（通用）</option>
                  {REGIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              {/* 城市下拉（依赖省份） */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">城市</label>
                <select
                  className="input"
                  disabled={!splitRegion(region).province}
                  value={splitRegion(region).city}
                  onChange={(e) => {
                    const city = e.target.value;
                    const prov = splitRegion(region).province;
                    setRegion(city ? `${prov}-${city}` : prov);
                  }}
                >
                  {splitRegion(region).province && (
                    <option value="">仅省（不分城市）</option>
                  )}
                  {(REGION_CITIES[splitRegion(region).province] ?? []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {region
                ? `已匹配教材：${textbookOfRegion(region)}（按该版本优先出题，题量不足时自动放宽）`
                : "不指定地区时按全国通用（人教版）出题"}
            </p>
          </div>

          <div className="mt-7">
            <SectionLabel icon="🎓" text="就读年级" />
            {/* 初中一行 6 个（初一上~初三下） */}
            <div className="mt-3 grid grid-cols-6 gap-2">
              {JUNIOR_GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`rounded-xl border px-1 py-2.5 text-sm font-medium transition-all ${
                    grade === g
                      ? "border-brand-400 bg-brand-600 text-white shadow-[0_4px_12px_-2px_rgb(43_83_223/0.4)]"
                      : "border-slate-200 text-slate-600 hover:border-brand-200"
                  }`}
                >
                  {gradeLabel(g)}
                </button>
              ))}
            </div>
            {/* 高中一行 6 个（高一上~高三下） */}
            <div className="mt-2 grid grid-cols-6 gap-2">
              {SENIOR_GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`rounded-xl border px-1 py-2.5 text-sm font-medium transition-all ${
                    grade === g
                      ? "border-brand-400 bg-brand-600 text-white shadow-[0_4px_12px_-2px_rgb(43_83_223/0.4)]"
                      : "border-slate-200 text-slate-600 hover:border-brand-200"
                  }`}
                >
                  {gradeLabel(g)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <SectionLabel icon="📝" text={`题目数量：${count} 道`} />
            <input
              type="range" min={5} max={20} value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="mt-3 w-full accent-brand-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>5 道（快速）</span>
              <span>20 道（全面）</span>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
          )}

          <button onClick={begin} disabled={busy} className="btn-primary mt-8 w-full py-3.5 text-base">
            {busy ? "正在组卷…" : "开始诊断"}
          </button>
        </div>
      </div>
    );
  }

  /* 答题阶段 */
  if (phase === "quiz") {
    const q = questions[current];
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">答题进度</span>
            <span className="text-slate-400">{answered}/{questions.length} 已作答</span>
          </div>
          <div className="bar-track mt-2">
            <div className="bar-fill" style={{ width: `${Math.max(3, (answered / questions.length) * 100)}%` }} />
          </div>
        </div>

        <QuestionCard
          key={q.id}
          q={q}
          index={current}
          total={questions.length}
          value={answers[q.id] ?? ""}
          onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
        />

        <div className="mt-5 flex items-center justify-between">
          <button
            className="btn-ghost"
            disabled={current === 0}
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          >
            上一题
          </button>
          {current < questions.length - 1 ? (
            <button className="btn-primary" onClick={() => setCurrent((c) => c + 1)}>
              下一题
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <button className="btn-accent" onClick={submit} disabled={busy}>
              {busy ? "判分中…" : "交卷"}
            </button>
          )}
        </div>
        {error && <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
      </div>
    );
  }

  /* 报告阶段 */
  if (report) {
    return (
      <div>
        <ReportView report={report} onRestart={() => setPhase("config")} />
        {result && (
          <div className="mt-4 text-center text-xs text-slate-400">
            本次得分 {result.score}/{result.maxScore}
          </div>
        )}
      </div>
    );
  }
  return null;
}

function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
      <span className="text-base">{icon}</span>
      {text}
    </div>
  );
}
