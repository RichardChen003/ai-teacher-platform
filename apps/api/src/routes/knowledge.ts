import { Hono } from "hono";
import { listKnowledgePoints } from "../db";
import type { Env } from "../env";

/** 知识点图谱：GET /api/knowledge-tree?subject=math&stage=初中 */
export const knowledgeRoutes = new Hono<{ Bindings: Env }>().get("/knowledge-tree", async (c) => {
  const subject = c.req.query("subject");
  const stage = c.req.query("stage");
  const res = await listKnowledgePoints(c, subject, stage);
  return c.json({ ok: true, data: res.results ?? [] });
});
