/**
 * 验证三个修复（本地开发用，驱动 Edge headless）
 * 1. 公式图片字号一致性（img 高度分布收敛）
 * 2. 交卷后逐题回顾（正确答案/解析/对错标记）
 * 3. 难度标签（基础/中档/压轴）
 * 用法: node scripts/verify-fixes.mjs
 */
import { chromium } from "file:///C:/Users/Richard%20chen/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.mjs";
import { mkdirSync } from "node:fs";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const BASE = "http://localhost:5173";
const SHOT_DIR = "C:/Users/Richard chen/Desktop/ai-teacher-platform/.e2e-shots";
mkdirSync(SHOT_DIR, { recursive: true });

const errors = [];
const pageErrors = [];

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 200)));
page.on("requestfailed", (r) => errors.push(`reqfail ${r.url().slice(-60)}`));

try {
  // 1. 登录（Demo）
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByText("快速体验").first().click().catch(() =>
    page.getByRole("button", { name: /demo|演示/i }).first().click());
  await page.waitForTimeout(2500);

  // 2. 诊断页
  await page.goto(BASE + "/diagnosis", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  // 选高一年级（第 2 行第 1 个 = 高一上 grade 13）
  const gradeBtns = page.locator("button", { hasText: "高一上" });
  await gradeBtns.first().click().catch(() => {});
  await page.getByText("开始诊断").click();
  await page.waitForTimeout(2000);

  // 3. 题目页：检查公式图尺寸
  const imgs = await page.locator("img[src*='question-imgs']").evaluateAll((els) =>
    els.map((el) => ({ w: el.naturalWidth, h: el.naturalHeight }))
  );
  console.log(`题目页公式图数量: ${imgs.length}`);
  if (imgs.length > 0) {
    const hs = imgs.map((i) => i.h);
    console.log(`公式图高度范围: ${Math.min(...hs)} ~ ${Math.max(...hs)}px`);
    const small = hs.filter((h) => h < 15).length;
    console.log(`过小(<15px)图: ${small} 张 ${small > 0 ? "⚠️" : "✅"}`);
  } else {
    console.log("⚠️ 未抽到带公式图的题（题库随机，可重试）");
  }
  // 难度标签
  const levelTags = await page.locator("span", { hasText: /^(基础|中档|压轴)$/ }).count();
  console.log(`难度标签数量: ${levelTags} ${levelTags > 0 ? "✅" : "⚠️"}`);

  // 4. 答题（每题选第一项或填 1）→ 交卷
  let qCount = await page.locator("text=共").count();
  console.log("当前题目页文案:", await page.locator("h1, .card span").first().textContent().catch(() => ""));
  for (let i = 0; i < 12; i++) {
    const opt = page.locator("button.flex.items-center.gap-3").first();
    const ta = page.locator("textarea").first();
    if (await opt.isVisible().catch(() => false)) await opt.click().catch(() => {});
    else if (await ta.isVisible().catch(() => false)) await ta.fill("2").catch(() => {});
    const next = page.getByText(/下一题|交卷/).first();
    if (!(await next.isVisible().catch(() => false))) break;
    await next.click().catch(() => {});
    await page.waitForTimeout(250);
  }
  // 交卷
  const submitBtn = page.getByText("交卷").first();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await page.waitForTimeout(3500);
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOT_DIR}/verify-report.png`, fullPage: true });

  // 5. 报告页断言
  const bodyText = await page.textContent("body");
  const hasReview = bodyText.includes("逐题回顾");
  const hasCorrect = bodyText.includes("正确答案");
  const hasAnalysis = bodyText.includes("解析");
  const hasRight = bodyText.includes("回答正确");
  const hasWrong = bodyText.includes("回答错误");
  console.log("\n=== 逐题回顾断言 ===");
  console.log(`逐题回顾区块: ${hasReview ? "✅" : "❌"}`);
  console.log(`正确答案展示: ${hasCorrect ? "✅" : "❌"}`);
  console.log(`解析展示: ${hasAnalysis ? "✅" : "❌"}`);
  console.log(`回答正确标记: ${hasRight ? "✅" : "❌"}`);
  console.log(`回答错误标记: ${hasWrong ? "✅" : "❌"}`);

  console.log("\n=== 控制台错误 ===");
  const imgErrors = errors.filter((e) => e.includes("question-imgs") || e.includes("404"));
  console.log(`图片/404 错误: ${imgErrors.length} 条 ${imgErrors.length === 0 ? "✅" : "❌ " + imgErrors.slice(0, 3).join(" | ")}`);
  console.log(`其他控制台错误: ${errors.length - imgErrors.length} 条`);
  console.log(`页面异常: ${pageErrors.length} 条`);
  if (pageErrors.length) console.log(" ", pageErrors.slice(0, 3));
} catch (e) {
  console.log("脚本异常:", String(e).slice(0, 300));
} finally {
  await browser.close();
}
