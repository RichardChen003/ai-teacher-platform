import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../env";
import { requireUserId } from "./auth";
import { buildQualityDeck, buildRevealDeck, renderQualityPptx, type Deck } from "../lib/qualityDeck";
import { resolveLessonPack, buildGenericDeck } from "../lib/lessonPacks";

/**
 * 知识点精品课 PPT 生成（独立于课时，供「完整教学大纲 → 学科知识点」入口使用）
 *  POST /api/knowledge-points/ppt    { subject, grade, name, children? }
 *     → 生成精品课 deck + PPTX，返回 deck（用于预览）与 pptxBase64（用于下载）
 */
const Schema = z.object({
  subject: z.string().default("math"),
  grade: z.coerce.number().int().min(7).max(12).default(7),
  name: z.string().min(1),
  children: z.array(z.string()).optional(),
});

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export const knowledgePptRoutes = new Hono<{ Bindings: Env }>().post(
  "/knowledge-points/ppt",
  zValidator("json", Schema),
  async (c) => {
    const userId = await requireUserId(c);
    if (!userId) return c.json({ ok: false, code: "UNAUTHORIZED", message: "请先登录" }, 401);

    const input = c.req.valid("json");
    const pack = resolveLessonPack(input.name) ?? buildGenericDeck({ ...input, children: input.children ?? [] });
    const deck: Deck = buildQualityDeck(pack);

    // 预览用原始 deck（答案点击揭晓）；下载用「答案单独一页」版（翻页揭晓）
    const revealDeck = buildRevealDeck(deck);
    const buf = await renderQualityPptx(revealDeck);
    return c.json({
      ok: true,
      data: {
        deck,
        slideCount: deck.slides.length,
        pptxBase64: arrayBufferToBase64(buf),
        filename: `${input.name}.pptx`,
      },
    });
  }
);
