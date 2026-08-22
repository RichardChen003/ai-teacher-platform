// Worker 环境绑定类型（与 wrangler.toml 对应）
export type Env = {
  // 数据
  DB: D1Database;
  // PPT_ASSETS 可为空：R2 未启用时降级用 KV（见 lib/storage.ts）
  PPT_ASSETS?: R2Bucket;
  AVATAR_ASSETS?: R2Bucket;
  UPLOADS?: R2Bucket;
  KV: KVNamespace;
  // 队列（暂未启用，保留类型）
  QUEUE_PPT?: Queue<unknown>;
  QUEUE_SYLLABUS?: Queue<unknown>;
  QUEUE_QUIZ?: Queue<unknown>;
  QUEUE_TTS?: Queue<unknown>;
  // 变量
  APP_NAME: string;
  LLM_PROVIDER: string;
  LLM_MODEL: string;
  LLM_FALLBACK_MODEL: string;
  AI_GATEWAY_BASE_URL: string;
  TTS_PROVIDER: string;
  CONTENT_SAFETY_PROVIDER: string;
  DEMO_MODE?: string;  // "true" 时开启免登录演示模式（生产环境不设置即关闭）
  // Secrets（.dev.vars / Dashboard Secrets）
  BETTER_AUTH_SECRET?: string;
  LLM_API_KEY?: string;
  AI_GATEWAY_API_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  CONTENT_SAFETY_SECRET_ID?: string;
  CONTENT_SAFETY_SECRET_KEY?: string;
  VOLC_TTS_APP_ID?: string;
  VOLC_TTS_ACCESS_TOKEN?: string;
};
