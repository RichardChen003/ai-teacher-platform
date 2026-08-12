import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">注册</h1>
      <p className="mt-1 text-sm text-slate-500">注册后先做一次入测诊断，AI 老师为你定制专属学习方案</p>
      <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="姓名/昵称"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <input
          type="email"
          placeholder="邮箱"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <input
          type="password"
          placeholder="密码（至少 8 位）"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <label className="flex items-start gap-2 text-xs text-slate-500">
          <input type="checkbox" className="mt-0.5" />
          <span>
            我已阅读并同意《用户协议》《隐私政策》，且本人或监护人确认：本平台为学习辅助工具，
            使用 AI 生成内容需在监护人指导下使用。
          </span>
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          注册
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        已有账号？{" "}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          去登录
        </Link>
      </p>
      <p className="mt-6 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
        未成年人注册将触发监护人确认流程（上线合规项，见 docs/01-技术方案.md §9）。
      </p>
    </div>
  );
}
