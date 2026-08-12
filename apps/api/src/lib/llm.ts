// ============================================================
// LLM 接入层（可插拔）：DeepSeek（OpenAI 兼容）→ 未来可切 AI Gateway
// 设计原则：
//  - 无 LLM_API_KEY 时所有函数返回 null，调用方回退规则引擎（平台可离线跑通）
//  - 所有调用记录 ai_logs（用量/成本审计）
//  - 结构化输出用 JSON mode + Zod 校验，失败重试一次后放弃（回退规则）
// ============================================================
import type { Env } from "../env";
import { newId } from "../db";

export type LlmMessage = { role: "system" | "user" | "assistant"; content: string };

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

/** 基础对话调用：返回文本；无 key / 网络失败 / 非 2xx → null */
export async function chatText(
  env: Env,
  opts: { system: string; user: string; maxTokens?: number; temperature?: number }
): Promise<string | null> {
  const key = env.LLM_API_KEY;
  if (!key) return null;
  const model = env.LLM_MODEL || "deepseek-chat";
  const started = Date.now();
  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.7,
        stream: false,
      }),
    });
    if (!res.ok) {
      console.error(`[llm] ${model} HTTP ${res.status}:`, (await res.text()).slice(0, 300));
      await logUsage(env, model, "chat", 0, 0, started, "failed");
      return null;
    }
    const data: any = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    await logUsage(
      env, model, "chat",
      data?.usage?.prompt_tokens ?? 0, data?.usage?.completion_tokens ?? 0, started, "ok"
    );
    return text || null;
  } catch (e) {
    console.error("[llm] chatText error:", String(e).slice(0, 300));
    await logUsage(env, model, "chat", 0, 0, started, "error");
    return null;
  }
}

/**
 * 结构化输出调用：要求模型返回 JSON 并用 schema 校验。
 * 返回校验后的对象；任何失败（无 key/解析失败/校验失败/两次尝试均失败）→ null
 */
export async function chatJSON<T>(
  env: Env,
  opts: { system: string; user: string; schema: { safeParse: (x: unknown) => { success: boolean; data?: T; error?: unknown } }; maxTokens?: number }
): Promise<T | null> {
  const key = env.LLM_API_KEY;
  if (!key) return null;
  const model = env.LLM_MODEL || "deepseek-chat";
  const started = Date.now();

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: `${opts.system}\n\n必须只输出一个合法的 JSON 对象，不要包含任何其他文字、代码块标记或解释。` },
            { role: "user", content: opts.user },
          ],
          max_tokens: opts.maxTokens ?? 2048,
          temperature: 0.4,
          response_format: { type: "json_object" },
          stream: false,
        }),
      });
      if (!res.ok) {
        console.error(`[llm] ${model} JSON HTTP ${res.status}:`, (await res.text()).slice(0, 200));
        continue;
      }
      const data: any = await res.json();
      const raw: string = data?.choices?.[0]?.message?.content ?? "";
      await logUsage(
        env, model, "json",
        data?.usage?.prompt_tokens ?? 0, data?.usage?.completion_tokens ?? 0, started,
        raw ? "ok" : "empty"
      );
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      const checked = opts.schema.safeParse(parsed);
      if (checked.success) return checked.data as T;
      console.error(`[llm] JSON schema 校验失败 (attempt ${attempt + 1}):`, String(checked.error ?? "unknown").slice(0, 200));
    } catch (e) {
      console.error(`[llm] chatJSON error (attempt ${attempt + 1}):`, String(e).slice(0, 200));
      await logUsage(env, model, "json", 0, 0, started, "error");
    }
  }
  return null;
}

/** 记 ai_logs（成本估算：入 ¥2/M、出 ¥3/M → 单位 cents，1 元 = 100 分） */
async function logUsage(
  env: Env, model: string, action: string,
  promptTokens: number, completionTokens: number,
  startedAt: number, status: string
) {
  try {
    const costCents = Math.round((promptTokens / 1e6) * 200 + (completionTokens / 1e6) * 300);
    await env.DB.prepare(
      `INSERT INTO ai_logs (id, action, model, prompt_tokens, completion_tokens, cost_cents, latency_ms, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
      .bind(newId("ail"), action, model, promptTokens, completionTokens, costCents, Date.now() - startedAt, status)
      .run();
  } catch { /* 日志失败不影响主流程 */ }
}
