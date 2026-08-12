import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateSyllabus, getActiveSyllabus, type Syllabus } from "../lib/api";

const statusMap: Record<string, { text: string; cls: string }> = {
  pending: { text: "待学习", cls: "badge-slate" },
  prepared: { text: "可上课", cls: "badge-blue" },
  delivered: { text: "已完成", cls: "badge-green" },
};

export default function SyllabusPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showConfig, setShowConfig] = useState(false);
  const [hours, setHours] = useState(4);
  const [weeks, setWeeks] = useState(4);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { data: syllabus, isLoading } = useQuery({
    queryKey: ["syllabus-active"],
    queryFn: () => getActiveSyllabus("math"),
    retry: false,
  });

  const gen = useMutation({
    mutationFn: () => generateSyllabus({ subject: "math", grade: 7, hoursPerWeek: hours, weeks }),
    onSuccess: (data) => {
      qc.setQueryData(["syllabus-active"], data);
      setShowConfig(false);
    },
    onError: (e: any) => setError(e.message ?? "生成失败"),
  });

  const doneCount = syllabus?.lessons.filter((l) => l.status === "delivered").length ?? 0;
  const total = syllabus?.lessons.length ?? 0;
  const progress = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="page-head">
        <div>
          <h1 className="page-title">教学大纲</h1>
          <p className="page-sub">基于诊断结果定制的专属学习路径</p>
        </div>
        {syllabus ? (
          <button className="btn-soft" onClick={() => setShowConfig((v) => !v)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            调整计划
          </button>
        ) : null}
      </div>

      {isLoading && <div className="py-20 text-center text-sm text-slate-400">加载中…</div>}

      {/* 未生成时：引导生成 */}
      {!isLoading && !syllabus && (
        <div className="card animate-fade-up mx-auto max-w-xl p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-500 text-3xl shadow-lg">
            🗺️
          </div>
          <h2 className="mt-5 text-lg font-bold text-slate-800">还没有专属大纲</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            完成入测诊断后，我会根据你的掌握情况生成一份针对薄弱知识点的教学大纲。
            也可以直接按你的时间安排生成。
          </p>
          {!showConfig ? (
            <button className="btn-accent mt-6" onClick={() => setShowConfig(true)}>立即生成大纲</button>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">每周学习</span>
                <span className="text-sm font-bold text-brand-600">{hours} 小时</span>
              </div>
              <input type="range" min={1} max={10} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-2 w-full accent-brand-600" />
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">计划周期</span>
                <span className="text-sm font-bold text-brand-600">{weeks} 周</span>
              </div>
              <input type="range" min={1} max={12} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className="mt-2 w-full accent-brand-600" />
              {error && <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</div>}
              <button className="btn-primary mt-5 w-full" onClick={() => gen.mutate()} disabled={gen.isPending}>
                {gen.isPending ? "生成中…" : "生成大纲"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 已生成：总览 + 课时时间线 */}
      {syllabus && (
        <>
          {/* 总览卡片 */}
          <div className="card animate-fade-up relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-50 blur-xl" />
            <div className="relative flex flex-wrap items-center gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">初中数学 · 专属计划</h2>
                  <span className="badge-green">进行中</span>
                </div>
                <p className="mt-1.5 text-sm text-slate-500">{syllabus.structure.goal}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>共 <b className="text-slate-600">{total}</b> 课时</span>
                  <span>每周 <b className="text-slate-600">{syllabus.structure.hoursPerWeek}</b> 小时</span>
                  <span>周期 <b className="text-slate-600">{syllabus.structure.weeks}</b> 周</span>
                  <span>已完成 <b className="text-emerald-600">{doneCount}</b> 节</span>
                </div>
              </div>
              <div className="w-40">
                <div className="flex items-end justify-between text-xs">
                  <span className="text-slate-400">总体进度</span>
                  <span className="font-bold text-brand-600">{progress}%</span>
                </div>
                <div className="bar-track mt-2">
                  <div className="bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* 课时列表 */}
          <div className="card animate-fade-up-1 p-6">
            <h3 className="font-semibold text-slate-800">课时安排</h3>
            <div className="mt-4 space-y-2">
              {syllabus.lessons.map((l, i) => {
                const st = statusMap[l.status] ?? statusMap.pending;
                const canStudy = l.status === "prepared" || l.status === "pending";
                return (
                  <div
                    key={l.id}
                    className={`group flex items-center gap-4 rounded-xl border p-4 transition-all ${
                      canStudy
                        ? "border-slate-100 hover:border-brand-200 hover:bg-brand-50/40"
                        : "border-slate-100 bg-slate-50/60"
                    }`}
                  >
                    {/* 序号 */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        l.status === "delivered"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-gradient-to-br from-brand-500 to-brand-600 text-white"
                      }`}
                    >
                      {l.status === "delivered" ? "✓" : String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-800">第{i + 1}课 · {l.title}</span>
                        <span className={st.cls}>{st.text}</span>
                      </div>
                      <div className="mt-1 truncate text-xs text-slate-400">
                        {l.objectives.join("；") || `约 ${l.durationMin} 分钟`}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="badge-slate">~{l.durationMin} 分钟</span>
                      {canStudy && (
                        <button className="btn-primary px-3.5 py-2 text-xs" onClick={() => navigate(`/classroom?lesson=${l.id}`)}>
                          进入课堂
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
