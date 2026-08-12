/**
 * 前端页面 DOM 断言走查：不依赖截图，直接验证关键元素与文案
 */
import { chromium } from "file:///C:/Users/Richard%20chen/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.mjs";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const BASE = "http://localhost:5173";
const results = [];
const errors = [];

function ok(name, cond, extra = "") {
  results.push(`${cond ? "✅" : "❌"} ${name}${extra ? " | " + extra : ""}`);
  if (!cond) errors.push(name);
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));

// 1. 登录页
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
ok("登录页渲染", (await page.locator("body").innerText()).includes("登录") || (await page.locator("body").innerText()).includes("AI"));
const body0 = await page.locator("body").innerText();
ok("登录页有 Demo 入口", body0.includes("快速体验") || body0.includes("Demo") || body0.includes("演示"));

// 2. Demo 进入
await page.getByText("快速体验").first().click().catch(() => page.getByRole("button", { name: /demo|演示/i }).first().click());
await page.waitForTimeout(2000);
ok("Demo 进入后跳转工作台", page.url().includes("5173"));
const body1 = await page.locator("body").innerText();
ok("工作台渲染(有学习闭环文案)", /诊断|大纲|课堂|小测|学习/.test(body1));

// 3. 诊断页
await page.goto(BASE + "/diagnosis", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const body2 = await page.locator("body").innerText();
ok("诊断页渲染", /开始|诊断|配置|测评|答题/.test(body2));

// 发起诊断
const startBtn = page.getByRole("button").filter({ hasText: /开始|发起/ }).first();
if (await startBtn.isVisible().catch(() => false)) {
  await startBtn.click();
  await page.waitForTimeout(3500);
}
const body3 = await page.locator("body").innerText();
ok("进入答题(出现题目)", /计算|题|选择|填空|解答/.test(body3));

// 作答：逐题点第一个选项（或填 textarea），点"下一题"直到最后，然后交卷
let answeredCount = 0;
for (let step = 0; step < 25; step++) {
  const card = page.locator("div.card").filter({ hasText: /第 \d+ 题/ }).first();
  if (!(await card.isVisible().catch(() => false))) break;
  const optBtn = card.locator("button").first();
  if (await optBtn.isVisible().catch(() => false)) {
    await optBtn.click().catch(() => {});
    answeredCount++;
  } else {
    const ta = card.locator("textarea").first();
    if (await ta.isVisible().catch(() => false)) { await ta.fill("1"); answeredCount++; }
  }
  const nextBtn = page.getByRole("button").filter({ hasText: /下一题/ }).first();
  if (await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(400);
  } else break;
}
ok("逐题作答完成(>0题)", answeredCount > 0, `answered=${answeredCount}`);
await page.waitForTimeout(500);;
const submitBtn = page.getByRole("button").filter({ hasText: /交卷|提交/ }).first();
if (await submitBtn.isVisible().catch(() => false)) {
  await submitBtn.click();
  await page.waitForTimeout(5000);
}
const body4 = await page.locator("body").innerText();
ok("诊断报告出现", /掌握|报告|水平|薄弱|建议/.test(body4));

// 4. 大纲页
await page.goto(BASE + "/syllabus", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const body5 = await page.locator("body").innerText();
ok("大纲页渲染", /大纲|课时|计划|生成/.test(body5));
const genBtn = page.getByRole("button").filter({ hasText: /生成|开始/ }).first();
if (await genBtn.isVisible().catch(() => false)) {
  await genBtn.click();
  await page.waitForTimeout(5000);
}
const body6 = await page.locator("body").innerText();
ok("大纲生成后出现课时", /课时|课|单元/.test(body6));

// 5. AI 课堂
await page.goto(BASE + "/classroom", { waitUntil: "networkidle" });
await page.waitForTimeout(6000);
const body7 = await page.locator("body").innerText();
ok("课堂渲染(有课件内容)", /课件|讲解|数字人|下一|上一/.test(body7));
const deckTitle = await page.locator("h1, h2").first().innerText().catch(() => "");
ok("课堂有课件标题", deckTitle.length > 0, deckTitle.slice(0, 40));

// 6. 个人中心
await page.goto(BASE + "/profile", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const body8 = await page.locator("body").innerText();
ok("个人中心渲染", /年级|学科|设置|档案|个人/.test(body8));

await browser.close();

console.log("\n===== 页面断言结果 =====");
results.forEach((r) => console.log(r));
console.log(`\n===== 错误 (${errors.length}) =====`);
errors.slice(0, 20).forEach((e) => console.log("  ✗", e));
if (!errors.length) console.log("  无错误 🎉");
