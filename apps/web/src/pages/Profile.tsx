import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe, isDemoMode, setDemoMode } from "../lib/api";

export default function Profile() {
  const qc = useQueryClient();
  const demo = isDemoMode();
  const { data: me, isLoading } = useQuery({ queryKey: ["me"], queryFn: getMe, retry: false });
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (me) {
      const m = me as any;
      setForm({
        name: m.name ?? "",
        grade: String(m.grade ?? 7),
        subject: m.subject ?? "math",
        weeklyHours: String(m.weekly_hours ?? 4),
        goal: m.goal ?? "",
      });
    }
  }, [me]);

  const save = useMutation({
    mutationFn: () =>
      updateMe({
        name: form.name,
        grade: Number(form.grade),
        subject: form.subject,
        weekly_hours: Number(form.weeklyHours),
        goal: form.goal,
      }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });

  function exitDemo() {
    setDemoMode(false);
    window.location.href = "/login";
  }

  if (isLoading) return <div className="py-20 text-center text-sm text-slate-400">加载中…</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="page-head">
        <div>
          <h1 className="page-title">个人中心</h1>
          <p className="page-sub">管理你的学习档案与偏好</p>
        </div>
      </div>

      {/* 头像卡 */}
      <div className="card animate-fade-up flex items-center gap-5 p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-3xl shadow-lg">
          {(form.name || "同").slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold text-slate-800">{form.name || "未设置昵称"}</div>
          <div className="mt-0.5 text-sm text-slate-400">{String((me as any)?.email ?? "")}</div>
          {demo && <span className="badge-amber mt-2">演示模式 · 数据保存在本地</span>}
        </div>
        {demo && (
          <button className="btn-ghost text-xs" onClick={exitDemo}>退出演示</button>
        )}
      </div>

      {/* 学习档案 */}
      <div className="card animate-fade-up-1 p-6">
        <h3 className="font-semibold text-slate-800">学习档案</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">昵称</label>
            <input className="input" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="怎么称呼你" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">年级</label>
            <select className="input" value={form.grade ?? "7"} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
              {[7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>{g <= 9 ? `初中${g}年级` : `高中${g - 9}年级`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">主攻学科</label>
            <select className="input" value={form.subject ?? "math"} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              <option value="math">数学</option>
              <option value="physics">物理</option>
              <option value="chemistry">化学</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">每周可投入（小时）</label>
            <input className="input" type="number" min={1} max={20} value={form.weeklyHours ?? "4"} onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">学习目标</label>
            <textarea
              className="input resize-none" rows={2}
              value={form.goal ?? ""}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              placeholder="例如：期末数学成绩提升 20 分，函数与几何重点突破"
            />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button className="btn-primary" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "保存中…" : "保存档案"}
          </button>
          {saved && <span className="text-sm text-emerald-600">✓ 已保存</span>}
        </div>
      </div>

      {/* 关于 */}
      <div className="card animate-fade-up-2 p-6 text-xs leading-relaxed text-slate-400">
        <p className="font-medium text-slate-500">关于本平台</p>
        <p className="mt-2">
          AI 老师平台基于「入测诊断 → 专属大纲 → 数字人课堂 → 课后小测」学习闭环。
          MVP 演示模式下学习数据保存在本地环境，登录后可云端同步。
        </p>
      </div>
    </div>
  );
}
