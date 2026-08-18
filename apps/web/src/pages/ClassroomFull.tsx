import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { knowledgePoints } from "../lib/knowledgePoints";

// 年级/科目写法沿用「入测诊断」页：学科 数学/物理/化学，年级 初7~初9、高1~高2
const subjects = [
  { key: "math", label: "数学", emoji: "📐" },
  { key: "physics", label: "物理", emoji: "⚛️" },
  { key: "chemistry", label: "化学", emoji: "🧪" },
];

const grades = [7, 8, 9, 10, 11];

function gradeLabel(g: number) {
  return g <= 9 ? `初${g}` : `高${g - 9}`;
}

export default function ClassroomFull() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("math");
  const [grade, setGrade] = useState(7);

  const subjectLabel = subjects.find((s) => s.key === subject)?.label ?? subject;
  const points = knowledgePoints[subject]?.[grade] ?? [];

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z"
            clipRule="evenodd"
          />
        </svg>
        返回
      </button>

      <div className="page-head">
        <div>
          <h1 className="page-title">完整教学大纲</h1>
          <p className="page-sub">按年级与科目浏览完整课程的重点知识点</p>
        </div>
      </div>

      {/* 上：年级 + 科目导航栏 */}
      <div className="card animate-fade-up p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="text-base">📘</span> 选择学科
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {subjects.map((s) => (
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

        <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="text-base">🎓</span> 选择年级
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {grades.map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
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

      {/* 下：重点知识点 */}
      {points.length > 0 ? (
        <div className="card animate-fade-up-1 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">
              {subjectLabel} · {gradeLabel(grade)} 重点知识点
            </h3>
            <span className="badge-blue">共 {points.length} 个</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {points.map((p, i) => (
              <button
                key={p.name}
                onClick={() => navigate(`/classroom/personalized/full/${subject}/${grade}/${i}`)}
                className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-left transition hover:border-brand-200 hover:bg-brand-50/40"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-xs font-bold text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-800">{p.name}</div>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand-500">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="mt-0.5 text-xs leading-relaxed text-slate-400">{p.children.join(" · ")}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card flex flex-col items-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <div className="text-4xl">🔍</div>
          <h3 className="mt-4 font-semibold text-slate-700">该年级暂未开设此学科</h3>
          <p className="mt-1.5 text-sm text-slate-500">
            「{subjectLabel} · {gradeLabel(grade)}」暂无知识点，请选择其他学科或年级
          </p>
        </div>
      )}
    </div>
  );
}
