import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./env";
import { healthRoutes } from "./routes/health";
import { authRoutes } from "./routes/auth";
import { meRoutes } from "./routes/me";
import { diagnosisRoutes } from "./routes/diagnosis";
import { knowledgeRoutes } from "./routes/knowledge";
import { syllabusRoutes } from "./routes/syllabus";
import { lessonsRoutes } from "./routes/lessons";
import { assetsRoutes } from "./routes/assets";
import { chatRoutes } from "./routes/chat";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
// 生产：CORS 白名单收紧（同域部署时前端与 API 同源，CORS 主要服务本地开发）
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// 路由挂载（全部为 /api 前缀）
app.route("/api", healthRoutes);
app.route("/api/auth", authRoutes);
app.route("/api", meRoutes);
app.route("/api", diagnosisRoutes);
app.route("/api", knowledgeRoutes);
app.route("/api", syllabusRoutes);
app.route("/api", lessonsRoutes);
app.route("/api", assetsRoutes);
app.route("/api", chatRoutes);

// 全局错误处理：统一 { ok:false, code, message }
app.onError((err, c) => {
  console.error("[error]", err);
  return c.json(
    { ok: false, code: "INTERNAL", message: err.message ?? "服务器内部错误" },
    500
  );
});

app.notFound((c) => c.json({ ok: false, code: "NOT_FOUND", message: "接口不存在" }, 404));

export default app;
