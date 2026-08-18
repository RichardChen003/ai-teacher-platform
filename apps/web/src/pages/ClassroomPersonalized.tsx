import { useNavigate } from "react-router-dom";

const modes = [
  {
    key: "full",
    to: "/classroom/personalized/full",
    title: "完整教学大纲",
    tag: "系统全面",
    desc: "针对完整课程体系的教学大纲，按年级科目系统掌握全部重点知识点",
    emoji: "📖",
    gradient: "from-brand-500 to-brand-700",
  },
  {
    key: "remedial",
    to: "/classroom/personalized/remedial",
    title: "补弱提高大纲",
    tag: "查漏补缺",
    desc: "基于入测诊断，针对你的薄弱知识点进行针对性强化训练",
    emoji: "🎯",
    gradient: "from-violet-500 to-purple-700",
  },
];

export default function ClassroomPersonalized() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
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
          <h1 className="page-title">针对课程</h1>
          <p className="page-sub">选择一种大纲类型，量身定制你的学习路径</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => navigate(m.to)}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${m.gradient} p-8 text-left text-white shadow-[0_16px_40px_-16px_rgb(15_23_42/0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgb(15_23_42/0.5)]`}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 right-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
                {m.emoji}
              </div>
              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                {m.tag}
              </span>
            </div>

            <h2 className="relative mt-6 text-2xl font-bold tracking-tight">{m.title}</h2>
            <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-white/80">{m.desc}</p>

            <div className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold">
              进入
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
