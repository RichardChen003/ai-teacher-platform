// 将 Live2D 示例模型复制到前端 public/（开发与构建共用）
// 用法：node scripts/copy-live2d.mjs
// 注意：不用 cpSync —— Node 24 在 Windows 上递归 cpSync 会崩溃（0xC0000409），
// 改用 readdirSync + copyFileSync 手动递归，行为一致且稳定。
import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "resources/avatar/live2d");
const dest = resolve(root, "apps/web/public/live2d");

function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from)) {
    const srcPath = join(from, entry);
    const destPath = join(to, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

if (!existsSync(src)) {
  console.log("[copy-live2d] 源目录不存在，跳过:", src);
  process.exit(0);
}
copyDir(src, dest);
console.log(`[copy-live2d] 已复制 ${src} -> ${dest}`);
