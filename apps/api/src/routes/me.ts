import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { UpdateProfileSchema } from "@aiteacher/shared";
import { ensureUserProfile, upsertUserProfile, profileToApi } from "../db";
import { getSessionUser } from "./auth";
import type { Env } from "../env";

/**
 * 个人中心：GET /api/me（档案）、PATCH /api/me（更新）
 * 依赖登录态：首次访问自动用 auth 用户建档（grade/subject 等默认空）
 * 契约：camelCase（name/grade/subject/textbookVersion/goalDate/weeklyHours），db 层映射到 snake 列
 */
export const meRoutes = new Hono<{ Bindings: Env }>()
  .get("/me", async (c) => {
    const session = await getSessionUser(c);
    if (!session) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const profile = await ensureUserProfile(c, session.user);
    return c.json({ ok: true, data: profileToApi(profile as Record<string, unknown>) });
  })
  .patch("/me", zValidator("json", UpdateProfileSchema), async (c) => {
    const session = await getSessionUser(c);
    if (!session) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    await ensureUserProfile(c, session.user);
    const patch = c.req.valid("json") as Record<string, unknown>;
    const user = await upsertUserProfile(c, session.user.id, patch);
    return c.json({ ok: true, data: profileToApi(user as Record<string, unknown>) });
  });
