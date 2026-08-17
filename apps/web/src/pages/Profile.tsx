import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe, isDemoMode, setDemoMode, signOut, changeEmail, changePassword } from "../lib/api";
import { useAuth } from "../lib/auth";
import { gradeLabel, ALL_GRADES } from "../lib/grade";

export default function Profile() {
  const qc = useQueryClient();
  const { setGuest } = useAuth();
  const demo = isDemoMode();
  const { data: me, isLoading } = useQuery({ queryKey: ["me"], queryFn: getMe, retry: false });
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // 账号与安全：改邮箱 / 改密码表单
  const [emailForm, setEmailForm] = useState({ newEmail: "" });
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (me) {
      const m = me as any;
      setForm({
        name: m.name ?? "",
        grade: String(m.grade ?? 7),
        subject: m.subject ?? "math",
        weeklyHours: String(m.weeklyHours ?? m.weekly_hours ?? 4),
        goal: m.goalDate ?? m.goal ?? "",
      });
      setEmailForm({ newEmail: m.email ?? "" });
    }
  }, [me]);

  const save = useMutation({
    mutationFn: () =>
      updateMe({
        name: form.name,
        grade: Number(form.grade),
        subject: form.subject,
        weeklyHours: Number(form.weeklyHours),
        goalDate: form.goal,
      }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: any) => {
      alert(`保存失败：${e?.message ?? "未知错误"}`);
    },
  });

  // 修改邮箱
  const saveEmail = useMutation({
    mutationFn: () => changeEmail(emailForm.newEmail.trim()),
    onSuccess: () => {
      setEmailMsg({ ok: true, text: "✓ 邮箱已更新" });
      qc.invalidateQueries({ queryKey: ["me"] });
      setTimeout(() => setEmailMsg(null), 3000);
    },
    onError: (e: any) => {
      setEmailMsg({ ok: false, text: `✗ ${e?.message ?? "修改邮箱失败"}` });
    },
  });

  // 修改密码
  const savePwd = useMutation({
    mutationFn: () => changePassword(pwdForm.currentPassword, pwdForm.newPassword),
    onSuccess: () => {
      setPwdMsg({ ok: true, text: "✓ 密码已修改，下次登录请使用新密码" });
      setPwdForm({ currentPassword: "", newPassword: "", confirm: "" });
      setTimeout(() => setPwdMsg(null), 4000);
    },
    onError: (e: any) => {
      setPwdMsg({ ok: false, text: `✗ ${e?.message ?? "修改密码失败"}` });
    },
  });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail.trim());
  const pwdRulesOk = pwdForm.newPassword.length >= 8 && pwdForm.newPassword.length <= 128;
  const pwdMatch = pwdForm.newPassword === pwdForm.confirm;
  const pwdSubmitable = !!pwdForm.currentPassword && pwdRulesOk && pwdMatch;

  function exitDemo() {
    setDemoMode(false);
    setGuest();
    window.location.href = "/login";
  }

  async function exitLogin() {
    setSigningOut(true);
    try {
      await signOut(); // 清除服务端会话（httpOnly cookie）
    } catch {
      // 即使 sign-out 接口失败也继续本地退出，避免卡死
    }
    setGuest();
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
        {demo ? (
          <button className="btn-ghost text-xs" onClick={exitDemo}>退出演示</button>
        ) : (
          <button className="btn-ghost text-xs" onClick={exitLogin} disabled={signingOut}>
            {signingOut ? "退出中…" : "退出登录"}
          </button>
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
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>{gradeLabel(g)}</option>
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

      {/* 账号与安全（仅真实账号；Demo 模式无此模块） */}
      {!demo && (
        <div className="card animate-fade-up-2 p-6">
          <h3 className="font-semibold text-slate-800">账号与安全</h3>
          <p className="mt-1 text-xs text-slate-400">修改登录邮箱与密码（需登录状态）</p>

          {/* 修改邮箱 */}
          <div className="mt-5 border-t border-slate-100 pt-5">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">登录邮箱</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <input
                className="input sm:max-w-xs"
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => { setEmailForm({ newEmail: e.target.value }); setEmailMsg(null); }}
                placeholder="you@example.com"
                autoComplete="off"
              />
              <button
                className="btn-primary shrink-0 sm:mt-0"
                onClick={() => saveEmail.mutate()}
                disabled={saveEmail.isPending || !emailValid || emailForm.newEmail.trim() === String((me as any)?.email ?? "")}
              >
                {saveEmail.isPending ? "保存中…" : "保存新邮箱"}
              </button>
            </div>
            {emailMsg && (
              <p className={`mt-2 text-xs ${emailMsg.ok ? "text-emerald-600" : "text-rose-500"}`}>{emailMsg.text}</p>
            )}
          </div>

          {/* 修改密码 */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">当前密码</label>
            <input
              className="input sm:max-w-xs"
              type="password"
              value={pwdForm.currentPassword}
              onChange={(e) => { setPwdForm({ ...pwdForm, currentPassword: e.target.value }); setPwdMsg(null); }}
              placeholder="输入当前密码"
              autoComplete="off"
            />
            <label className="mb-1.5 mt-4 block text-xs font-medium text-slate-500">新密码（8~128 位）</label>
            <input
              className="input sm:max-w-xs"
              type="password"
              value={pwdForm.newPassword}
              onChange={(e) => { setPwdForm({ ...pwdForm, newPassword: e.target.value }); setPwdMsg(null); }}
              placeholder="8~128 位，建议字母+数字"
              autoComplete="new-password"
            />
            <label className="mb-1.5 mt-4 block text-xs font-medium text-slate-500">确认新密码</label>
            <input
              className="input sm:max-w-xs"
              type="password"
              value={pwdForm.confirm}
              onChange={(e) => { setPwdForm({ ...pwdForm, confirm: e.target.value }); setPwdMsg(null); }}
              placeholder="再次输入新密码"
              autoComplete="new-password"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                className="btn-primary"
                onClick={() => savePwd.mutate()}
                disabled={savePwd.isPending || !pwdSubmitable}
              >
                {savePwd.isPending ? "保存中…" : "保存新密码"}
              </button>
              {!pwdRulesOk && pwdForm.newPassword.length > 0 && (
                <span className="text-xs text-rose-500">新密码需 8~128 位</span>
              )}
              {pwdRulesOk && !pwdMatch && pwdForm.confirm.length > 0 && (
                <span className="text-xs text-rose-500">两次密码不一致</span>
              )}
            </div>
            {pwdMsg && (
              <p className={`mt-2 text-xs ${pwdMsg.ok ? "text-emerald-600" : "text-rose-500"}`}>{pwdMsg.text}</p>
            )}
          </div>
        </div>
      )}

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
