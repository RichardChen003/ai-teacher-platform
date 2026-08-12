import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getActiveSyllabus, getMe } from "../lib/api";

function HeroBanner({ name }: { name: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-8 text-white shadow-[0_16px_40px_-16px_rgb(33_56_166/0.6)]">
      {/* 装饰 */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 right-24 h-52 w-52 rounded-full bg-accent-400/25 blur-2xl" />
      <svg className="pointer-events-none absolute right-8 top-6 h-24 w-24 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>

      <div className="relative z-10">
        <span className="badge bg-white/15 text-white">专属 1v1 AI 辅导</span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          {name}，欢迎回来 👋
        </h1>
        <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-brand-100">
          我会先为你做一次入测诊断，找到薄弱知识点，然后生成专属教学大纲，
          由数字人老师陪你完成每一节课。
        </p>
      </div>
    </div>
  );
}

const steps = [
  {
    to: "/diagnosis",
    title: "入测诊断",
    desc: "15 分钟摸清你的知识掌握情况",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    color: "from-brand-500 to-brand-600",
    step: "01",
  },
  {
    to: "/syllabus",
    title: "生成大纲",
    desc: "基于诊断结果定制专属学习路径",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
      </svg>
    ),
    color: "from-accent-400 to-accent-500",
    step: "02",
  },
  {
    to: "/classroom",
    title: "AI 课堂",
    desc: "数字人老师讲解课件，随时提问",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    color: "from-violet-500 to-purple-600",
    step: "03",
  },
  {
    to: "/classroom",
    title: "课后小测",
    desc: "检验学习效果，动态调整下一步",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
      </svg>
    ),
    color: "from-emerald-500 to-teal-600",
    step: "04",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe, retry: false });
  const { data: syllabus } = useQuery({
    queryKey: ["syllabus-active"],
    queryFn: () => getActiveSyllabus("math"),
    retry: false,
  });

  const name = demoName(me);
  const doneLessons = syllabus?.lessons.filter((l) => l.status === "delivered").length ?? 0;
  const totalLessons = syllabus?.lessons.length ?? 0;
  const progress = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      <HeroBanner name={name} />

      {/* 统计行 */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="学习进度" value={totalLessons ? `${progress}%` : "—"} hint={totalLessons ? `${doneLessons}/${totalLessons} 课时` : "先完成诊断"} gradient="from-brand-500 to-brand-600" />
        <StatCard label="大纲状态" value={syllabus ? "已生成" : "未生成"} hint={syllabus ? "可继续学习" : "诊断后生成"} gradient="from-accent-400 to-accent-500" />
        <StatCard label="当前阶段" value={totalLessons ? "学习中" : "待诊断"} hint={totalLessons ? "保持节奏" : "从入测开始"} gradient="from-emerald-500 to-teal-600" />
      </div>

      {/* 学习闭环 */}
      <div>
        <div className="page-head">
          <div>
            <h2 className="page-title">学习闭环</h2>
            <p className="page-sub">诊断 → 大纲 → 课堂 → 小测，每一步都在进步</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {steps.map((s, i) => (
            <button
              key={s.title}
              onClick={() => navigate(s.to)}
              className={`card group relative overflow-hidden p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgb(15_23_42/0.25)] animate-fade-up-${i % 4}`}
            >
              <span className="absolute right-4 top-3 text-3xl font-black text-slate-100 transition-colors group-hover:text-brand-50">
                {s.step}
              </span>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                {s.icon}
              </div>
              <div className="mt-4 font-semibold text-slate-800">{s.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                去看看
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 最近动态 */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">学习动态</h3>
          <span className="badge-blue">实时更新</span>
        </div>
        <div className="mt-4 space-y-3">
          {!totalLessons ? (
            <EmptyHint text="还没有学习记录，去完成第一次入测诊断吧" onClick={() => navigate("/diagnosis")} cta="开始诊断" />
          ) : (
            <>
              <TimelineDot done title="入测诊断完成" desc="知识掌握度画像已生成" />
              <TimelineDot done={doneLessons > 0} title="教学大纲生成" desc={`共 ${totalLessons} 节课，针对薄弱知识点定制`} />
              <TimelineDot done={doneLessons > 0} title="课堂学习进行中" desc={`已完成 ${doneLessons} 节课`} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function demoName(me: unknown): string {
  const n = (me as any)?.name;
  if (n) return String(n);
  return "同学";
}

function StatCard({ label, value, hint, gradient }: { label: string; value: string; hint: string; gradient: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${gradient} opacity-90`} />
      <div className="min-w-0">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="truncate text-lg font-bold text-slate-800">{value}</div>
        <div className="truncate text-[11px] text-slate-400">{hint}</div>
      </div>
    </div>
  );
}

function TimelineDot({ done, title, desc }: { done: boolean; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full ${done ? "bg-emerald-500" : "bg-slate-200"}`}>
        {done && (
          <svg viewBox="0 0 20 20" fill="white" className="h-2.5 w-2.5">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div>
        <div className={`text-sm font-medium ${done ? "text-slate-800" : "text-slate-400"}`}>{title}</div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
    </div>
  );
}

function EmptyHint({ text, onClick, cta }: { text: string; onClick: () => void; cta: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 py-8 text-center">
      <p className="text-sm text-slate-500">{text}</p>
      <button onClick={onClick} className="btn-primary mt-4">{cta}</button>
    </div>
  );
}
