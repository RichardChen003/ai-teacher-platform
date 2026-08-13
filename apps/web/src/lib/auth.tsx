// 认证状态管理（前端）：判断登录态，供路由守卫使用
// - authed: 已登录（真实会话 cookie 或 Demo 标记生效）
// - guest:  未登录
// - loading: 首次请求 /api/me 中
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getMe } from "./api";

type AuthStatus = "loading" | "authed" | "guest";

const AuthContext = createContext<{
  status: AuthStatus;
  setAuthed: () => void;
  setGuest: () => void;
}>({ status: "loading", setAuthed: () => {}, setGuest: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");

  const check = useCallback(async () => {
    try {
      await getMe(); // 带 credentials，真实会话或 Demo 标记任一有效即可通过
      setStatus("authed");
    } catch (e: any) {
      // 401（无会话）→ guest；其他错误（如后端未启动）也按 guest 处理，避免暴露受保护页
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const setAuthed = useCallback(() => setStatus("authed"), []);
  const setGuest = useCallback(() => setStatus("guest"), []);

  return (
    <AuthContext.Provider value={{ status, setAuthed, setGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
