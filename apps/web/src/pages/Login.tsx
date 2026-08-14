import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp, setDemoMode } from "../lib/api";
import { useAuth } from "../lib/auth";

/* ---------- 注册规则（与后端 Better Auth 配置保持一致） ---------- */
const RULES = {
  name: { min: 2, max: 20 },       // 昵称 2~20 字符
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // 合法邮箱格式
  password: { min: 8, max: 128 },  // 密码 8~128 位（不强制数字+字母，但建议混合）
};

function nameValid(v: string) {
  const len = v.trim().length;
  return len >= RULES.name.min && len <= RULES.name.max;
}
function emailValid(v: string) {
  return RULES.email.test(v);
}
function passwordValid(v: string) {
  return v.length >= RULES.password.min && v.length <= RULES.password.max;
}

export default function Login() {
  const navigate = useNavigate();
  const { setAuthed } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // refs：用于清除浏览器自动填充残留（受控组件与 autofill 不同步）
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // 挂载后清除浏览器自动填充留下的 DOM 值，确保初始输入框空白
  useEffect(() => {
    const t = setTimeout(() => {
      if (nameRef.current) nameRef.current.value = "";
      if (emailRef.current) emailRef.current.value = "";
      if (passwordRef.current) passwordRef.current.value = "";
    }, 60);
    return () => clearTimeout(t);
  }, []);

  const isSignup = mode === "signup";
  // 注册模式下前端预校验（不符合则不允许提交）
  const formValid =
    !isSignup ||
    (nameValid(name) && emailValid(email) && passwordValid(password));
  const showNameHint = isSignup && name.length > 0 && !nameValid(name);
  const showEmailHint = email.length > 0 && !emailValid(email);
  const showPwdHint = isSignup && password.length > 0 && !passwordValid(password);

  async function submit() {
    if (!formValid) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
      setAuthed();
      navigate("/");
    } catch (e: any) {
      setError(e.message ?? "操作失败");
    }
    setBusy(false);
  }

  function enterDemo() {
    setDemoMode(true);
    setAuthed();
    navigate("/");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50 p-4">
      {/* 装饰光斑 */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-200/40 blur-3xl" />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_64px_-24px_rgb(15_23_42/0.3)] lg:grid-cols-2">
        {/* 左侧品牌区 */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-10 text-white lg:flex">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold">AI 老师</div>
              <div className="text-xs text-brand-200">个性化学习平台</div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-snug">
              每个孩子，
              <br />
              都值得一位专属老师。
            </h1>
            <ul className="mt-6 space-y-3 text-sm text-brand-100">
              {[
                ["🧭", "入测诊断，精准定位薄弱知识点"],
                ["🗺️", "AI 定制专属教学大纲"],
                ["👩‍🏫", "数字人老师真人式讲解"],
                ["📈", "课后小测，动态调整学习计划"],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-brand-200/80">学习闭环：诊断 → 大纲 → 课堂 → 小测</p>
        </div>

        {/* 右侧表单区 */}
        <div className="p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">AI 老师</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            {mode === "signin" ? "欢迎回来 👋" : "创建你的学习档案"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {mode === "signin" ? "登录后继续你的学习进度" : "注册后即可开始专属学习"}
          </p>

          <div className="mt-6 space-y-3.5">
            {isSignup && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">昵称</label>
                <input
                  ref={nameRef}
                  className="input"
                  placeholder="2~20 个字符，如：小明"
                  autoComplete="off"
                  name="aiteacher-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className={`mt-1 text-[11px] ${showNameHint ? "text-rose-500" : "text-slate-400"}`}>
                  {showNameHint ? `昵称需 ${RULES.name.min}~${RULES.name.max} 个字符（当前 ${name.trim().length} 个）` : "昵称：2~20 个字符，可用中文、字母、数字"}
                </p>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">邮箱</label>
              <input
                ref={emailRef}
                className="input"
                type="email"
                placeholder="you@example.com"
                autoComplete="off"
                name="aiteacher-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className={`mt-1 text-[11px] ${showEmailHint ? "text-rose-500" : "text-slate-400"}`}>
                {showEmailHint ? "邮箱格式不正确，请检查（示例：name@example.com）" : "邮箱：格式需为 xxx@xxx.xxx"}
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">密码</label>
              <input
                ref={passwordRef}
                className="input"
                type="password"
                placeholder="至少 8 位"
                autoComplete="new-password"
                name="aiteacher-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className={`mt-1 text-[11px] ${showPwdHint ? "text-rose-500" : "text-slate-400"}`}>
                {showPwdHint
                  ? `密码需 ${RULES.password.min}~${RULES.password.max} 位（当前 ${password.length} 位）`
                  : "密码：8~128 位，建议字母+数字组合（不强制）"}
              </p>
            </div>
            {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
            <button className="btn-primary w-full py-3" onClick={submit} disabled={busy || !formValid || !email || !password}>
              {busy ? "请稍候…" : isSignup ? "注册" : "登录"}
            </button>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-300">
            <div className="h-px flex-1 bg-slate-100" />
            或
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <button
            onClick={enterDemo}
            className="w-full rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 py-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
          >
            ⚡ 快速体验 Demo（免登录）
          </button>

          <p className="mt-5 text-center text-xs text-slate-400">
            {mode === "signin" ? "还没有账号？" : "已有账号？"}
            <button
              className="ml-1 font-medium text-brand-600 hover:underline"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            >
              {mode === "signin" ? "立即注册" : "去登录"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
