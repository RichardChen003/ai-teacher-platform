import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { UpdateProfileSchema } from "@aiteacher/shared";
import { getUser, ensureUserProfile, upsertUserProfile } from "../db";
import { getSessionUser } from "./auth";
import type { Env } from "../env";

/**
 * 个人中心：GET /api/me（档案）、PATCH /api/me（更新）
 * 依赖登录态：首次访问自动用 auth 用户建档（grade/subject 等默认空）
 */
export const meRoutes = new Hono<{ Bindings: Env }>()
  .get("/me", async (c) => {
    const session = await getSessionUser(c);
    if (!session) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    const profile = await ensureUserProfile(c, session.user);
    return c.json({ ok: true, data: profile });
  })
  .patch("/me", zValidator("json", UpdateProfileSchema), async (c) => {
    const session = await getSessionUser(c);
    if (!session) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);
    await ensureUserProfile(c, session.user);
    const patch = c.req.valid("json");
    const user = await upsertUserProfile(c, session.user.id, patch as Record<string, unknown>);
    return c.json({ ok: true, data: user });
  });
