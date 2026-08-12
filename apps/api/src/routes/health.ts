import { Hono } from "hono";
import type { Env } from "../env";

export const healthRoutes = new Hono<{ Bindings: Env }>()
  .get("/health", (c) =>
    c.json({
      ok: true,
      service: "ai-teacher-api",
      version: "0.1.0",
      time: new Date().toISOString(),
    })
  )
  // 根路径返回服务信息（静态资源由 assets 处理，这里兜底）
  .get("/", (c) =>
    c.json({
      ok: true,
      name: c.env.APP_NAME,
      docs: "/api/health",
    })
  );
