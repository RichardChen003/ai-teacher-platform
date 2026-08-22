import { Hono } from "hono";
import type { Env } from "../env";
import { storageGet } from "../lib/storage";

/**
 * 生成资产（PPT / 音频）
 *  GET /api/assets/:id             资产状态与元信息
 *  GET /api/assets/:id/download    R2 签名 URL（PPTX / 音频流）
 */
export const assetsRoutes = new Hono<{ Bindings: Env }>()
  .get("/assets/:id", async (c) => {
    const asset = await c.env.DB.prepare("SELECT * FROM assets WHERE id = ?").bind(c.req.param("id")).first();
    if (!asset) return c.json({ ok: false, code: "NOT_FOUND", message: "资产不存在" }, 404);
    return c.json({
      ok: true,
      data: {
        id: asset.id,
        kind: asset.kind,
        status: asset.status,
        meta: asset.meta ? JSON.parse(String(asset.meta)) : undefined,
        error: asset.error,
      },
    });
  })
  .get("/assets/:id/download", async (c) => {
    const asset = await c.env.DB.prepare("SELECT * FROM assets WHERE id = ?").bind(c.req.param("id")).first();
    if (!asset) return c.json({ ok: false, code: "NOT_FOUND", message: "资产不存在" }, 404);
    if (asset.status !== "ready") {
      return c.json({ ok: false, code: "NOT_READY", message: "资产尚未生成完成" }, 409);
    }
    // MVP：同域 Worker 直接流式返回存储对象（无需签名 URL，且更安全）
    const obj = await storageGet(c.env, String(asset.r2_key));
    if (!obj) return c.json({ ok: false, code: "NOT_FOUND", message: "文件不存在" }, 404);
    if (!obj.body) return c.json({ ok: false, code: "EMPTY", message: "文件为空" }, 500);
    const ext = String(asset.kind) === "pptx" ? "pptx" : "bin";
    return new Response(obj.body, {
      headers: {
        "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${String(asset.id)}.${ext}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  });
