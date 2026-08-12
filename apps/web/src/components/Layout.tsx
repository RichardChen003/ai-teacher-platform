import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { isDemoMode } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../lib/api";

const nav = [
  {
    to: "/",
    label: "工作台",
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    to: "/diagnosis",
    label: "入测诊断",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    to: "/syllabus",
    label: "教学大纲",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
      </svg>
    ),
  },
  {
    to: "/classroom",
    label: "AI 课堂",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "个人中心",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_4px_12px_-2px_rgb(43_83_223/0.5)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      </div>
      <div>
        <div className="text-[15px] font-bold leading-tight text-slate-900">AI 老师</div>
        <div className="text-[11px] font-medium text-slate-400">个性化学习平台</div>
      </div>
    </div>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const demo = isDemoMode();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe, retry: false });

  return (
    <div className="flex min-h-screen">
      {/* 侧边栏 */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-slate-200/70 bg-white/85 backdrop-blur">
        <Logo />
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-brand-50 to-brand-100/60 text-brand-700 shadow-[inset_0_0_0_1px_rgb(43_83_223/0.08)]"
                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 p-3.5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              {demo ? "演示模式" : me ? String((me as any).name ?? "同学") : "未登录"}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              {demo
                ? "免登录体验全部功能，数据存在本地"
                : "学习进度实时同步，加油！"}
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-2 w-full rounded-lg bg-white/80 py-1.5 text-[11px] font-medium text-brand-600 transition hover:bg-white"
            >
              查看个人中心
            </button>
          </div>
        </div>
      </aside>

      {/* 主区域 */}
      <div className="ml-60 flex-1">
        <main className="mx-auto max-w-5xl px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
