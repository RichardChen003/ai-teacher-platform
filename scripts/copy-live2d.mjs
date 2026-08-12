// 将 Live2D 示例模型复制到前端 public/（开发与构建共用）
// 用法：node scripts/copy-live2d.mjs
import { cpSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "resources/avatar/live2d");
const dest = resolve(root, "apps/web/public/live2d");

if (!existsSync(src)) {
  console.log("[copy-live2d] 源目录不存在，跳过:", src);
  process.exit(0);
}
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true, force: true });
console.log(`[copy-live2d] 已复制 ${src} -> ${dest}`);
