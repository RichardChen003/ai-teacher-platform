#!/usr/bin/env node
/**
 * 资源下载脚本 —— AI 老师平台
 * 用途：下载开源题库样例与 Live2D 数字人形象（开发占位），并生成 manifest 记录来源与许可。
 * 运行：node scripts/download_resources.mjs
 * 注意：需要可访问 GitHub 的网络环境；产物位于 resources/。
 *
 * 许可说明（详见 docs/02-资源清单.md）：
 *  - AGIEval：MIT（数据源自公开考试，使用需遵守原始数据许可），仅开发验证
 *  - TAL-SCQ5K：好未来发布，研究用途，仅开发验证，禁止直接用于生产题库
 *  - Math23K：研究用途，仅开发验证
 *  - Live2D CubismWebSamples：官方示例模型，开发占位；商用前必须替换/确认许可
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RES = join(ROOT, "resources");
const UA = "ai-teacher-platform-resource-fetcher";

async function fetchWithRetry(url, retries = 3, timeoutMs = 30000) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res;
    } catch (e) {
      lastErr = e;
      console.warn(`  重试 ${i + 1}/${retries}: ${url} (${e.message})`);
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

async function listGitHubTree(repo, branch) {
  const url = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
  const res = await fetchWithRetry(url);
  const data = await res.json();
  if (data.truncated) console.warn(`  警告: ${repo} 树被截断`);
  // 只保留文件（blob），排除目录（tree）
  return (data.tree ?? []).filter((t) => t.type === "blob").map((t) => t.path);
}

async function download(url, dest, label) {
  const res = await fetchWithRetry(url);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, buf);
  console.log(`  ✓ ${label} (${(buf.length / 1024).toFixed(0)} KB)`);
  return buf.length;
}

const manifest = { fetchedAt: new Date().toISOString(), items: [] };

async function task(name, fn) {
  console.log(`\n[${name}]`);
  try {
    await fn();
  } catch (e) {
    console.error(`  ✗ 失败: ${e.message}`);
    manifest.items.push({ name, status: "failed", error: e.message });
  }
}

// ---------- 1. 题库：AGIEval（高考数学真题类，MIT） ----------
await task("题库 AGIEval (gaokao-math)", async () => {
  const repo = "ruixiangcui/AGIEval";
  const files = ["data/v1_1/gaokao-mathqa.jsonl", "data/v1_1/gaokao-mathcloze.jsonl"];
  for (const f of files) {
    const bytes = await download(
      `https://raw.githubusercontent.com/${repo}/main/${f}`,
      join(RES, "question-bank/agieval", f.replace("data/v1_1/", "")),
      f
    );
    manifest.items.push({
      name: f,
      source: `https://github.com/${repo}`,
      license: "MIT (data from public exams; check original licenses)",
      bytes,
      usage: "dev-validation-only",
    });
  }
});

// ---------- 2. 题库：TAL-SCQ5K（小初高数学竞赛，研究用途） ----------
await task("题库 TAL-SCQ5K (中文数学竞赛)", async () => {
  const repo = "math-eval/TAL-SCQ5K";
  const files = [
    "ch_single_choice_constructed_5K/ch_single_choice_train_3K.jsonl",
    "ch_single_choice_constructed_5K/ch_single_choice_test_2K.jsonl",
  ];
  for (const f of files) {
    const bytes = await download(
      `https://raw.githubusercontent.com/${repo}/main/${f}`,
      join(RES, "question-bank/tal-scq", f.split("/").pop()),
      f
    );
    manifest.items.push({
      name: f,
      source: `https://github.com/${repo}`,
      license: "research-use (TAL 好未来); NOT for production question bank",
      bytes,
      usage: "dev-validation-only",
    });
  }
});

// ---------- 3. 题库：Math23K（小学应用题，研究用途） ----------
await task("题库 Math23K (小学应用题)", async () => {
  const repo = "ShichaoSun/math_seq2tree";
  const f = "data/Math_23K.json";
  const bytes = await download(
    `https://raw.githubusercontent.com/${repo}/master/${f}`,
    join(RES, "question-bank/math23k", "Math_23K.json"),
    f
  );
  manifest.items.push({
    name: f,
    source: `https://github.com/${repo}`,
    license: "research-use; dev-validation-only",
    bytes,
    usage: "dev-validation-only",
  });
});

// ---------- 4. 数字人形象：Live2D 官方示例（Hiyori 女师 / Haru 男师） ----------
await task("数字人 Live2D 官方示例 (Hiyori/Haru)", async () => {
  const repo = "Live2D/CubismWebSamples";
  const branch = "master";
  const paths = (await listGitHubTree(repo, branch)).filter(
    (p) => p.startsWith("Samples/Resources/Hiyori/") || p.startsWith("Samples/Resources/Haru/")
  );
  console.log(`  共 ${paths.length} 个文件`);
  for (const p of paths) {
    const rel = p.replace("Samples/Resources/", ""); // Hiyori/... Haru/...
    const bytes = await download(
      `https://raw.githubusercontent.com/${repo}/${branch}/${p}`,
      join(RES, "avatar/live2d", rel),
      p
    );
    manifest.items.push({
      name: p,
      source: `https://github.com/${repo}`,
      license: "Live2D official sample model — dev placeholder only; replace before production",
      bytes,
      usage: "dev-placeholder",
    });
  }
});

// ---------- 5. 记录各仓库 LICENSE（供核对） ----------
await task("记录上游 LICENSE", async () => {
  const licenses = [
    ["AGIEval-LICENSE.txt", "ruixiangcui/AGIEval", "main", "LICENSE"],
    ["TAL-SCQ5K-README.md", "math-eval/TAL-SCQ5K", "main", "README.md"],
    ["Math23K-LICENSE.txt", "ShichaoSun/math_seq2tree", "master", "LICENSE"],
    ["Live2D-LICENSE.txt", "Live2D/CubismWebSamples", "master", null], // 动态查找
  ];
  for (const [out, repo, branch, f] of licenses) {
    try {
      let file = f;
      if (!file) {
        const paths = await listGitHubTree(repo, branch);
        file = paths.find((p) => /license/i.test(p) && !p.includes("/")) ?? "LICENSE";
      }
      const bytes = await download(
        `https://raw.githubusercontent.com/${repo}/${branch}/${file}`,
        join(RES, "licenses", out),
        `licenses/${out}`
      );
      manifest.items.push({ name: out, source: `https://github.com/${repo}`, bytes, usage: "license-record" });
    } catch (e) {
      console.warn(`  跳过 ${out}: ${e.message}`);
    }
  }
});

// ---------- 汇总 ----------
writeFileSync(join(RES, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("\n完成。manifest 已写入 resources/manifest.json");
