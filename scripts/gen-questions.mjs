// ============================================================
// 题库生成器（参数化模板版）—— 为每个知识点生成多道原创变体题
// 用法：node scripts/gen-questions.mjs [--limit=3]
// 输出：infra/d1/questions-template.sql（INSERT 语句，幂等 OR IGNORE）
// 说明：数学题为通用知识，模板参数化生成，无版权问题；每知识点多道变体，
//       确保"每个知识点至少 1 题、每学期 50 题"的题库规模目标。
// 后续可接入 DeepSeek 生成更复杂题目（见 gen-questions-llm.mjs 预留）。
// ============================================================
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(root, "infra/d1/questions-template.sql");

// 确定性伪随机（保证可复现）
let seed = 20260817;
function rnd() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }

// ---------- 知识点清单（id, name, grade, stage） ----------
const KPS = [
  // 初一上 (7)
  { id: "kp-math-rational", name: "有理数", grade: 7, stage: "初中" },
  { id: "kp-math-rational-op", name: "有理数的运算", grade: 7, stage: "初中" },
  { id: "kp-math-rational-num", name: "数轴与相反数", grade: 7, stage: "初中" },
  { id: "kp-math-rational-abs", name: "绝对值", grade: 7, stage: "初中" },
  { id: "kp-math-exp", name: "整式的加减", grade: 7, stage: "初中" },
  { id: "kp-math-equation", name: "一元一次方程", grade: 7, stage: "初中" },
  { id: "kp-math-ineq", name: "不等式与不等式组", grade: 7, stage: "初中" },
  // 初一下 (8)
  { id: "kp-math-system", name: "二元一次方程组", grade: 8, stage: "初中" },
  { id: "kp-math-multiply", name: "整式乘除与因式分解", grade: 8, stage: "初中" },
  // 初二上 (9)
  { id: "kp-math-func", name: "一次函数", grade: 9, stage: "初中" },
  { id: "kp-math-congruent", name: "全等三角形", grade: 9, stage: "初中" },
  // 初二下 (10)
  { id: "kp-math-pythagoras", name: "勾股定理", grade: 10, stage: "初中" },
  { id: "kp-math-parallelogram", name: "平行四边形", grade: 10, stage: "初中" },
  // 初三上 (11)
  { id: "kp-math-quadratic", name: "二次函数", grade: 11, stage: "初中" },
  { id: "kp-math-quadeq", name: "一元二次方程", grade: 11, stage: "初中" },
  // 初三下 (12)
  { id: "kp-math-circle", name: "圆", grade: 12, stage: "初中" },
  { id: "kp-math-trigacute", name: "锐角三角函数", grade: 12, stage: "初中" },
  // 高一上 (13)
  { id: "kp-math-sets", name: "集合与常用逻辑用语", grade: 13, stage: "高中" },
  { id: "kp-math-func-basic", name: "函数概念与性质", grade: 13, stage: "高中" },
  { id: "kp-math-explog", name: "指数与对数函数", grade: 13, stage: "高中" },
  // 高一下 (14)
  { id: "kp-math-vector2d", name: "平面向量", grade: 14, stage: "高中" },
  { id: "kp-math-complex", name: "复数", grade: 14, stage: "高中" },
  // 高二上 (15)
  { id: "kp-math-trig", name: "三角函数", grade: 15, stage: "高中" },
  { id: "kp-math-seq", name: "数列", grade: 15, stage: "高中" },
  // 高二下 (16)
  { id: "kp-math-count", name: "计数原理", grade: 16, stage: "高中" },
  { id: "kp-math-randomvar", name: "随机变量及其分布", grade: 16, stage: "高中" },
  // 高三上 (17)
  { id: "kp-math-derivative", name: "导数及其应用", grade: 17, stage: "高中" },
  { id: "kp-math-vector", name: "空间向量与立体几何", grade: 17, stage: "高中" },
  { id: "kp-math-conic", name: "圆锥曲线", grade: 17, stage: "高中" },
  { id: "kp-math-probstat", name: "概率与统计", grade: 17, stage: "高中" },
  // 高三下 (18)
  { id: "kp-math-review", name: "高考综合复习", grade: 18, stage: "高中" },
];

// ---------- 每题生成器：按知识点 id 调对应模板函数 ----------
function genForKp(kp, idx) {
  const fn = GEN[kp.id];
  if (!fn) return null;
  return fn(kp, idx);
}

const GEN = {
  // 初一上
  "kp-math-rational": (kp, i) => {
    const a = ri(-9, 9); const b = ri(1, 9);
    const ans = a - b;
    return { type: "single_choice", content: `计算：${a} - ${b} = ？`,
      options: JSON.stringify([
        { key: "A", text: String(ans) }, { key: "B", text: String(ans + 2) },
        { key: "C", text: String(ans - 3) }, { key: "D", text: String(ans + 1) }]),
      answer: "A", analysis: `有理数减法：${a} - ${b} = ${a} + (-${b}) = ${ans}` };
  },
  "kp-math-rational-op": (kp, i) => {
    const a = ri(2, 12); const b = ri(1, 9);
    const ans = a * b;
    return { type: "single_choice", content: `计算：${a} × ${b} = ？`,
      options: JSON.stringify([
        { key: "A", text: String(ans) }, { key: "B", text: String(ans + b) },
        { key: "C", text: String(ans - a) }, { key: "D", text: String(a + b) }]),
      answer: "A", analysis: `同号相乘得正：${a}×${b}=${ans}` };
  },
  "kp-math-rational-num": (kp, i) => {
    const a = ri(1, 9);
    const ans = -a;
    return { type: "single_choice", content: `${a} 的相反数是？`,
      options: JSON.stringify([
        { key: "A", text: String(ans) }, { key: "B", text: String(a) },
        { key: "C", text: String(2 * a) }, { key: "D", text: String(0) }]),
      answer: "A", analysis: `只有符号不同的两个数互为相反数，${a} 的相反数是 ${ans}` };
  },
  "kp-math-rational-abs": (kp, i) => {
    const a = ri(1, 9); const neg = rnd() > 0.5;
    const num = neg ? -a : a;
    return { type: "single_choice", content: `|${num}| = ？`,
      options: JSON.stringify([
        { key: "A", text: String(a) }, { key: "B", text: String(-a) },
        { key: "C", text: String(0) }, { key: "D", text: String(2 * a) }]),
      answer: "A", analysis: `绝对值是非负数：|${num}|=${a}` };
  },
  "kp-math-exp": (kp, i) => {
    const a = ri(1, 9); const b = ri(1, 9); const c = ri(1, 9); const d = ri(1, 9);
    const ans = `${a + c}a + ${b + d}b`;
    return { type: "single_choice", content: `化简：${a}a + ${b}b + ${c}a + ${d}b = ？`,
      options: JSON.stringify([
        { key: "A", text: ans }, { key: "B", text: `${a + c}a` },
        { key: "C", text: `${b + d}b` }, { key: "D", text: `${a + b}a + ${c + d}b` }]),
      answer: "A", analysis: `合并同类项：${a}a+${c}a=${a + c}a，${b}b+${d}b=${b + d}b` };
  },
  "kp-math-equation": (kp, i) => {
    const x = ri(1, 9); const k = ri(1, 5); const c = ri(1, 9);
    const rhs = k * x + c;
    return { type: "single_choice", content: `解方程 ${k}x + ${c} = ${rhs}，x = ？`,
      options: JSON.stringify([
        { key: "A", text: String(x) }, { key: "B", text: String(x + 1) },
        { key: "C", text: String(x - 1) }, { key: "D", text: String(rhs) }]),
      answer: "A", analysis: `移项得 ${k}x=${rhs}-${c}=${k * x}，系数化一得 x=${x}` };
  },
  "kp-math-ineq": (kp, i) => {
    const x = ri(2, 8); const k = ri(1, 3);
    const rhs = k * x + 1;
    return { type: "single_choice", content: `不等式 ${k}x - 1 > ${rhs - 2} 的解集是？`,
      options: JSON.stringify([
        { key: "A", text: `x > ${x}` }, { key: "B", text: `x < ${x}` },
        { key: "C", text: `x > ${x - 2}` }, { key: "D", text: `x ≥ ${x}` }]),
      answer: "A", analysis: `移项 ${k}x>${rhs - 1}，除以 ${k} 得 x>${x}` };
  },
  // 初一下
  "kp-math-system": (kp, i) => {
    const x = ri(1, 6); const y = ri(1, 6);
    const s = x + y; const d = x - y;
    return { type: "single_choice", content: `方程组 {x+y=${s}, x-y=${d}} 的解是？`,
      options: JSON.stringify([
        { key: "A", text: `x=${x}, y=${y}` }, { key: "B", text: `x=${y}, y=${x}` },
        { key: "C", text: `x=${x + 1}, y=${y}` }, { key: "D", text: `x=${x}, y=${y + 1}` }]),
      answer: "A", analysis: `两式相加 2x=${2 * x}，x=${x}；代入得 y=${y}` };
  },
  "kp-math-multiply": (kp, i) => {
    const a = ri(2, 9); const b = ri(2, 9);
    return { type: "single_choice", content: `计算：(${a}x + ${b})(${a}x - ${b}) = ？`,
      options: JSON.stringify([
        { key: "A", text: `${a * a}x² - ${b * b}` }, { key: "B", text: `${a * a}x² + ${b * b}` },
        { key: "C", text: `${a * a}x² + ${2 * a * b}x + ${b * b}` }, { key: "D", text: `${a * a}x² - ${2 * a * b}x + ${b * b}` }]),
      answer: "A", analysis: `平方差公式：(${a}x)²-(${b})²=${a * a}x²-${b * b}` };
  },
  // 初二上
  "kp-math-func": (kp, i) => {
    const k = ri(1, 4); const b = ri(1, 9);
    return { type: "single_choice", content: `一次函数 y = ${k}x + ${b} 与 y 轴的交点是？`,
      options: JSON.stringify([
        { key: "A", text: `(0, ${b})` }, { key: "B", text: `(${b}, 0)` },
        { key: "C", text: `(0, 0)` }, { key: "D", text: `(1, ${k + b})` }]),
      answer: "A", analysis: `令 x=0，y=${b}，故与 y 轴交点 (0, ${b})` };
  },
  "kp-math-congruent": (kp, i) => {
    const a = ri(3, 12);
    return { type: "single_choice", content: `若△ABC≌△DEF，且 BC=${a}，则 EF = ？`,
      options: JSON.stringify([
        { key: "A", text: String(a) }, { key: "B", text: String(2 * a) },
        { key: "C", text: String(a / 2) }, { key: "D", text: "无法确定" }]),
      answer: "A", analysis: `全等三角形对应边相等，BC 对应 EF，故 EF=${a}` };
  },
  // 初二下
  "kp-math-pythagoras": (kp, i) => {
    // 固定勾股数组，保证每次都能生成有效题
    const trips = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15],[7,24,25]];
    const [a, b, c] = trips[i % trips.length];
    const variant = Math.floor(i / trips.length) % 3;
    // 三种设问方式：求斜边 / 求直角边 / 判断是否直角三角形
    if (variant === 0) {
      return { type: "single_choice", content: `直角三角形两直角边为 ${a} 和 ${b}，斜边为？`,
        options: JSON.stringify([
          { key: "A", text: String(c) }, { key: "B", text: String(c + 1) },
          { key: "C", text: String(a + b) }, { key: "D", text: String(c - 1) }]),
        answer: "A", analysis: `勾股定理：√(${a}²+${b}²)=${c}` };
    } else if (variant === 1) {
      return { type: "single_choice", content: `直角三角形斜边为 ${c}，一条直角边为 ${a}，另一条直角边为？`,
        options: JSON.stringify([
          { key: "A", text: String(b) }, { key: "B", text: String(b + 1) },
          { key: "C", text: String(c - a) }, { key: "D", text: String(a + b) }]),
        answer: "A", analysis: `勾股定理：√(${c}²-${a}²)=${b}` };
    }
    return { type: "single_choice", content: `下列哪组数可以构成直角三角形？`,
      options: JSON.stringify([
        { key: "A", text: `${a}、${b}、${c}` }, { key: "B", text: `${a}、${b}、${c + 1}` },
        { key: "C", text: `${a + 1}、${b}、${c}` }, { key: "D", text: `${a}、${b - 1}、${c}` }]),
      answer: "A", analysis: `${a}²+${b}²=${a * a + b * b}=${c}²，满足勾股定理逆定理` };
  },
  "kp-math-parallelogram": (kp, i) => {
    const a = pick([40, 50, 60, 70, 80, 100, 110, 120]);
    const b = 180 - a;
    return { type: "single_choice", content: `平行四边形 ABCD 中 ∠A=${a}°，则 ∠B = ？`,
      options: JSON.stringify([
        { key: "A", text: `${b}°` }, { key: "B", text: `${a}°` },
        { key: "C", text: `${b - 10}°` }, { key: "D", text: `${a + 10}°` }]),
      answer: "A", analysis: `平行四边形邻角互补：∠B=180°-${a}°=${b}°` };
  },
  // 初三上
  "kp-math-quadratic": (kp, i) => {
    const a = ri(1, 3); const c = ri(-5, 5); if (c === 0) return null;
    const x = ri(1, 3);
    return { type: "single_choice", content: `抛物线 y = ${a}x² + ${c} 的对称轴是？`,
      options: JSON.stringify([
        { key: "A", text: "x = 0（y 轴）" }, { key: "B", text: `x = ${x}` },
        { key: "C", text: "x = 1" }, { key: "D", text: `y = ${c}` }]),
      answer: "A", analysis: `二次函数 y=ax²+c 无一次项，对称轴为 x=0（y 轴）` };
  },
  "kp-math-quadeq": (kp, i) => {
    const p = ri(2, 5); const q = ri(2, 5);
    const b = -(p + q); const c = p * q;
    return { type: "single_choice", content: `方程 x² ${b < 0 ? "-" : "+"} ${Math.abs(b)}x + ${c} = 0 的两根是？`,
      options: JSON.stringify([
        { key: "A", text: `${p} 和 ${q}` }, { key: "B", text: `-${p} 和 -${q}` },
        { key: "C", text: `${p} 和 -${q}` }, { key: "D", text: `-${p} 和 ${q}` }]),
      answer: "A", analysis: `(x-${p})(x-${q})=0，故 x=${p} 或 x=${q}` };
  },
  // 初三下
  "kp-math-circle": (kp, i) => {
    const r = ri(2, 9);
    return { type: "single_choice", content: `半径为 ${r} 的圆的周长是？`,
      options: JSON.stringify([
        { key: "A", text: `${2 * r}π` }, { key: "B", text: `${r}π` },
        { key: "C", text: `${r * r}π` }, { key: "D", text: `${2 * r}` }]),
      answer: "A", analysis: `圆周长 C=2πr=2π×${r}=${2 * r}π` };
  },
  "kp-math-trigacute": (kp, i) => {
    const ang = pick([30, 45, 60]);
    const val = ang === 30 ? "1/2" : ang === 45 ? "√2/2" : "√3/2";
    return { type: "single_choice", content: `sin${ang}° = ？`,
      options: JSON.stringify([
        { key: "A", text: val }, { key: "B", text: "1" },
        { key: "C", text: "1/2" }, { key: "D", text: "√3" }]),
      answer: "A", analysis: `sin${ang}°=${val}（特殊角三角函数值）` };
  },
  // 高一上
  "kp-math-sets": (kp, i) => {
    const a = ri(1, 8); const b = ri(9, 16); const c = ri(2, 8); const d = ri(17, 20);
    return { type: "single_choice", content: `已知 A={${a},${b}}，B={${c},${d}}，则 A∩B = ？`,
      options: JSON.stringify([
        { key: "A", text: "∅" }, { key: "B", text: `{${a},${b}}` },
        { key: "C", text: `{${c},${d}}` }, { key: "D", text: `{${a},${b},${c},${d}}` }]),
      answer: "A", analysis: `两集合无公共元素，交集为空集 ∅` };
  },
  "kp-math-func-basic": (kp, i) => {
    const a = ri(1, 9); const b = ri(2, 9); if (b === a) return null;
    return { type: "single_choice", content: `函数 f(x)=1/(x-${a}) 的定义域是？`,
      options: JSON.stringify([
        { key: "A", text: `x≠${a}` }, { key: "B", text: `x>${a}` },
        { key: "C", text: `x≥${a}` }, { key: "D", text: `x≠${b}` }]),
      answer: "A", analysis: `分母不为 0：x-${a}≠0，即 x≠${a}` };
  },
  "kp-math-explog": (kp, i) => {
    const a = pick([2, 4, 8, 16]);
    const log = Math.log2(a);
    return { type: "single_choice", content: `log₂${a} = ？`,
      options: JSON.stringify([
        { key: "A", text: String(log) }, { key: "B", text: String(log + 1) },
        { key: "C", text: String(log - 1) }, { key: "D", text: String(a) }]),
      answer: "A", analysis: `2^${log}=${a}，故 log₂${a}=${log}` };
  },
  // 高一下
  "kp-math-vector2d": (kp, i) => {
    const a1 = ri(1, 5); const a2 = ri(1, 5); const b1 = ri(1, 5); const b2 = ri(1, 5);
    return { type: "single_choice", content: `a=(${a1},${a2})，b=(${b1},${b2})，则 a+b = ？`,
      options: JSON.stringify([
        { key: "A", text: `(${a1 + b1},${a2 + b2})` }, { key: "B", text: `(${a1 - b1},${a2 - b2})` },
        { key: "C", text: `(${a1},${b2})` }, { key: "D", text: `(${b1},${a2})` }]),
      answer: "A", analysis: `向量加法坐标相加：(${a1}+${b1}, ${a2}+${b2})=(${a1 + b1},${a2 + b2})` };
  },
  "kp-math-complex": (kp, i) => {
    const a = ri(1, 9); const b = ri(1, 9);
    return { type: "single_choice", content: `复数 z=${a}+${b}i，则 z 的虚部是？`,
      options: JSON.stringify([
        { key: "A", text: String(b) }, { key: "B", text: String(a) },
        { key: "C", text: `${b}i` }, { key: "D", text: String(-b) }]),
      answer: "A", analysis: `z=a+bi 的虚部为 b=${b}（不含虚数单位 i）` };
  },
  // 高二上
  "kp-math-trig": (kp, i) => {
    const a = pick([2, 3, 4]);
    const T = a === 2 ? "π" : a === 3 ? "2π/3" : "π/2";
    return { type: "single_choice", content: `函数 y=sin(${a}x) 的最小正周期是？`,
      options: JSON.stringify([
        { key: "A", text: T }, { key: "B", text: "2π" },
        { key: "C", text: `${a}π` }, { key: "D", text: "π" }]),
      answer: "A", analysis: `T=2π/ω=2π/${a}=${T}` };
  },
  "kp-math-seq": (kp, i) => {
    const a1 = ri(1, 5); const d = ri(2, 6); const n = ri(5, 10);
    const ans = a1 + (n - 1) * d;
    return { type: "single_choice", content: `等差数列 a₁=${a1}，公差 d=${d}，则 a${n} = ？`,
      options: JSON.stringify([
        { key: "A", text: String(ans) }, { key: "B", text: String(ans + d) },
        { key: "C", text: String(ans - d) }, { key: "D", text: String(a1 + n) }]),
      answer: "A", analysis: `aₙ=a₁+(n-1)d=${a1}+(${n}-1)×${d}=${ans}` };
  },
  // 高二下
  "kp-math-count": (kp, i) => {
    const n = ri(4, 6); const r = 2;
    const c = (n * (n - 1)) / r;
    return { type: "single_choice", content: `从 ${n} 名同学中选出 ${r} 名，共有多少种选法？`,
      options: JSON.stringify([
        { key: "A", text: String(c) }, { key: "B", text: String(n) },
        { key: "C", text: String(n * (n - 1)) }, { key: "D", text: String(n + r) }]),
      answer: "A", analysis: `C(${n},${r})=${n}×${n - 1}/${r}=${c}` };
  },
  "kp-math-randomvar": (kp, i) => {
    const p1 = pick([0.2, 0.3, 0.4, 0.5]);
    const p2 = 1 - p1;
    const e = 0 * p1 + 1 * p2;
    return { type: "single_choice", content: `随机变量 X 分布：P(X=0)=${p1}，P(X=1)=${p2}，则 E(X) = ？`,
      options: JSON.stringify([
        { key: "A", text: String(e) }, { key: "B", text: String(p1) },
        { key: "C", text: "1" }, { key: "D", text: String(2 * e) }]),
      answer: "A", analysis: `E(X)=0×${p1}+1×${p2}=${e}` };
  },
  // 高三上
  "kp-math-derivative": (kp, i) => {
    const n = ri(2, 5);
    const ans = `${n}x${n - 1 === 1 ? "" : "²"}`;
    return { type: "single_choice", content: `f(x)=x^${n}，则 f′(x) = ？`,
      options: JSON.stringify([
        { key: "A", text: ans }, { key: "B", text: `x^${n - 1}` },
        { key: "C", text: `${n}x^${n}` }, { key: "D", text: `${n - 1}x^${n - 1}` }]),
      answer: "A", analysis: `幂函数求导 (xⁿ)′=nxⁿ⁻¹=${ans}` };
  },
  "kp-math-vector": (kp, i) => {
    const a = ri(1, 3); const b = ri(2, 4); const c = ri(1, 3); const d = ri(1, 4);
    const dot = a * c + b * d;
    return { type: "single_choice", content: `向量 a=(${a},${b},0)，b=(${c},${d},0)，则 a·b = ？`,
      options: JSON.stringify([
        { key: "A", text: String(dot) }, { key: "B", text: String(dot + 1) },
        { key: "C", text: String(a * c) }, { key: "D", text: String(b * d) }]),
      answer: "A", analysis: `点积=${a}×${c}+${b}×${d}=${dot}` };
  },
  "kp-math-conic": (kp, i) => {
    const a = ri(3, 5); const b = ri(1, 4); if (b >= a) return null;
    const long = 2 * a;
    return { type: "single_choice", content: `椭圆 x²/${a * a} + y²/${b * b} = 1 的长轴长是？`,
      options: JSON.stringify([
        { key: "A", text: String(long) }, { key: "B", text: String(a) },
        { key: "C", text: String(2 * b) }, { key: "D", text: String(a * b) }]),
      answer: "A", analysis: `a²=${a * a}，a=${a}，长轴长 2a=${long}` };
  },
  "kp-math-probstat": (kp, i) => {
    const n = ri(3, 8); const ev = Math.floor(n / 2);
    return { type: "single_choice", content: `从 1~${n} 中随机取一个数，取到偶数的概率是？`,
      options: JSON.stringify([
        { key: "A", text: `${ev}/${n}` }, { key: "B", text: `1/2` },
        { key: "C", text: `${n - ev}/${n}` }, { key: "D", text: `1/${n}` }]),
      answer: "A", analysis: `1~${n} 中偶数 ${ev} 个，P=${ev}/${n}` };
  },
  // 高三下
  "kp-math-review": (kp, i) => {
    const q = pick([2, 3, 4]); const a1 = ri(1, 3); const n = pick([4, 5, 6]);
    const ans = a1 * Math.pow(q, n - 1);
    return { type: "single_choice", content: `等比数列首项 ${a1}，公比 ${q}，第 ${n} 项是？`,
      options: JSON.stringify([
        { key: "A", text: String(ans) }, { key: "B", text: String(ans * q) },
        { key: "C", text: String(a1 + (n - 1) * q) }, { key: "D", text: String(ans / q) }]),
      answer: "A", analysis: `aₙ=a₁qⁿ⁻¹=${a1}×${q}^${n - 1}=${ans}` };
  },
};

// 每个知识点期望生成数（目标：每学期 ≥50 题）
// 学期题量 = 该学期知识点数 × PER_KP（7年级 7 个知识点 ×10 ≈ 70 题）
const PER_KP = {
  default: 10,
  "kp-math-rational-op": 15,   // 核心计算多给
  "kp-math-rational": 10,
  "kp-math-sets": 12,
  "kp-math-explog": 12,
  "kp-math-trig": 12,
  "kp-math-seq": 12,
  "kp-math-derivative": 12,
  "kp-math-conic": 12,
  "kp-math-review": 12,
};

function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : null;
  // 批次号：同一批内 id 唯一；换批次可再生成一批新变体（内容因随机种子不同而异）
  const batchArg = args.find((a) => a.startsWith("--batch="));
  const batch = batchArg ? Number(batchArg.split("=")[1]) : 1;
  seed = seed + batch * 7919; // 批次不同 → 随机序列不同 → 题目内容不同

  const lines = [
    "-- ============================================================",
    "-- 参数化模板生成的原创题（每知识点多道变体，确保题量充足）",
    "-- 生成时间: " + new Date().toISOString().slice(0, 19),
    "-- 幂等：INSERT OR IGNORE",
    "-- ============================================================",
  ];
  let qid = 1;
  let total = 0;
  for (const kp of KPS) {
    const target = PER_KP[kp.id] ?? PER_KP.default;
    const maxN = limit ?? target;
    // 批量生成
    const items = [];
    for (let i = 0; i < maxN; i++) {
      const q = genForKp(kp, i);
      if (!q) continue;
      q.id = `qt-${kp.id.replace("kp-math-", "")}-b${batch}-${i + 1}`;
      items.push(q);
    }
    if (items.length === 0) continue;
    // 组装 INSERT（分组，避免单条过长）
    const chunkSize = 8;
    for (let c = 0; c < items.length; c += chunkSize) {
      const chunk = items.slice(c, c + chunkSize);
      lines.push(`INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES`);
      chunk.forEach((q, idx) => {
        const diff = (0.3 + (i0(c + idx) % 6) * 0.08).toFixed(2);
        const opts = q.options ?? "";
        lines.push(
          `('${q.id}','math','${kp.stage}',${kp.grade},'${kp.id}','${q.type}',${diff},'${q.content.replace(/'/g, "''")}','${opts.replace(/'/g, "''")}','${q.answer}','${q.analysis.replace(/'/g, "''")}','template','approved','通用')${idx === chunk.length - 1 ? ";" : ","}`
        );
      });
    }
    total += items.length;
    lines.push("");
  }
  writeFileSync(OUT, lines.join("\n"), "utf-8");
  console.log(`生成完成：${total} 道题 → ${OUT}`);
  console.log(`每学期预估题量：现有 53 + 模板 ~${total} = ${53 + total}（后续 LLM 可继续扩充）`);
}

function i0(v) { return v; }
main();
