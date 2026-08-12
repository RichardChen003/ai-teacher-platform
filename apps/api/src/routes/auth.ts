import { Hono } from "hono";
import type { Context } from "hono";
import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import type { Env } from "../env";

/**
 * 认证路由 —— Better Auth（Cloudflare D1 d1Native）
 *
 * 端点：
 *   POST /api/auth/sign-up/email    注册（邮箱+密码）
 *   POST /api/auth/sign-in/email    登录
 *   POST /api/auth/sign-out         登出
 *   GET  /api/auth/get-session      获取当前会话
 *
 * 说明：d1Native 模式无需 Drizzle/Kysely；auth_* 表见 infra/d1/schema.sql
 */
export function createAuth(env: Env, origin: string) {
  return betterAuth(
    withCloudflare(
      {
        d1Native: env.DB,
        kv: env.KV,
        // SDK 版本要求 `cf` 选项存在（否则配置阶段同步抛错）。
        // 这里传占位对象满足检查；本平台不依赖地理位置/IP 追踪，
        // 且 auth_session 表无 geolocation 列，故关闭两个 tracking 以兼容现有表结构。
        cf: {},
        autoDetectIpAddress: false,
        geolocationTracking: false,
      },
      {
        secret: env.BETTER_AUTH_SECRET ?? "dev-secret-change-me",
        baseURL: origin,
        // 表名映射：数据库 schema 使用 auth_ 前缀（infra/d1/schema.sql），
        // Better Auth 默认表名为 user/session/account/verification，必须显式映射。
        user: { modelName: "auth_user" },
        account: { modelName: "auth_account" },
        verification: { modelName: "auth_verification" },
        emailAndPassword: { enabled: true },
        session: {
          modelName: "auth_session",
          expiresIn: 60 * 60 * 24 * 7, // 7 天
          updateAge: 60 * 60 * 24,     // 每天滑动续期
        },
      }
    )
  );
}

export const authRoutes = new Hono<{ Bindings: Env }>().all("*", async (c) => {
  const origin = new URL(c.req.url).origin;
  const auth = createAuth(c.env, origin);
  return auth.handler(c.req.raw);
});

/** 从请求解析当前会话（供业务路由鉴权）；Demo 模式下降级为演示用户 */
export async function getSessionUser(
  c: Context<{ Bindings: Env }>
): Promise<{ user: { id: string; email: string; name: string } } | null> {
  const origin = new URL(c.req.url).origin;
  const auth = createAuth(c.env, origin);
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (session) return session;
  } catch {
    // 会话解析失败时继续走 Demo 降级，不阻断体验
  }
  // 免登录演示模式：前端带 x-demo: 1（生产 DEMO_MODE 未开启时自动关闭，无安全风险）
  if (c.env.DEMO_MODE === "true" && c.req.header("x-demo") === "1") {
    return { user: { id: "demo_user", email: "demo@local.dev", name: "演示同学" } };
  }
  return null;
}

/** 业务路由快捷鉴权：返回 userId 或 null（调用方返回 401） */
export async function requireUserId(c: Context<{ Bindings: Env }>): Promise<string | null> {
  const session = await getSessionUser(c);
  return session?.user.id ?? null;
}
