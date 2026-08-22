// 存储兼容层：PPT_ASSETS（R2）不可用时降级到 KV（免费额度内课件存储）
// 未来账号启用 R2 后，恢复 wrangler.toml 的 r2_buckets 绑定即可，此层自动切回 R2
import type { Env } from "../env";

export type StoredObject = {
  arrayBuffer(): Promise<ArrayBuffer>;
  json<T = unknown>(): Promise<T>;
  text(): Promise<string>;
  body?: ReadableStream;
  httpMetadata?: { contentType?: string };
};

export async function storageGet(env: Env, key: string): Promise<StoredObject | null> {
  if (env.PPT_ASSETS) {
    return env.PPT_ASSETS.get(key) as Promise<StoredObject | null>;
  }
  const res = await env.KV.getWithMetadata<{ contentType?: string }>(key, { type: "arrayBuffer" });
  if (res.value === null) return null;
  const buf = res.value as ArrayBuffer;
  return {
    arrayBuffer: async () => buf,
    json: async () => JSON.parse(new TextDecoder().decode(buf)),
    text: async () => new TextDecoder().decode(buf),
    body: new Blob([buf]).stream(),
    httpMetadata: res.metadata as { contentType?: string } | undefined,
  };
}

export async function storagePut(
  env: Env,
  key: string,
  value: string | ArrayBuffer,
  contentType?: string
): Promise<void> {
  if (env.PPT_ASSETS) {
    await env.PPT_ASSETS.put(key, value as any, contentType ? { httpMetadata: { contentType } } : undefined);
    return;
  }
  await env.KV.put(key, value as any, contentType ? { metadata: { contentType } } : undefined);
}
