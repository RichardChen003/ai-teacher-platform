/**
 * 前端端到端走查脚本（本地开发用）
 * 驱动系统 Edge（playwright-core），以 Demo 模式走完学习闭环：
 * 登录页 → 工作台 → 入测诊断(答题) → 报告 → 生成大纲 → AI 课堂(课件) → 课后小测
 * 输出：每步 console 错误收集 + 关键页面截图到 /tmp/e2e-shots/
 */
import { chromium } from "file:///C:/Users/Richard%20chen/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.mjs";
import { mkdirSync } from "node:fs";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const BASE = "http://localhost:5173";
const SHOT_DIR = "C:/Users/Richard chen/Desktop/ai-teacher-platform/.e2e-shots";
mkdirSync(SHOT_DIR, { recursive: true });

const errors = [];
const logs = [];

function track(page, name) {
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[${name}] ${msg.text().slice(0, 300)}`);
    if (msg.type() === "warning") logs.push(`[${name}][warn] ${msg.text().slice(0, 200)}`);
  });
  page.on("pageerror", (err) => errors.push(`[${name}][pageerror] ${String(err).slice(0, 300)}`));
  page.on("requestfailed", (req) => errors.push(`[${name}][reqfail] ${req.url()} ${req.failure()?.errorText ?? ""}`));
}

async function shot(page, step) {
  await page.screenshot({ path: `${SHOT_DIR}/${step}.png`, fullPage: true });
  console.log(`📸 ${step}`);
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
track(page, "global");

try {
  // 1. 登录页
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await shot(page, "01-login");
  console.log("登录页标题:", await page.title());

  // 进入 Demo
  const demoBtn = page.getByText("快速体验").first();
  if (await demoBtn.isVisible().catch(() => false)) {
    await demoBtn.click();
  } else {
    // 尝试找其他 demo 入口
    await page.getByRole("button", { name: /demo/i }).first().click().catch(() => {});
  }
  await page.waitForTimeout(2500);
  await shot(page, "02-after-demo");

  // 2. 工作台
  const url = page.url();
  console.log("Demo 后 URL:", url);
  if (!url.includes("/dashboard") && !url.includes("/")) {
    await page.goto(BASE, { waitUntil: "networkidle" });
  }
  await page.waitForTimeout(2000);
  await shot(page, "03-dashboard");

  // 3. 入测诊断页面
  await page.goto(BASE + "/diagnosis", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await shot(page, "04-diagnosis-config");

  // 发起诊断
  const startBtn = page.getByRole("button", { name: /开始|发起|诊断/ }).first();
  if (await startBtn.isVisible().catch(() => false)) {
    await startBtn.click();
    await page.waitForTimeout(3000);
    await shot(page, "05-diagnosis-questions");
    // 尝试作答：勾选所有单选答案
    const radios = page.locator("input[type=radio]");
    const n = await radios.count();
    for (let i = 0; i < Math.min(n, 12); i++) {
      const opt = radios.nth(i);
      await opt.check({ force: true }).catch(() => {});
    }
    await page.waitForTimeout(500);
    const submitBtn = page.getByRole("button", { name: /交卷|提交/ }).first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(4000);
      await shot(page, "06-diagnosis-report");
    }
  } else {
    // 如果自动进入答题，直接处理
    await page.waitForTimeout(1000);
    await shot(page, "05b-diagnosis-questions");
    const radios = page.locator("input[type=radio]");
    const n = await radios.count();
    for (let i = 0; i < Math.min(n, 12); i++) {
      await radios.nth(i).check({ force: true }).catch(() => {});
    }
    const submitBtn = page.getByRole("button", { name: /交卷|提交/ }).first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(4000);
      await shot(page, "06-diagnosis-report");
    }
  }

  // 4. 教学大纲页
  await page.goto(BASE + "/syllabus", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await shot(page, "07-syllabus");
  const genBtn = page.getByRole("button", { name: /生成|开始学习/ }).first();
  if (await genBtn.isVisible().catch(() => false)) {
    await genBtn.click();
    await page.waitForTimeout(4000);
    await shot(page, "08-syllabus-generated");
  }

  // 5. AI 课堂
  await page.goto(BASE + "/classroom", { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);
  await shot(page, "09-classroom");

  // 6. 个人中心
  await page.goto(BASE + "/profile", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot(page, "10-profile");
} catch (e) {
  console.log("❌ 走查异常:", String(e).slice(0, 500));
  await page.screenshot({ path: `${SHOT_DIR}/error.png`, fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

console.log("\n===== Console 错误收集 (" + errors.length + ") =====");
errors.slice(0, 30).forEach((e) => console.log("  ✗", e));
if (!errors.length) console.log("  ✅ 无 console 错误");
console.log("\n===== 警告/日志 (" + logs.length + ") =====");
logs.slice(0, 10).forEach((l) => console.log("  ⚠", l));
console.log("\n截图目录:", SHOT_DIR);
