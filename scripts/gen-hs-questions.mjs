// ============================================================
// 高中 252 知识点补题生成器 —— 按章节为缺失知识点生成题目
// 用法: node scripts/gen-hs-questions.mjs [章节号]  (如 node scripts/gen-hs-questions.mjs 1 2 3)
//       node scripts/gen-hs-questions.mjs           不带参数=全部章节
// 输出: infra/d1/hs-questions-{ch}.sql（每知识点 1-3 道题，INSERT OR IGNORE）
// 说明: 模板按"知识点"编写，题目为参数化原创题（含解析），source='template-hs'
// ============================================================
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { complexityScore, levelOf, difficultyOf, optionsText } from "./difficulty-score.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = (ch) => resolve(root, `infra/d1/hs-questions-${ch}.sql`);

// 确定性伪随机
let seed = 20260818;
function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

// ---------- 章节 → 知识点编号范围 ----------
// 从数据文件动态获取（避免硬编码错误）
import { readFileSync } from "node:fs";
const dataFile = resolve(root, "scripts/hs-syllabus-data.py");
const raw = readFileSync(dataFile, "utf-8");
// 用简单解析提取章节信息：`(ch_no, "ch_name", term, [` 之后的编号累计
// 由于 Python 源不便直接解析，这里手动维护编号映射（与 hs-syllabus-data.py 一致）
const CHAPTER_KPS = {
  1: { name: "集合与常用逻辑用语", term: 13, start: 1, end: 14 },
  2: { name: "一元二次函数、方程和不等式", term: 13, start: 15, end: 30 },
  3: { name: "函数的概念与性质", term: 13, start: 31, end: 48 },
  4: { name: "指数函数与对数函数", term: 13, start: 49, end: 62 },
  5: { name: "三角函数", term: 13, start: 63, end: 72 },
  6: { name: "平面向量及其应用", term: 14, start: 73, end: 87 },
  7: { name: "复数", term: 14, start: 88, end: 96 },
  8: { name: "立体几何初步", term: 14, start: 97, end: 114 },
  9: { name: "统计", term: 14, start: 115, end: 126 },
  10: { name: "概率", term: 14, start: 127, end: 138 },
  11: { name: "空间向量与立体几何", term: 15, start: 139, end: 156 },
  12: { name: "直线与圆的方程", term: 15, start: 157, end: 171 },
  13: { name: "圆锥曲线的方程", term: 15, start: 172, end: 186 },
  14: { name: "数列", term: 16, start: 187, end: 198 },
  15: { name: "一元函数的导数及其应用", term: 16, start: 199, end: 212 },
  16: { name: "计数原理", term: 16, start: 213, end: 224 },
  17: { name: "随机变量及其分布", term: 16, start: 225, end: 238 },
  18: { name: "成对数据的统计分析", term: 16, start: 239, end: 252 },
};

// 知识点名称（与数据文件一致，编号→名称）
const KP_NAMES = {
  1: "常见的集合", 2: "有限数集子集个数", 3: "集合结论", 4: "集合的交并补", 5: "量词命题的否定",
  6: "充要条件", 7: "集合的含义与表示", 8: "元素与集合关系", 9: "空集性质", 10: "全集概念",
  11: "充分条件、必要条件判断", 12: "全称量词命题", 13: "存在量词命题", 14: "命题真假判断",
  15: "重要的恒等式", 16: "不等式的性质", 17: "绝对值不等式的性质", 18: "均值不等式的一般形式",
  19: "均值不等式变形", 20: "均值不等式链", 21: "积定和最小", 22: "和定积最大", 23: "糖水不等式",
  24: "一元二次方程根与系数的关系", 25: "根与系数关系的变形", 26: "一元二次不等式解法",
  27: "任意性(恒成立)问题", 28: "存在性问题", 29: "二次函数图像与性质", 30: "三个二次综合关系",
  31: "具体函数的定义域", 32: "抽象函数的定义域", 33: "函数的单调性定义", 34: "复合函数的单调性",
  35: "单调性的加减规律", 36: "函数图像的平移变换", 37: "函数图像的伸缩变换", 38: "函数图像的翻折变换",
  39: "偶函数特性", 40: "奇函数特性", 41: "奇偶函数的四则运算", 42: "复合函数的奇偶性",
  43: "常见的奇函数", 44: "常见的偶函数", 45: "函数周期性结论", 46: "函数的轴对称结论",
  47: "函数的中心对称结论", 48: "对称性与周期性综合关系",
  49: "根式性质", 50: "指数运算", 51: "指数函数图像规律", 52: "对数性质", 53: "对数运算",
  54: "换底公式", 55: "对数函数图像规律", 56: "幂函数图像规律", 57: "函数的零点", 58: "零点的存在性定理",
  59: "二次函数根的分布问题", 60: "指数对数大小比较", 61: "幂函数基本性质", 62: "二分法求零点",
  63: "弧度制", 64: "扇形弧长、面积公式", 65: "三角函数定义", 66: "三角函数正负判断",
  67: "同角三角函数关系", 68: "诱导公式应用", 69: "正余弦正切基础图像性质", 70: "三角函数图像变换",
  71: "和差、倍角、辅助角公式", 72: "三角函数综合求值",
  73: "向量加法法则", 74: "向量减法法则", 75: "向量平行判定", 76: "向量垂直判定",
  77: "向量数量积公式", 78: "向量模长公式", 79: "向量投影计算", 80: "向量夹角公式",
  81: "单位向量求解", 82: "三点共线向量判定", 83: "三角形四心向量表示", 84: "正弦定理及变形",
  85: "余弦定理及变形", 86: "三角形面积公式", 87: "解三角形综合问题",
  88: "i的周期性运算", 89: "复数的模", 90: "共轭复数定义", 91: "共轭复数性质", 92: "复数四则运算",
  93: "复数几何意义", 94: "复数相等条件", 95: "复数分类", 96: "复数模长综合计算",
  97: "斜二测画法规则", 98: "直观图面积比例关系", 99: "平面基本事实与推论", 100: "线线平行证明方法",
  101: "线面平行判定与性质", 102: "面面平行判定与性质", 103: "线面垂直判定与性质",
  104: "面面垂直判定与性质", 105: "线线垂直证明", 106: "异面直线所成角求解",
  107: "直线与平面所成角求解", 108: "二面角初步求解", 109: "点面距离求解", 110: "空间几何体表面积",
  111: "空间几何体体积", 112: "空间点线面位置关系", 113: "平行垂直综合证明", 114: "空间几何识图能力",
  115: "分层抽样方法", 116: "频率分布直方图结构", 117: "样本平均数、中位数、众数", 118: "百分位数计算",
  119: "直方图求中位数、平均数", 120: "样本方差与标准差", 121: "简单随机抽样", 122: "抽样误差分析",
  123: "数据整理与作图", 124: "总体估计思想", 125: "数据特征分析", 126: "统计图表辨析",
  127: "古典概型计算", 128: "互斥事件概率", 129: "对立事件概率", 130: "相互独立事件定义",
  131: "独立事件乘法公式", 132: "随机事件关系判断", 133: "概率基本性质", 134: "有限样本空间",
  135: "频率与概率区别", 136: "多事件综合概率", 137: "随机试验辨析", 138: "概率模型选择",
  139: "空间向量共面定理", 140: "空间向量基本定理", 141: "空间向量模长计算", 142: "空间向量数量积",
  143: "空间向量平行垂直判定", 144: "空间向量夹角公式", 145: "平面法向量求解", 146: "向量法判定线面关系",
  147: "向量法求线线角", 148: "向量法求线面角", 149: "向量法求二面角", 150: "点到直线距离公式",
  151: "异面直线距离求解", 152: "点到平面距离公式", 153: "空间直角坐标系建系", 154: "空间向量坐标运算",
  155: "立体几何向量证明", 156: "空间几何最值问题",
  157: "直线倾斜角与斜率", 158: "五种直线方程形式", 159: "直线过定点问题", 160: "两直线平行、垂直条件",
  161: "点点距、点线距、线线距", 162: "直线系方程（平行/垂直/交点）", 163: "圆的标准方程、一般方程",
  164: "圆的弦长公式", 165: "圆的切线长、切线方程", 166: "直线与圆位置关系", 167: "圆与圆位置关系",
  168: "公共弦方程", 169: "圆系方程应用", 170: "直线圆综合最值", 171: "轨迹方程求解",
  172: "椭圆、双曲线、抛物线定义", 173: "圆锥曲线标准方程", 174: "a、b、c、e 关系",
  175: "双曲线渐近线方程", 176: "等轴双曲线性质", 177: "圆锥曲线通径公式", 178: "焦点到渐近线距离",
  179: "焦半径公式", 180: "焦点三角形面积", 181: "直线与圆锥曲线交点问题", 182: "抛物线焦点弦长",
  183: "抛物线焦点弦性质", 184: "圆锥曲线弦长公式", 185: "切线方程、点差法", 186: "圆锥曲线综合计算",
  187: "Sn求an通用公式", 188: "等差数列通项公式", 189: "等比数列通项公式", 190: "等差数列前n项和公式",
  191: "等比数列前n项和公式", 192: "等差、等比中项", 193: "数列下标性质", 194: "等差等比综合性质",
  195: "错位相减法求和", 196: "裂项相消法求和", 197: "累加法求通项", 198: "累乘法求通项",
  199: "导数定义与表示", 200: "导数几何意义（切线）", 201: "基本初等函数导数公式", 202: "导数四则运算法则",
  203: "复合函数求导法则", 204: "切点在曲线上切线方程", 205: "切点不在曲线上切线方程",
  206: "导数判断函数单调性", 207: "函数极值求解方法", 208: "导数构造函数技巧", 209: "指数、对数常用不等式",
  210: "指对综合放缩不等式", 211: "导数恒成立问题", 212: "导数存在性问题",
  213: "分类加法计数原理", 214: "分步乘法计数原理", 215: "排列数公式与运算", 216: "组合数公式与运算",
  217: "组合数核心性质", 218: "有限制条件排列问题", 219: "有限制条件组合问题", 220: "捆绑、插空、隔板模型",
  221: "二项式定理展开式", 222: "二项式通项公式", 223: "二项式系数性质", 224: "二项式系数求和",
  225: "离散型随机变量与分布列", 226: "条件概率公式与性质", 227: "概率乘法公式",
  228: "全概率公式、贝叶斯公式", 229: "离散型随机变量期望", 230: "离散型随机变量方差",
  231: "期望方差运算性质", 232: "二项分布模型", 233: "二项分布期望方差", 234: "超几何分布模型",
  235: "超几何分布期望", 236: "正态分布定义", 237: "正态曲线性质", 238: "3σ原则应用",
  239: "变量相关关系判断", 240: "散点图分析正负相关", 241: "线性相关系数r", 242: "相关系数强弱判定",
  243: "一元线性回归方程", 244: "回归直线过样本中心点", 245: "回归斜率几何意义", 246: "残差定义与计算",
  247: "残差平方和", 248: "拟合度（相关指数）", 249: "线性相关性综合判断", 250: "2×2列联表",
  251: "卡方χ²统计量计算", 252: "独立性检验临界值判定",
};

// ---------- 模板：知识点编号 → 题目生成函数 ----------
// 返回数组（每元素一道题：{content, options?, answer, analysis, type}），可生成多道变体
const TPL = {
  // ========== 第1章 集合 (1-14) ==========
  1: (i) => [{
    content: "下列集合表示正确的是？",
    options: JSON.stringify([{ key: "A", text: "所有偶数：{x | x=2k, k∈Z}" }, { key: "B", text: "较大的数" }, { key: "C", text: "接近0的数" }, { key: "D", text: "成绩好的同学" }]),
    answer: "A", analysis: "集合中的元素必须确定，A 用性质描述确定了偶数集合；其余选项元素不确定", type: "single_choice",
  }],
  2: (i) => {
    const n = ri(3, 4);
    const cnt = Math.pow(2, n);
    return [{ content: `集合 {1,2,...,${n}} 的子集个数是？`,
      options: JSON.stringify([{ key: "A", text: String(cnt) }, { key: "B", text: String(n) }, { key: "C", text: String(cnt - 1) }, { key: "D", text: String(2 * n) }]),
      answer: "A", analysis: `含 ${n} 个元素的集合子集数为 2^${n}=${cnt}`, type: "single_choice" }];
  },
  3: (i) => [{
    content: "若 A⊆B 且 B⊆A，则 A 与 B 的关系是？",
    options: JSON.stringify([{ key: "A", text: "A=B" }, { key: "B", text: "A⊂B" }, { key: "C", text: "A∩B=∅" }, { key: "D", text: "A∪B=A" }]),
    answer: "A", analysis: "集合相等：两个集合互相包含则相等", type: "single_choice",
  }],
  4: (i) => {
    const a = ri(1, 8), b = ri(9, 15), c = ri(1, 8), d = ri(16, 20);
    return [{ content: `已知 A={${a},${b}}，B={${c},${d}}，则 A∪B = ？`,
      options: JSON.stringify([{ key: "A", text: `{${a},${b},${c},${d}}` }, { key: "B", text: "∅" }, { key: "C", text: `{${a},${b}}` }, { key: "D", text: `{${c},${d}}` }]),
      answer: "A", analysis: "并集取两集合所有元素", type: "single_choice" }];
  },
  5: (i) => [{
    content: '命题"∀x∈R，x²≥0"的否定是？',
    options: JSON.stringify([{ key: "A", text: "∃x∈R，x²<0" }, { key: "B", text: "∀x∈R，x²<0" }, { key: "C", text: "∃x∈R，x²≥0" }, { key: "D", text: "∀x∈R，x²≠0" }]),
    answer: "A", analysis: "全称量词命题的否定是存在量词命题，结论取反", type: "single_choice",
  }],
  6: (i) => [{
    content: '若 p 是 q 的充分条件，则以下正确的是？',
    options: JSON.stringify([{ key: "A", text: "p⇒q" }, { key: "B", text: "q⇒p" }, { key: "C", text: "p⇔q" }, { key: "D", text: "p 与 q 无关" }]),
    answer: "A", analysis: "p 是 q 的充分条件即 p⇒q（p 能推出 q）", type: "single_choice",
  }],
  7: (i) => {
    const a = ri(1, 9);
    return [{ content: `集合 A={x∈N | x<${a}} 用列举法表示为？`,
      options: JSON.stringify([{ key: "A", text: `{0,1,2,...,${a - 1}}` }, { key: "B", text: `{1,2,...,${a}}` }, { key: "C", text: `{0,1,...,${a}}` }, { key: "D", text: `{1,2,...,${a - 1}}` }]),
      answer: "A", analysis: `自然数中小于 ${a} 的是 0 到 ${a - 1}`, type: "single_choice" }];
  },
  8: (i) => {
    const a = ri(1, 9), b = ri(1, 9);
    return [{ content: `若 1∈A 且 A={${b}, x}，则 x = ？`,
      options: JSON.stringify([{ key: "A", text: `1` }, { key: "B", text: `${b}` }, { key: "C", text: `0` }, { key: "D", text: `2` }]),
      answer: "A", analysis: "元素属于集合，则元素在集合中，故 x=1", type: "single_choice" }];
  },
  9: (i) => [{
    content: "空集 ∅ 与集合 {0} 的关系是？",
    options: JSON.stringify([{ key: "A", text: "∅⊂{0}" }, { key: "B", text: "∅∈{0}" }, { key: "C", text: "∅={0}" }, { key: "D", text: "∅ 不是 {0} 的子集" }]),
    answer: "A", analysis: "空集是任何非空集合的真子集", type: "single_choice",
  }],
  10: (i) => {
    const a = ri(1, 5), b = ri(6, 10);
    return [{ content: `设全集 U={${a},${b},11,12}，A={${a}}，则 ∁UA = ？`,
      options: JSON.stringify([{ key: "A", text: `{${b},11,12}` }, { key: "B", text: `{${a},${b}}` }, { key: "C", text: `{${a},11,12}` }, { key: "D", text: "∅" }]),
      answer: "A", analysis: "补集为全集中不属于 A 的元素", type: "single_choice" }];
  },
  11: (i) => [{
    content: '"x>2" 是 "x>1" 的什么条件？',
    options: JSON.stringify([{ key: "A", text: "充分不必要" }, { key: "B", text: "必要不充分" }, { key: "C", text: "充要" }, { key: "D", text: "既不充分也不必要" }]),
    answer: "A", analysis: "x>2 能推出 x>1，但反之不成立，故充分不必要", type: "single_choice",
  }],
  12: (i) => [{
    content: "下列是全称量词命题的是？",
    options: JSON.stringify([{ key: "A", text: "∀x∈R，x²+1>0" }, { key: "B", text: "∃x∈R，x=1" }, { key: "C", text: "x 是奇数" }, { key: "D", text: "有些三角形是等边的" }]),
    answer: "A", analysis: "∀ 是全称量词，A 为全称量词命题", type: "single_choice",
  }],
  13: (i) => [{
    content: "下列是存在量词命题的是？",
    options: JSON.stringify([{ key: "A", text: "∃x∈R，x²=1" }, { key: "B", text: "∀x∈R，x²≥0" }, { key: "C", text: "所有正方形都是菱形" }, { key: "D", text: "三角形内角和为180°" }]),
    answer: "A", analysis: "∃ 是存在量词，A 为存在量词命题", type: "single_choice",
  }],
  14: (i) => [{
    content: "命题'若 x=1，则 x²=1'的真假是？",
    options: JSON.stringify([{ key: "A", text: "真命题" }, { key: "B", text: "假命题" }, { key: "C", text: "无法判断" }, { key: "D", text: "既真又假" }]),
    answer: "A", analysis: "x=1 时 x²=1 恒成立，是真命题", type: "single_choice",
  }],

  // ========== 第2章 不等式 (15-30) ==========
  15: (i) => {
    const a = ri(2, 5), b = ri(2, 5);
    return [{ content: `(a+b)² = ？ (a=${a}, b=${b} 为例验证)`,
      options: JSON.stringify([{ key: "A", text: "a²+2ab+b²" }, { key: "B", text: "a²+b²" }, { key: "C", text: "a²-2ab+b²" }, { key: "D", text: "2ab" }]),
      answer: "A", analysis: "完全平方和公式：(a+b)²=a²+2ab+b²", type: "single_choice" }];
  },
  16: (i) => {
    const a = ri(3, 8), b = ri(1, 4);
    return [{ content: `若 a>b (a=${a}, b=${b})，则下列正确的是？`,
      options: JSON.stringify([{ key: "A", text: `a+1 > b+1` }, { key: "B", text: `a-2 < b-2` }, { key: "C", text: `-a > -b` }, { key: "D", text: `a < b` }]),
      answer: "A", analysis: "不等式同加同减不变号：a>b ⇒ a+1>b+1", type: "single_choice" }];
  },
  17: (i) => {
    const x = ri(2, 5);
    return [{ content: `若 |x| < ${x}，则 x 的取值范围是？`,
      options: JSON.stringify([{ key: "A", text: `-${x}<x<${x}` }, { key: "B", text: `x>${x}` }, { key: "C", text: `x<-${x}` }, { key: "D", text: `x=${x}` }]),
      answer: "A", analysis: `|x|<a ⇔ -a<x<a，故 -${x}<x<${x}`, type: "single_choice" }];
  },
  18: (i) => {
    const a = ri(2, 9);
    return [{ content: `已知 a>0，则 a + 1/a 的最小值是（a=${a} 验证）？`,
      options: JSON.stringify([{ key: "A", text: "2" }, { key: "B", text: "1" }, { key: "C", text: "4" }, { key: "D", text: "3" }]),
      answer: "A", analysis: "均值不等式：a+1/a ≥ 2√(a·1/a)=2，当 a=1 时取等", type: "single_choice" }];
  },
  19: (i) => {
    const a = ri(2, 9), b = ri(2, 9);
    return [{ content: `已知 a,b>0，则 (a+b)/2 与 √(ab) 的关系是？`,
      options: JSON.stringify([{ key: "A", text: "(a+b)/2 ≥ √(ab)" }, { key: "B", text: "(a+b)/2 ≤ √(ab)" }, { key: "C", text: "(a+b)/2 = √(ab)" }, { key: "D", text: "无法比较" }]),
      answer: "A", analysis: "均值不等式：(a+b)/2 ≥ √(ab)，当 a=b 时取等", type: "single_choice" }];
  },
  20: (i) => [{
    content: "均值不等式链中，调和平均数 H 与几何平均数 G 的关系是？",
    options: JSON.stringify([{ key: "A", text: "H ≤ G" }, { key: "B", text: "H ≥ G" }, { key: "C", text: "H = G" }, { key: "D", text: "无法比较" }]),
    answer: "A", analysis: "均值不等式链：H ≤ G ≤ A ≤ Q（调和≤几何≤算术≤平方）", type: "single_choice",
  }],
  21: (i) => {
    const k = ri(4, 12);
    return [{ content: `已知 x>0，y>0，xy=${k}，则 x+y 的最小值是？`,
      options: JSON.stringify([{ key: "A", text: String(2 * Math.sqrt(k)) }, { key: "B", text: String(k) }, { key: "C", text: String(2 * k) }, { key: "D", text: String(Math.sqrt(k)) }]),
      answer: "A", analysis: `积定和最小：x+y ≥ 2√(xy)=2√${k}`, type: "single_choice" }];
  },
  22: (i) => {
    const s = ri(8, 16);
    return [{ content: `已知 x>0，y>0，x+y=${s}，则 xy 的最大值是？`,
      options: JSON.stringify([{ key: "A", text: String(s * s / 4) }, { key: "B", text: String(s) }, { key: "C", text: String(s / 2) }, { key: "D", text: String(2 * s) }]),
      answer: "A", analysis: `和定积最大：xy ≤ ((${s})/2)²=${s * s / 4}`, type: "single_choice" }];
  },
  23: (i) => {
    const a = ri(2, 9), m = ri(2, 9);
    return [{ content: `糖水不等式：若 a>b>0，m>0，则 b/a 与 (b+m)/(a+m) 的关系？`,
      options: JSON.stringify([{ key: "A", text: "b/a < (b+m)/(a+m)" }, { key: "B", text: "b/a > (b+m)/(a+m)" }, { key: "C", text: "相等" }, { key: "D", text: "无法确定" }]),
      answer: "A", analysis: "糖水加糖变甜：b/a < (b+m)/(a+m)（真分数加同正数变大）", type: "single_choice" }];
  },
  24: (i) => {
    const p = ri(2, 5), q = ri(2, 5);
    const b = p + q, c = p * q;
    return [{ content: `方程 x²-${b}x+${c}=0 的两根之和是？`,
      options: JSON.stringify([{ key: "A", text: String(b) }, { key: "B", text: String(c) }, { key: "C", text: String(-b) }, { key: "D", text: String(2 * b) }]),
      answer: "A", analysis: `韦达定理：x₁+x₂=${b}（两根为 ${p} 和 ${q}）`, type: "single_choice" }];
  },
  25: (i) => {
    const p = ri(2, 5), q = ri(2, 5);
    const c = p * q;
    return [{ content: `方程 x²-(p+q)x+pq=0（p=${p},q=${q}）两根之积是？`,
      options: JSON.stringify([{ key: "A", text: String(c) }, { key: "B", text: String(p + q) }, { key: "C", text: String(-c) }, { key: "D", text: "1" }]),
      answer: "A", analysis: `韦达定理：x₁·x₂=c/a=${c}`, type: "single_choice" }];
  },
  26: (i) => {
    const a = ri(1, 3), c = ri(1, 9), x1 = ri(1, 3), x2 = ri(4, 8);
    const b = a * (x1 + x2), cc = a * x1 * x2;
    const sign = b > 0 ? "-" : "+";
    return [{ content: `不等式 x²-${b}x+${cc}<0 的解集是？`,
      options: JSON.stringify([{ key: "A", text: `${x1}<x<${x2}` }, { key: "B", text: `x<${x1} 或 x>${x2}` }, { key: "C", text: `x>${x1}` }, { key: "D", text: `x<${x2}` }]),
      answer: "A", analysis: `对应方程两根 ${x1}、${x2}，二次系数>0，小于取中间：${x1}<x<${x2}`, type: "single_choice" }];
  },
  27: (i) => {
    const a = ri(1, 3);
    return [{ content: `若 ∀x∈R，x²+${2 * a}x+${a * a}+1>0 恒成立，则满足？`,
      options: JSON.stringify([{ key: "A", text: "恒成立（判别式<0）" }, { key: "B", text: "需要 a>0" }, { key: "C", text: "需要 a<0" }, { key: "D", text: "不可能恒成立" }]),
      answer: "A", analysis: `x²+${2 * a}x+${a * a}+1=(x+${a})²+1>0 恒成立`, type: "single_choice" }];
  },
  28: (i) => {
    const a = ri(1, 5);
    return [{ content: `若 ∃x∈R，x²=${a}，则 a 满足？`,
      options: JSON.stringify([{ key: "A", text: "a ≥ 0" }, { key: "B", text: "a > 0" }, { key: "C", text: "a ≤ 0" }, { key: "D", text: "a < 0" }]),
      answer: "A", analysis: "x²=a 有解当且仅当 a≥0", type: "single_choice" }];
  },
  29: (i) => {
    const a = ri(1, 3);
    return [{ content: `二次函数 y=${a}x² 的开口方向是？`,
      options: JSON.stringify([{ key: "A", text: "向上" }, { key: "B", text: "向下" }, { key: "C", text: "向左" }, { key: "D", text: "向右" }]),
      answer: "A", analysis: `二次项系数 ${a}>0，开口向上`, type: "single_choice" }];
  },
  30: (i) => {
    const p = ri(1, 4);
    return [{ content: `二次函数 y=x²-${2 * p}x+${p * p} 与 x 轴的交点个数是？`,
      options: JSON.stringify([{ key: "A", text: "1 个" }, { key: "B", text: "0 个" }, { key: "C", text: "2 个" }, { key: "D", text: "3 个" }]),
      answer: "A", analysis: `y=(x-${p})² 顶点在 x 轴上，Δ=0，恰 1 个交点`, type: "single_choice" }];
  },

  31: (i) => [(() => { const a = ri(1,9); return { content: `函数 f(x)=√(x-${a}) 的定义域是？`, options: JSON.stringify([{key:"A",text:`x≥${a}`},{key:"B",text:`x>${a}`},{key:"C",text:`x≤${a}`},{key:"D",text:`x≠${a}`}]), answer:"A", analysis:`偶次根式非负：x-${a}≥0 → x≥${a}`, type:"single_choice" }; })()],
  32: (i) => [(() => { const a = ri(1,4); return { content: `f(x+1) 定义域为 [-${a},${a}]，则 f(x) 定义域？`, options: JSON.stringify([{key:"A",text:`[${-a+1},${a+1}]`},{key:"B",text:`[-${a},${a}]`},{key:"C",text:`[-${a-1},${a-1}]`},{key:"D",text:`[${a},${a+2}]`}]), answer:"A", analysis:`令 t=x+1，t∈[-${a+1},${a+1}]`, type:"single_choice" }; })()],
  33: (i) => [(() => { const a = ri(3,7), b = ri(1,4); return { content: `f(x)=x²-${a}x+${b} 在 [1,${a}] 单调性？`, options: JSON.stringify([{key:"A",text:"先减后增"},{key:"B",text:"先增后减"},{key:"C",text:"单调递增"},{key:"D",text:"单调递减"}]), answer:"A", analysis:`对称轴 x=${a}/2 ∈ [1,${a}] → 先减后增`, type:"single_choice" }; })()],
  34: (i) => [(() => { const inner = pick(["2x","-x","x²"]); return { content: `若 y=f(u) 增，u=${inner} 在 (0,+∞) 减，则 y=f(${inner}) 在 (0,+∞) 单调？`, options: JSON.stringify([{key:"A",text:"递减"},{key:"B",text:"递增"},{key:"C",text:"不单调"},{key:"D",text:"无法确定"}]), answer:"A", analysis:"同增异减：外层增内层减 → 复合减", type:"single_choice" }; })()],
  35: (i) => [(() => { return { content: "若 f 与 g 均在 R 上递增，则 f+g 单调？", options: JSON.stringify([{key:"A",text:"递增"},{key:"B",text:"递减"},{key:"C",text:"不单调"},{key:"D",text:"无法判断"}]), answer:"A", analysis:"增+增=增", type:"single_choice" }; })()],
  36: (i) => [(() => { const a = ri(1,5), b = ri(1,5); return { content: `y=f(x) 右移 ${a} 上移 ${b} → ?`, options: JSON.stringify([{key:"A",text:`y=f(x-${a})+${b}`},{key:"B",text:`y=f(x+${a})+${b}`},{key:"C",text:`y=f(x-${a})-${b}`},{key:"D",text:`y=f(x+${a})-${b}`}]), answer:"A", analysis:"左加右减、上加下减", type:"single_choice" }; })()],
  37: (i) => [(() => { const a = ri(2,4); return { content: `y=f(x) 纵坐标伸长为 ${a} 倍 → ?`, options: JSON.stringify([{key:"A",text:`y=${a}f(x)`},{key:"B",text:`y=f(${a}x)`},{key:"C",text:`y=f(x)/${a}`},{key:"D",text:`y=f(x+${a})`}]), answer:"A", analysis:`纵伸改变函数值：y=${a}f(x)`, type:"single_choice" }; })()],
  38: (i) => [(() => { return { content: "y=f(x) 关于 x 轴对称翻折 → ?", options: JSON.stringify([{key:"A",text:"y=-f(x)"},{key:"B",text:"y=f(-x)"},{key:"C",text:"y=|f(x)|"},{key:"D",text:"y=f(|x|)"}]), answer:"A", analysis:"关于 x 轴对称：y→-y", type:"single_choice" }; })()],
  39: (i) => [(() => { const a = ri(2,6); return { content: `f(x)=${a}x²+1 是？`, options: JSON.stringify([{key:"A",text:"偶函数"},{key:"B",text:"奇函数"},{key:"C",text:"非奇非偶"},{key:"D",text:"既是奇又是偶"}]), answer:"A", analysis:`f(-x)=${a}x²+1=f(x) → 偶函数`, type:"single_choice" }; })()],
  40: (i) => [(() => { const a = ri(1,6); return { content: `f(x)=${a}x³ 是？`, options: JSON.stringify([{key:"A",text:"奇函数"},{key:"B",text:"偶函数"},{key:"C",text:"非奇非偶"},{key:"D",text:"既是奇又是偶"}]), answer:"A", analysis:`f(-x)=-${a}x³=-f(x) → 奇函数`, type:"single_choice" }; })()],
  41: (i) => [(() => { return { content: "奇函数 + 偶函数 = ?", options: JSON.stringify([{key:"A",text:"一般非奇非偶"},{key:"B",text:"必为奇函数"},{key:"C",text:"必为偶函数"},{key:"D",text:"必为常函数"}]), answer:"A", analysis:"奇+偶一般不具奇偶性", type:"single_choice" }; })()],
  42: (i) => [(() => { return { content: "f 奇、g 偶，则 f(g(x)) 是？", options: JSON.stringify([{key:"A",text:"偶函数"},{key:"B",text:"奇函数"},{key:"C",text:"非奇非偶"},{key:"D",text:"无法判断"}]), answer:"A", analysis:"f(g(-x))=f(g(x)) → 偶函数", type:"single_choice" }; })()],
  43: (i) => [(() => { return { content: "下列为常见奇函数的是？", options: JSON.stringify([{key:"A",text:"y=x³"},{key:"B",text:"y=x²"},{key:"C",text:"y=|x|"},{key:"D",text:"y=cos x"}]), answer:"A", analysis:"奇次幂函数为奇函数", type:"single_choice" }; })()],
  44: (i) => [(() => { return { content: "下列为常见偶函数的是？", options: JSON.stringify([{key:"A",text:"y=x²"},{key:"B",text:"y=x³"},{key:"C",text:"y=x"},{key:"D",text:"y=1/x"}]), answer:"A", analysis:"偶次幂函数为偶函数", type:"single_choice" }; })()],
  45: (i) => [(() => { const T = ri(2,6); return { content: `f(x+${T})=f(x) 恒成立，周期为？`, options: JSON.stringify([{key:"A",text:`${T}`},{key:"B",text:`${2*T}`},{key:"C",text:"1"},{key:"D",text:"0"}]), answer:"A", analysis:`由定义，${T} 是周期`, type:"single_choice" }; })()],
  46: (i) => [(() => { const a = ri(1,5); return { content: `f(${a}+x)=f(${a}-x) 恒成立 → 关于？对称`, options: JSON.stringify([{key:"A",text:`直线 x=${a}`},{key:"B",text:"y 轴"},{key:"C",text:`直线 x=-${a}`},{key:"D",text:"x 轴"}]), answer:"A", analysis:`关于直线 x=${a} 对称`, type:"single_choice" }; })()],
  47: (i) => [(() => { const a = ri(1,4); return { content: `f(${a}+x)+f(${a}-x)=2b → 关于？对称`, options: JSON.stringify([{key:"A",text:`点 (${a},b) 中心对称`},{key:"B",text:`直线 x=${a}`},{key:"C",text:`点 (b,${a})`},{key:"D",text:"y 轴"}]), answer:"A", analysis:`关于点 (${a},b) 中心对称`, type:"single_choice" }; })()],
  48: (i) => [(() => { const T = ri(2,4), a = ri(1,3); return { content: `f 周期 ${T} 且关于 x=${a} 对称 → 新周期为？`, options: JSON.stringify([{key:"A",text:`${2*T}`},{key:"B",text:`${T}`},{key:"C",text:`${T+a}`},{key:"D",text:`${2*a}`}]), answer:"A", analysis:`有对称轴的周期函数存在半周期对称，2T 必为周期`, type:"single_choice" }; })()],
  49: (i) => [(() => { const a = ri(2,5), n = ri(2,4); const v = Math.pow(a,n); return { content: `√[${n}]{${v}} = ？`, options: JSON.stringify([{key:"A",text:`${a}`},{key:"B",text:`${a*n}`},{key:"C",text:`${v}`},{key:"D",text:"1"}]), answer:"A", analysis:`${a}^${n}=${v} → √[${n}]{${v}}=${a}`, type:"single_choice" }; })()],
  50: (i) => [(() => { const a = ri(2,4), m = ri(2,4), n = ri(2,4); const v = Math.pow(a,m+n); return { content: `${a}^${m} × ${a}^${n} = ？`, options: JSON.stringify([{key:"A",text:`${v}`},{key:"B",text:`${Math.pow(a,m*n)}`},{key:"C",text:`${Math.pow(a,m)+Math.pow(a,n)}`},{key:"D",text:`${Math.pow(a,m-n)}`}]), answer:"A", analysis:`同底数幂相乘指数相加：${a}^${m+n}=${v}`, type:"single_choice" }; })()],
  51: (i) => [(() => { const a = pick([2,3]); return { content: `指数函数 y=${a}^x 恒过点？`, options: JSON.stringify([{key:"A",text:"(0,1)"},{key:"B",text:"(1,0)"},{key:"C",text:"(0,0)"},{key:"D",text:`(${a},1)`}]), answer:"A", analysis:"a⁰=1 → 恒过 (0,1)", type:"single_choice" }; })()],
  52: (i) => [(() => { const a = ri(2,5); return { content: `log_${a} 1 = ？`, options: JSON.stringify([{key:"A",text:"0"},{key:"B",text:"1"},{key:"C",text:`${a}`},{key:"D",text:"-1"}]), answer:"A", analysis:"任何底 log_a 1=0", type:"single_choice" }; })()],
  53: (i) => [(() => { const a = ri(2,5), b = ri(2,5); const va = Math.pow(2,a), vb = Math.pow(2,b); return { content: `log₂${va} + log₂${vb} = ？`, options: JSON.stringify([{key:"A",text:`${a+b}`},{key:"B",text:`${a}`},{key:"C",text:`${b}`},{key:"D",text:`${a*b}`}]), answer:"A", analysis:`log₂${va}=${a}，log₂${vb}=${b}，和=${a+b}`, type:"single_choice" }; })()],
  54: (i) => [(() => { return { content: "换底公式 log_a b = ？", options: JSON.stringify([{key:"A",text:"log_c b / log_c a"},{key:"B",text:"log_c a / log_c b"},{key:"C",text:"log_a c × log_c b"},{key:"D",text:"log_b c"}]), answer:"A", analysis:"换底公式：log_a b = log_c b / log_c a", type:"single_choice" }; })()],
  55: (i) => [(() => { const a = ri(2,4); return { content: `对数函数 y=log_${a} x 恒过点？`, options: JSON.stringify([{key:"A",text:"(1,0)"},{key:"B",text:"(0,1)"},{key:"C",text:"(0,0)"},{key:"D",text:"(1,1)"}]), answer:"A", analysis:"log_a 1=0 → 恒过 (1,0)", type:"single_choice" }; })()],
  56: (i) => [(() => { const a = ri(2,4); return { content: `幂函数 y=x^${a} 恒过点？`, options: JSON.stringify([{key:"A",text:"(1,1)"},{key:"B",text:"(0,1)"},{key:"C",text:"(1,0)"},{key:"D",text:`(${a},0)`}]), answer:"A", analysis:"1 的任何次幂为 1 → 恒过 (1,1)", type:"single_choice" }; })()],
  57: (i) => [(() => { const a = ri(1,4), b = ri(2,5); const x = b/a; return { content: `f(x)=${a}x-${b} 的零点为？`, options: JSON.stringify([{key:"A",text:`${x}`},{key:"B",text:`${-x}`},{key:"C",text:`${b}`},{key:"D",text:`${a}`}]), answer:"A", analysis:`令 f(x)=0 → x=${b}/${a}=${x}`, type:"single_choice" }; })()],
  58: (i) => [(() => { const a = ri(1,3); return { content: `f(x)=x³-${a}x-1，若 f(${a})·f(${a}+1)<0 → 零点区间？`, options: JSON.stringify([{key:"A",text:`(${a},${a+1})`},{key:"B",text:`(${a-1},${a})`},{key:"C",text:`(${a+1},${a+2})`},{key:"D",text:"无法确定"}]), answer:"A", analysis:"零点存在性定理：端点异号则零点在区间内", type:"single_choice" }; })()],
  59: (i) => [(() => { const p = ri(2,5), q = ri(1,3); const d = p*p - 4*q; return { content: `x²-${p}x+${q}=0 的判别式 Δ = ？`, options: JSON.stringify([{key:"A",text:`${d}`},{key:"B",text:`${p*p+4*q}`},{key:"C",text:`${p-4*q}`},{key:"D",text:`${4*q}`}]), answer:"A", analysis:`Δ=b²-4ac=${p}²-4×1×${q}=${d}`, type:"single_choice" }; })()],
  60: (i) => [(() => { const a = ri(3,8), b = ri(2,4); const va = Math.log2(a), vb = Math.log2(b); const bigger = va > vb ? "前者大" : "后者大"; return { content: `比较 log₂${a} 与 log₂${b} 大小？`, options: JSON.stringify([{key:"A",text:`${bigger}`},{key:"B",text:"相等"},{key:"C",text:"无法比较"},{key:"D",text:"相等且最大"}]), answer:"A", analysis:`log₂ 单调递增，${a}${va>vb?">":"<"}${b} → ${bigger}`, type:"single_choice" }; })()],
  61: (i) => [(() => { const a = ri(2,4); return { content: `幂函数 y=x^${a} 在 (0,+∞) 单调？`, options: JSON.stringify([{key:"A",text:"递增"},{key:"B",text:"递减"},{key:"C",text:"先增后减"},{key:"D",text:"不单调"}]), answer:"A", analysis:`指数 ${a}>0 → 在 (0,+∞) 递增`, type:"single_choice" }; })()],
  62: (i) => [(() => { const a = ri(3,7), b = ri(1,2); const mid = (a+b)/2; return { content: `二分法求 f(x)=x²-${a} 零点，区间 [${b},${a}] 第一次取中点？`, options: JSON.stringify([{key:"A",text:`${mid}`},{key:"B",text:`${(a-b)/2}`},{key:"C",text:`${a}`},{key:"D",text:`${b}`}]), answer:"A", analysis:`中点=(${a}+${b})/2=${mid}`, type:"single_choice" }; })()],

  63: (i) => [(() => { const d = pick([30,45,60,90,120,180,270]); const r = d*Math.PI/180; const rn = d==30?Math.PI/6:d==45?Math.PI/4:d==60?Math.PI/3:d==90?Math.PI/2:d==120?2*Math.PI/3:d==180?Math.PI:3*Math.PI/2; const txt = d==30?"π/6":d==45?"π/4":d==60?"π/3":d==90?"π/2":d==120?"2π/3":d==180?"π":"3π/2"; return { content: `${d}° = ？弧度`, options: JSON.stringify([{key:"A",text:txt},{key:"B",text:`${d}π/180`},{key:"C",text:"π"},{key:"D",text:"2π"}]), answer:"A", analysis:`${d}° = ${d}×π/180 = ${txt}`, type:"single_choice" }; })()],
  64: (i) => [(() => { const r = ri(2,5), ang = pick([30,45,60,90]); const rad = ang*Math.PI/180; const L = r*rad; const txt = rn=>rn==0?"":rn; const frac = ang==30?"π/6":ang==45?"π/4":ang==60?"π/3":"π/2"; const ltxt = `${r}×${frac}`; return { content: `半径 ${r}、圆心角 ${ang}° 的弧长 l = ？`, options: JSON.stringify([{key:"A",text:ltxt},{key:"B",text:`${r}`},{key:"C",text:`${r*ang}`},{key:"D",text:"π"}]), answer:"A", analysis:`l = rθ = ${r}×${ang}°(弧度) = ${r}×${frac}`, type:"single_choice" }; })()],
  65: (i) => [(() => { const a = ri(3,5), b = ri(4,6); const hyp = Math.hypot(a,b); return { content: `角 α 终边过点 (${a},${b})，sinα = ？`, options: JSON.stringify([{key:"A",text:`${b}/${hyp}`},{key:"B",text:`${a}/${hyp}`},{key:"C",text:`${a}/${b}`},{key:"D",text:`${hyp}/${b}`}]), answer:"A", analysis:`r=√(${a}²+${b}²)=${hyp}，sinα=y/r=${b}/${hyp}`, type:"single_choice" }; })()],
  66: (i) => [(() => { const q = pick([1,2,3,4]); const s = q==1?"正":q==2?"负":q==3?"负":"正"; return { content: `角 α 在第二象限，sinα 的符号是？`, options: JSON.stringify([{key:"A",text:"正"},{key:"B",text:"负"},{key:"C",text:"0"},{key:"D",text:"不确定"}]), answer:"A", analysis:"第二象限 sin>0", type:"single_choice" }; })()],
  67: (i) => [(() => { const a = pick([3,5,8]); const b = pick([4,12,15]); const hyp = Math.hypot(a,b); const t = (b/a).toFixed(2); return { content: `sinα=3/5，α 为锐角，则 cosα = ？`, options: JSON.stringify([{key:"A",text:"4/5"},{key:"B",text:"3/5"},{key:"C",text:"5/4"},{key:"D",text:"5/3"}]), answer:"A", analysis:`cosα=√(1-sin²α)=√(1-9/25)=4/5`, type:"single_choice" }; })()],
  68: (i) => [(() => { const d = pick([30,45,60]); const v = d==30?1/2:d==45?Math.SQRT2/2:Math.SQRT3/2; const txt = d==30?"1/2":d==45?"√2/2":"√3/2"; return { content: `sin(${180+d}°) = ？`, options: JSON.stringify([{key:"A",text:`-${txt}`},{key:"B",text:txt},{key:"C",text:"0"},{key:"D",text:"1"}]), answer:"A", analysis:`sin(${180+d}°)=-sin${d}°=-${txt}（诱导公式）`, type:"single_choice" }; })()],
  69: (i) => [(() => { const w = pick([1,2,3]); const T = 2*Math.PI/w; const txt = w==1?"2π":w==2?"π":"2π/3"; return { content: `函数 y=sin(${w}x) 的最小正周期 T = ？`, options: JSON.stringify([{key:"A",text:txt},{key:"B",text:"π"},{key:"C",text:"2π"},{key:"D",text:"4π"}]), answer:"A", analysis:`T=2π/ω=2π/${w}=${txt}`, type:"single_choice" }; })()],
  70: (i) => [(() => { const a = ri(2,4); return { content: `y=sin x 图像横坐标缩短到 1/${a} → y=？`, options: JSON.stringify([{key:"A",text:`y=sin(${a}x)`},{key:"B",text:`y=sin(x/${a})`},{key:"C",text:`y=${a}sin x`},{key:"D",text:`y=sin(x+${a})`}]), answer:"A", analysis:`横缩：x→${a}x，即 y=sin(${a}x)`, type:"single_choice" }; })()],
  71: (i) => [(() => { const a = ri(1,5), b = ri(1,5); const R = Math.hypot(a,b); return { content: `asin x + bcos x = R·sin(x+φ)，R = ？ (a=${a},b=${b})`, options: JSON.stringify([{key:"A",text:`√${a*a+b*b}`},{key:"B",text:`${a+b}`},{key:"C",text:`${a*b}`},{key:"D",text:`${Math.abs(a-b)}`}]), answer:"A", analysis:`R=√(a²+b²)=√(${a*a}+${b*b})=√${a*a+b*b}`, type:"single_choice" }; })()],
  72: (i) => [(() => { const a = pick([1,2,3]); const v = a==1?1:a==2?0.5:0; const v2 = a==1?2:0.5; return { content: `sin${60}°cos${30}°+cos${60}°sin${30}° = sin${90}° = ？`, options: JSON.stringify([{key:"A",text:"1"},{key:"B",text:"0.5"},{key:"C",text:"0"},{key:"D",text:"2"}]), answer:"A", analysis:"sin60°cos30°+cos60°sin30°=sin(60°+30°)=sin90°=1", type:"single_choice" }; })()],
  73: (i) => [(() => { const a1=ri(1,5),a2=ri(1,5),b1=ri(1,5),b2=ri(1,5); return { content: `a=(${a1},${a2})，b=(${b1},${b2})，a+b = ？`, options: JSON.stringify([{key:"A",text:`(${a1+b1},${a2+b2})`},{key:"B",text:`(${a1-b1},${a2-b2})`},{key:"C",text:`(${a1},${b2})`},{key:"D",text:`(${b1},${a2})`}]), answer:"A", analysis:`向量加法坐标相加：(${a1+b1},${a2+b2})`, type:"single_choice" }; })()],
  74: (i) => [(() => { const a1=ri(1,5),a2=ri(1,5),b1=ri(1,5),b2=ri(1,5); return { content: `a=(${a1},${a2})，b=(${b1},${b2})，a-b = ？`, options: JSON.stringify([{key:"A",text:`(${a1-b1},${a2-b2})`},{key:"B",text:`(${a1+b1},${a2+b2})`},{key:"C",text:`(${a1},${b2})`},{key:"D",text:`(${b1},${a2})`}]), answer:"A", analysis:`向量减法坐标相减：(${a1-b1},${a2-b2})`, type:"single_choice" }; })()],
  75: (i) => [(() => { const k = ri(2,4); return { content: `a=(1,2)，b=(${k},${2*k})，则 a 与 b？`, options: JSON.stringify([{key:"A",text:"平行"},{key:"B",text:"垂直"},{key:"C",text:"夹角60°"},{key:"D",text:"夹角30°"}]), answer:"A", analysis:`b=${k}a → 共线平行`, type:"single_choice" }; })()],
  76: (i) => [(() => { const k = ri(1,4); return { content: `a=(${k},2)，b=(2,${-k})，则 a·b = ？`, options: JSON.stringify([{key:"A",text:`${k*2+2*(-k)}`},{key:"B",text:`${k*2}`},{key:"C",text:"4"},{key:"D",text:"2"}]), answer:"A", analysis:`a·b=${k}×2+2×(${-k})=${k*2-2*k}=0 → 垂直`, type:"single_choice" }; })()],
  77: (i) => [(() => { const a1=ri(1,4),a2=ri(1,4),b1=ri(1,4),b2=ri(1,4); const dot=a1*b1+a2*b2; return { content: `a=(${a1},${a2})，b=(${b1},${b2})，a·b = ？`, options: JSON.stringify([{key:"A",text:`${dot}`},{key:"B",text:`${a1*b1}`},{key:"C",text:`${a2*b2}`},{key:"D",text:`${a1*b2}`}]), answer:"A", analysis:`a·b=${a1}×${b1}+${a2}×${b2}=${dot}`, type:"single_choice" }; })()],
  78: (i) => [(() => { const a1=ri(3,5),a2=ri(4,6); const m=Math.hypot(a1,a2); return { content: `a=(${a1},${a2})，|a| = ？`, options: JSON.stringify([{key:"A",text:`${m}`},{key:"B",text:`${a1+a2}`},{key:"C",text:`${a1*a2}`},{key:"D",text:`${Math.sqrt(a1*a2)}`}]), answer:"A", analysis:`|a|=√(${a1}²+${a2}²)=${m}`, type:"single_choice" }; })()],
  79: (i) => [(() => { const a=ri(2,4),b=ri(2,4),x=ri(1,4); const proj=(a*x)/(a*a); const pt=(proj*100|0)/100; return { content: `a=(${a},0)，b=(${x},${b})，b 在 a 上的投影 = ？`, options: JSON.stringify([{key:"A",text:`${x}`},{key:"B",text:`${b}`},{key:"C",text:`${a}`},{key:"D",text:"0"}]), answer:"A", analysis:`投影 = b·a/|a| = ${a}×${x}/${a} = ${x}`, type:"single_choice" }; })()],
  80: (i) => [(() => { const a=ri(1,3),b=ri(1,3); const dot=a*b; const ma=Math.hypot(a,a), mb=Math.hypot(b,b); const cos=(dot/(ma*mb)).toFixed(2); const deg = cos==0.5?"60°":cos==0?"90°":"45°"; return { content: `a=(${a},${a})，b=(${b},0)，a 与 b 夹角 = ？`, options: JSON.stringify([{key:"A",text:cos==0.5?"60°":cos==0?"90°":`45°`},{key:"B",text:"30°"},{key:"C",text:"120°"},{key:"D",text:"180°"}]), answer:"A", analysis:`cosθ=a·b/(|a||b|)=${dot}/${ma*mb}=${cos} → 夹角${cos==0.5?"60°":cos==0?"90°":"45°"}`, type:"single_choice" }; })()],
  81: (i) => [(() => { const a=ri(2,5),b=ri(2,5); const m=Math.hypot(a,b); return { content: `a=(${a},${b})，a 的单位向量 = ？`, options: JSON.stringify([{key:"A",text:`(${a}/${m},${b}/${m})`},{key:"B",text:`(${m}/${a},${m}/${b})`},{key:"C",text:`(${a},${b})`},{key:"D",text:`(${b},${a})`}]), answer:"A", analysis:`e = a/|a| = (${a}/${m},${b}/${m})`, type:"single_choice" }; })()],
  82: (i) => [(() => { const t=ri(1,3); return { content: `A(1,0)，B(2,0)，C(${t+1},0)，则 A、B、C？`, options: JSON.stringify([{key:"A",text:"三点共线"},{key:"B",text:"构成三角形"},{key:"C",text:"互不相关"},{key:"D",text:"构成矩形"}]), answer:"A", analysis:`三点纵坐标均为 0，在 x 轴上 → 共线`, type:"single_choice" }; })()],
  83: (i) => [(() => { return { content: "△ABC 重心 G 满足 GA+GB+GC = ？", options: JSON.stringify([{key:"A",text:"0"},{key:"B",text:"AB"},{key:"C",text:"AC"},{key:"D",text:"BC"}]), answer:"A", analysis:"重心性质：三条中线交点，GA+GB+GC=0", type:"single_choice" }; })()],
  84: (i) => [(() => { const a=ri(2,4), A=30, B=60; return { content: `△ABC 中 a=${a}，∠A=30°，∠B=60°，则 b = ？`, options: JSON.stringify([{key:"A",text:`${a*Math.sqrt(3)}`},{key:"B",text:`${a/2}`},{key:"C",text:`${2*a}`},{key:"D",text:`${a*2/3}`}]), answer:"A", analysis:`正弦定理 b/sin60°=a/sin30° → b=${a}√3`, type:"single_choice" }; })()],
  85: (i) => [(() => { const a=3,b=4,C=90; return { content: `△ABC 中 a=${a}，b=${b}，∠C=90°，c = ？`, options: JSON.stringify([{key:"A",text:"5"},{key:"B",text:"7"},{key:"C",text:"12"},{key:"D",text:"6"}]), answer:"A", analysis:`余弦定理 c²=a²+b²=${a*a+b*b}=25 → c=5`, type:"single_choice" }; })()],
  86: (i) => [(() => { const a=ri(2,5),b=ri(2,5); const S=a*b/2; return { content: `△ABC 中 ∠C=90°，a=${a}，b=${b}，面积 S = ？`, options: JSON.stringify([{key:"A",text:`${S}`},{key:"B",text:`${a*b}`},{key:"C",text:`${a+b}`},{key:"D",text:`${a*b/4}`}]), answer:"A", analysis:`S=½ab=½×${a}×${b}=${S}`, type:"single_choice" }; })()],
  87: (i) => [(() => { const a=ri(3,6); return { content: `△ABC 中 a=${a}，b=${a}，∠C=60°，c² = ？`, options: JSON.stringify([{key:"A",text:`${a*a}`},{key:"B",text:`${2*a*a}`},{key:"C",text:`${a*a*3}`},{key:"D",text:`${a*a/2}`}]), answer:"A", analysis:`c²=a²+b²-2abcos60°=${a*a}+${a*a}-${a*a}=${a*a}`, type:"single_choice" }; })()],
  88: (i) => [(() => { const n = ri(1,8); const v = n%4==0?1:n%4==1?"i":n%4==2?-1:"-i"; return { content: `i^${n} = ？`, options: JSON.stringify([{key:"A",text:v},{key:"B",text:"1"},{key:"C",text:"-1"},{key:"D",text:"i"}]), answer:"A", analysis:`i 的幂以 4 为周期：i^${n}=${v}`, type:"single_choice" }; })()],
  89: (i) => [(() => { const a=ri(1,5),b=ri(2,6); const m=Math.hypot(a,b); return { content: `z=${a}+${b}i，|z| = ？`, options: JSON.stringify([{key:"A",text:`${m}`},{key:"B",text:`${a+b}`},{key:"C",text:`${a*b}`},{key:"D",text:`${b-a}`}]), answer:"A", analysis:`|z|=√(${a}²+${b}²)=${m}`, type:"single_choice" }; })()],
  90: (i) => [(() => { const a=ri(1,5),b=ri(1,5); return { content: `z=${a}+${b}i，则 z̄ = ？`, options: JSON.stringify([{key:"A",text:`${a}-${b}i`},{key:"B",text:`-${a}-${b}i`},{key:"C",text:`-${a}+${b}i`},{key:"D",text:`${a}+${b}i`}]), answer:"A", analysis:`共轭复数：虚部变号，z̄=${a}-${b}i`, type:"single_choice" }; })()],
  91: (i) => [(() => { const a=ri(2,5),b=ri(1,5); const m=a*a+b*b; return { content: `z=${a}+${b}i，z·z̄ = ？`, options: JSON.stringify([{key:"A",text:`${m}`},{key:"B",text:`${a*a}`},{key:"C",text:`${b*b}`},{key:"D",text:`${a+b}`}]), answer:"A", analysis:`z·z̄=a²+b²=${a}²+${b}²=${m}`, type:"single_choice" }; })()],
  92: (i) => [(() => { const a=ri(1,4),b=ri(1,4),c=ri(1,4),d=ri(1,4); return { content: `(${a}+${b}i)+(${c}+${d}i) = ？`, options: JSON.stringify([{key:"A",text:`${a+c}+${b+d}i`},{key:"B",text:`${a+c}-${b+d}i`},{key:"C",text:`${a-c}+${b-d}i`},{key:"D",text:`${a*c}+${b*d}i`}]), answer:"A", analysis:`复数加法：实部加实部，虚部加虚部 = ${a+c}+${b+d}i`, type:"single_choice" }; })()],
  93: (i) => [(() => { const a=ri(1,4),b=ri(1,4); return { content: `复数 z=${a}+${b}i 在复平面内对应的点？`, options: JSON.stringify([{key:"A",text:`(${a},${b})`},{key:"B",text:`(${b},${a})`},{key:"C",text:`(${a},-${b})`},{key:"D",text:`(-${a},${b})`}]), answer:"A", analysis:`z=a+bi 对应点 (a,b) = (${a},${b})`, type:"single_choice" }; })()],
  94: (i) => [(() => { const a=ri(1,4),b=ri(1,4); return { content: `若 ${a}+${b}i = x+yi，则 x、y = ？`, options: JSON.stringify([{key:"A",text:`x=${a}，y=${b}`},{key:"B",text:`x=${b}，y=${a}`},{key:"C",text:`x=${a}，y=-${b}`},{key:"D",text:`x=-${a}，y=${b}`}]), answer:"A", analysis:`复数相等：实部实部、虚部虚部相等`, type:"single_choice" }; })()],
  95: (i) => [(() => { return { content: "复数 z 为实数的条件是？", options: JSON.stringify([{key:"A",text:"虚部=0"},{key:"B",text:"实部=0"},{key:"C",text:"实部=虚部"},{key:"D",text:"模=1"}]), answer:"A", analysis:"z=a+bi 为实数 ⇔ b=0", type:"single_choice" }; })()],
  96: (i) => [(() => { const a=ri(1,3),b=ri(1,3); const m1=Math.hypot(a,b),m2=Math.hypot(b,a); return { content: `|${a}+${b}i| 与 |${b}+${a}i| 的关系？`, options: JSON.stringify([{key:"A",text:"相等"},{key:"B",text:"前者大"},{key:"C",text:"后者大"},{key:"D",text:"无法比较"}]), answer:"A", analysis:`两者模均为 √${a*a+b*b}，相等`, type:"single_choice" }; })()],

  97: (i) => [(() => { const a=ri(2,4),b=ri(2,4),h=ri(2,4); return { content: `斜二测画法中，y 轴方向长度变为原来的？`, options: JSON.stringify([{key:"A",text:"1/2"},{key:"B",text:"√2/2"},{key:"C",text:"1"},{key:"D",text:"2"}]), answer:"A", analysis:"斜二测：y 轴方向长度减半，x 轴不变", type:"single_choice" }; })()],
  98: (i) => [(() => { const a=ri(2,4); return { content: `水平放置的正方形，其斜二测直观图面积是原面积的？`, options: JSON.stringify([{key:"A",text:"√2/4"},{key:"B",text:"1/2"},{key:"C",text:"√2/2"},{key:"D",text:"1/4"}]), answer:"A", analysis:"直观图面积 = 原面积 × √2/4", type:"single_choice" }; })()],
  99: (i) => [(() => { return { content: "三个不共线的点可以确定？", options: JSON.stringify([{key:"A",text:"一个平面"},{key:"B",text:"一条直线"},{key:"C",text:"两个平面"},{key:"D",text:"一个点"}]), answer:"A", analysis:"公理：不共线三点确定一个平面", type:"single_choice" }; })()],
  100: (i) => [(() => { return { content: "空间中，若 a∥b 且 b∥c，则 a 与 c 的关系是？", options: JSON.stringify([{key:"A",text:"平行"},{key:"B",text:"垂直"},{key:"C",text:"相交"},{key:"D",text:"异面"}]), answer:"A", analysis:"平行公理：平行于同一直线的两直线平行", type:"single_choice" }; })()],
  101: (i) => [(() => { const a=ri(2,5); return { content: `线面平行判定定理：a∥b，a 在面外，b 在面内 → a 与面？`, options: JSON.stringify([{key:"A",text:"平行"},{key:"B",text:"垂直"},{key:"C",text:"相交"},{key:"D",text:"无法确定"}]), answer:"A", analysis:"线面平行判定：线线平行→线面平行", type:"single_choice" }; })()],
  102: (i) => [(() => { return { content: "面面平行判定：一个面内两条相交直线都平行于另一个面 → 两面？", options: JSON.stringify([{key:"A",text:"平行"},{key:"B",text:"垂直"},{key:"C",text:"相交"},{key:"D",text:"重合"}]), answer:"A", analysis:"面面平行判定：面内两相交线平行于另一面", type:"single_choice" }; })()],
  103: (i) => [(() => { return { content: "线面垂直判定：直线垂直于面内两条相交直线 → 直线与面？", options: JSON.stringify([{key:"A",text:"垂直"},{key:"B",text:"平行"},{key:"C",text:"斜交"},{key:"D",text:"无法确定"}]), answer:"A", analysis:"线面垂直判定定理", type:"single_choice" }; })()],
  104: (i) => [(() => { return { content: "面面垂直判定：一个面过另一个面的垂线 → 两面？", options: JSON.stringify([{key:"A",text:"垂直"},{key:"B",text:"平行"},{key:"C",text:"相交不垂直"},{key:"D",text:"重合"}]), answer:"A", analysis:"面面垂直判定定理", type:"single_choice" }; })()],
  105: (i) => [(() => { return { content: "若直线 a⊥面 α，则 a 与面 α 内任意直线？", options: JSON.stringify([{key:"A",text:"垂直"},{key:"B",text:"平行"},{key:"C",text:"相交但不垂直"},{key:"D",text:"异面"}]), answer:"A", analysis:"线面垂直定义：垂直于面内所有直线", type:"single_choice" }; })()],
  106: (i) => [(() => { const a=ri(1,3); return { content: `正方体 ABCD-A₁B₁C₁D₁ 中，AB 与 A₁D₁ 所成角？`, options: JSON.stringify([{key:"A",text:"45°"},{key:"B",text:"90°"},{key:"C",text:"30°"},{key:"D",text:"60°"}]), answer:"A", analysis:"AB 与 A₁D₁ 异面，平移后夹角为 45°（与面对角线）", type:"single_choice" }; })()],
  107: (i) => [(() => { return { content: "正方体中，体对角线 AC₁ 与底面 ABCD 所成角的正切值为？", options: JSON.stringify([{key:"A",text:"√2"},{key:"B",text:"1"},{key:"C",text:"√3"},{key:"D",text:"1/√3"}]), answer:"A", analysis:"线面角：tanθ=AA₁/AC=1/√2×√2=√2/2×2=√2", type:"single_choice" }; })()],
  108: (i) => [(() => { return { content: "二面角的范围是？", options: JSON.stringify([{key:"A",text:"[0°,180°]"},{key:"B",text:"[0°,90°]"},{key:"C",text:"(0°,90°)"},{key:"D",text:"[0°,360°]"}]), answer:"A", analysis:"二面角范围 [0°,180°]", type:"single_choice" }; })()],
  109: (i) => [(() => { const a=ri(2,5); return { content: `正方体棱长 ${a}，顶点到对面距离 = ？`, options: JSON.stringify([{key:"A",text:`${a}`},{key:"B",text:`${2*a}`},{key:"C",text:`${a*Math.SQRT2}`},{key:"D",text:`${a/2}`}]), answer:"A", analysis:`点到对面距离 = 棱长 = ${a}`, type:"single_choice" }; })()],
  110: (i) => [(() => { const a=ri(2,4); const S=6*a*a; return { content: `正方体棱长 ${a}，表面积 = ？`, options: JSON.stringify([{key:"A",text:`${S}`},{key:"B",text:`${a*a}`},{key:"C",text:`${a*a*a}`},{key:"D",text:`${12*a}`}]), answer:"A", analysis:`S=6a²=6×${a}²=${S}`, type:"single_choice" }; })()],
  111: (i) => [(() => { const a=ri(2,4); const V=a*a*a; return { content: `正方体棱长 ${a}，体积 = ？`, options: JSON.stringify([{key:"A",text:`${V}`},{key:"B",text:`${6*a*a}`},{key:"C",text:`${3*a}`},{key:"D",text:`${2*a}`}]), answer:"A", analysis:`V=a³=${a}³=${V}`, type:"single_choice" }; })()],
  112: (i) => [(() => { return { content: "空间中两条直线的关系不包括？", options: JSON.stringify([{key:"A",text:"重合"},{key:"B",text:"平行"},{key:"C",text:"相交"},{key:"D",text:"异面"}]), answer:"A", analysis:"空间中两直线：平行、相交、异面（不含重合，重合视为一条）", type:"single_choice" }; })()],
  113: (i) => [(() => { return { content: "线面垂直 + 线在面内 → 面面？的判定正确是？", options: JSON.stringify([{key:"A",text:"线垂直面，线在另一面内 → 两面垂直"},{key:"B",text:"线平行面 → 两面平行"},{key:"C",text:"线垂直面 → 两面平行"},{key:"D",text:"无法判断"}]), answer:"A", analysis:"面面垂直判定：一平面过另一平面的垂线", type:"single_choice" }; })()],
  114: (i) => [(() => { return { content: "三视图：主视图反映物体的？", options: JSON.stringify([{key:"A",text:"长和高"},{key:"B",text:"长和宽"},{key:"C",text:"宽和高"},{key:"D",text:"长宽高"}]), answer:"A", analysis:"主视图（正视图）反映长和高", type:"single_choice" }; })()],
  115: (i) => [(() => { const N=ri(100,200),n=ri(10,20),g=ri(3,5); return { content: `总体 ${N} 人，分 ${g} 层，各层人数 50,${N-100},50，按比例分层抽 ${n} 人，第一层抽几人？(按 50:${N-100}:50)`, options: JSON.stringify([{key:"A",text:`${Math.round(n*50/N)}`},{key:"B",text:`${Math.round(n/3)}`},{key:"C",text:`${n}`},{key:"D",text:`${Math.round(n*(N-100)/N)}`}]), answer:"A", analysis:`按比例：${Math.round(n*50/N)} 人`, type:"single_choice" }; })()],
  116: (i) => [(() => { const n=ri(10,20); return { content: `频率分布直方图中，所有小矩形面积之和 = ？`, options: JSON.stringify([{key:"A",text:"1"},{key:"B",text:`${n}`},{key:"C",text:"0.5"},{key:"D",text:"100"}]), answer:"A", analysis:"直方图面积=频率，总和=1", type:"single_choice" }; })()],
  117: (i) => [(() => { const d=[ri(1,9),ri(1,9),ri(1,9)]; const avg=(d[0]+d[1]+d[2])/3; const t=(avg*10|0)/10; return { content: `数据 ${d[0]},${d[1]},${d[2]} 的平均数 = ？`, options: JSON.stringify([{key:"A",text:`${t}`},{key:"B",text:`${d[0]+d[1]+d[2]}`},{key:"C",text:`${t+1}`},{key:"D",text:`${t-1}`}]), answer:"A", analysis:`平均数=(${d[0]}+${d[1]}+${d[2]})/3=${t}`, type:"single_choice" }; })()],
  118: (i) => [(() => { const n=ri(5,10); const p=ri(2,4); return { content: `10 个数据，第 ${p*10} 百分位数对应的位置 k = n×p/100 = ？(n=${n},p=${p*10})`, options: JSON.stringify([{key:"A",text:`${n*p/10}`},{key:"B",text:`${n}`},{key:"C",text:`${p}`},{key:"D",text:`${n*p}`}]), answer:"A", analysis:`k=${n}×${p*10}/100=${n*p/10}`, type:"single_choice" }; })()],
  119: (i) => [(() => { const a=ri(2,4); return { content: `直方图中，中位数对应的位置是？`, options: JSON.stringify([{key:"A",text:"面积平分处（50%）"},{key:"B",text:"最高柱处"},{key:"C",text:"第一柱处"},{key:"D",text:"最后一柱处"}]), answer:"A", analysis:"中位数：直方图面积左右各 50% 处", type:"single_choice" }; })()],
  120: (i) => [(() => { const x1=ri(1,5),x2=ri(3,7),x3=ri(4,8); const avg=(x1+x2+x3)/3; const v=((x1-avg)**2+(x2-avg)**2+(x3-avg)**2)/3; const t=(v*10|0)/10; return { content: `数据 ${x1},${x2},${x3} 的方差 ≈ ？`, options: JSON.stringify([{key:"A",text:`${t}`},{key:"B",text:`${t+1}`},{key:"C",text:"0"},{key:"D",text:`${avg}`}]), answer:"A", analysis:`方差 = Σ(xi-x̄)²/n ≈ ${t}`, type:"single_choice" }; })()],
  121: (i) => [(() => { return { content: "简单随机抽样的常用方法是？", options: JSON.stringify([{key:"A",text:"抽签法/随机数法"},{key:"B",text:"按成绩排"},{key:"C",text:"按学号奇偶"},{key:"D",text:"按班级分层"}]), answer:"A", analysis:"简单随机抽样：抽签法、随机数法", type:"single_choice" }; })()],
  122: (i) => [(() => { return { content: "样本容量越大，估计总体的误差通常？", options: JSON.stringify([{key:"A",text:"越小"},{key:"B",text:"越大"},{key:"C",text:"不变"},{key:"D",text:"不确定"}]), answer:"A", analysis:"大数定律：样本越大估计越准", type:"single_choice" }; })()],
  123: (i) => [(() => { return { content: "整理数据时，常用图表不包括？", options: JSON.stringify([{key:"A",text:"立体透视模型"},{key:"B",text:"频率分布直方图"},{key:"C",text:"茎叶图"},{key:"D",text:"折线图"}]), answer:"A", analysis:"统计图表：直方图、茎叶图、折线图等", type:"single_choice" }; })()],
  124: (i) => [(() => { return { content: "用样本估计总体的思想称为？", options: JSON.stringify([{key:"A",text:"用样本估计总体"},{key:"B",text:"精确计算"},{key:"C",text:"主观臆断"},{key:"D",text:"枚举所有"}]), answer:"A", analysis:"统计核心思想：样本估计总体", type:"single_choice" }; })()],
  125: (i) => [(() => { const d=[ri(1,5),ri(1,5),ri(1,5),ri(1,5),ri(1,5)]; const sorted=[...d].sort((a,b)=>a-b); const med=sorted[2]; return { content: `数据 ${d.join(',')} 的中位数 = ？`, options: JSON.stringify([{key:"A",text:`${med}`},{key:"B",text:`${sorted[0]}`},{key:"C",text:`${sorted[4]}`},{key:"D",text:`${sorted.reduce((a,b)=>a+b,0)/5}`}]), answer:"A", analysis:`排序后 ${sorted.join(',')}，中位数=${med}`, type:"single_choice" }; })()],
  126: (i) => [(() => { return { content: "能同时看数据分布和原始数值的图表是？", options: JSON.stringify([{key:"A",text:"茎叶图"},{key:"B",text:"饼图"},{key:"C",text:"条形图"},{key:"D",text:"折线图"}]), answer:"A", analysis:"茎叶图保留原始数据", type:"single_choice" }; })()],
  127: (i) => [(() => { const n=ri(3,8); const ev=Math.floor(n/2); return { content: `从 1~${n} 随机取一个数，取到偶数的概率 = ？`, options: JSON.stringify([{key:"A",text:`${ev}/${n}`},{key:"B",text:`1/2`},{key:"C",text:`${n-ev}/${n}`},{key:"D",text:`1/${n}`}]), answer:"A", analysis:`P=偶数个数/总数=${ev}/${n}`, type:"single_choice" }; })()],
  128: (i) => [(() => { const a=ri(2,4),b=ri(2,4); return { content: `P(A)=${a}/${a+b}，P(B)=${b}/${a+b}，A、B 互斥，P(A∪B) = ？`, options: JSON.stringify([{key:"A",text:"1"},{key:"B",text:`${a}/${a+b}`},{key:"C",text:`${b}/${a+b}`},{key:"D",text:"0"}]), answer:"A", analysis:`互斥：P(A∪B)=P(A)+P(B)=1`, type:"single_choice" }; })()],
  129: (i) => [(() => { const a=ri(2,4); return { content: `P(A)=${a}/${a+1}，则 P(Ā) = ？`, options: JSON.stringify([{key:"A",text:`1/${a+1}`},{key:"B",text:`${a}/${a+1}`},{key:"C",text:"0"},{key:"D",text:"1"}]), answer:"A", analysis:`对立事件：P(Ā)=1-P(A)=${1-a/(a+1)}`, type:"single_choice" }; })()],
  130: (i) => [(() => { return { content: "A 发生不影响 B 发生的概率，则 A、B？", options: JSON.stringify([{key:"A",text:"相互独立"},{key:"B",text:"互斥"},{key:"C",text:"对立"},{key:"D",text:"包含"}]), answer:"A", analysis:"独立定义：一事件发生不影响另一事件概率", type:"single_choice" }; })()],
  131: (i) => [(() => { const a=ri(2,4),b=ri(2,4); const p=(a*b)/((a+1)*(b+1)); const t=(p*10|0)/10; return { content: `P(A)=${a}/${a+1}，P(B)=${b}/${b+1}，独立，P(AB) = ？`, options: JSON.stringify([{key:"A",text:`${t}`},{key:"B",text:`${a/(a+1)}`},{key:"C",text:`${b/(b+1)}`},{key:"D",text:"1"}]), answer:"A", analysis:`独立：P(AB)=P(A)P(B)=${a}/${a+1}×${b}/${b+1}≈${t}`, type:"single_choice" }; })()],
  132: (i) => [(() => { return { content: "A、B 互斥且 A∪B=Ω，则 A、B 是？", options: JSON.stringify([{key:"A",text:"对立事件"},{key:"B",text:"独立事件"},{key:"C",text:"包含事件"},{key:"D",text:"无关事件"}]), answer:"A", analysis:"对立：互斥且并集为全集", type:"single_choice" }; })()],
  133: (i) => [(() => { return { content: "概率的基本性质：P(Ω) = ？", options: JSON.stringify([{key:"A",text:"1"},{key:"B",text:"0"},{key:"C",text:"0.5"},{key:"D",text:"∞"}]), answer:"A", analysis:"必然事件概率为 1", type:"single_choice" }; })()],
  134: (i) => [(() => { const n=ri(3,5); return { content: `掷两枚骰子，样本空间基本事件总数 = ？`, options: JSON.stringify([{key:"A",text:`36`},{key:"B",text:`${n*6}`},{key:"C",text:"12"},{key:"D",text:"6"}]), answer:"A", analysis:"样本空间：6×6=36 个基本事件", type:"single_choice" }; })()],
  135: (i) => [(() => { return { content: "频率与概率的关系：试验次数很大时频率趋近于？", options: JSON.stringify([{key:"A",text:"概率"},{key:"B",text:"0"},{key:"C",text:"1"},{key:"D",text:"样本容量"}]), answer:"A", analysis:"频率的稳定值即概率", type:"single_choice" }; })()],
  136: (i) => [(() => { const a=ri(2,4); return { content: `P(A)=${a}/10，P(B|A)=${1}/2，P(AB) = ？`, options: JSON.stringify([{key:"A",text:`${a/20}`},{key:"B",text:`${a/10}`},{key:"C",text:`${a/5}`},{key:"D",text:"1/2"}]), answer:"A", analysis:`P(AB)=P(A)P(B|A)=${a}/10×1/2=${a}/20`, type:"single_choice" }; })()],
  137: (i) => [(() => { return { content: "下列是随机试验的是？", options: JSON.stringify([{key:"A",text:"掷骰子观察点数"},{key:"B",text:"1+1=2"},{key:"C",text:"太阳从东升起"},{key:"D",text:"正方形的四边相等"}]), answer:"A", analysis:"随机试验：结果不确定的试验", type:"single_choice" }; })()],
  138: (i) => [(() => { return { content: "等可能事件的概率模型是？", options: JSON.stringify([{key:"A",text:"古典概型"},{key:"B",text:"几何概型"},{key:"C",text:"频率概型"},{key:"D",text:"主观概型"}]), answer:"A", analysis:"古典概型：有限等可能", type:"single_choice" }; })()],

  139: (i) => [(() => { return { content: "空间向量共面定理：三个向量共面的条件是？", options: JSON.stringify([{key:"A",text:"其中一个可由另外两个线性表示"},{key:"B",text:"三个都相等"},{key:"C",text:"三个都垂直"},{key:"D",text:"模都相等"}]), answer:"A", analysis:"共面定理：存在实数 λ,μ 使 c=λa+μb", type:"single_choice" }; })()],
  140: (i) => [(() => { return { content: "空间向量基本定理：任意向量可由？表示", options: JSON.stringify([{key:"A",text:"三个不共面向量唯一表示"},{key:"B",text:"两个向量表示"},{key:"C",text:"一个向量表示"},{key:"D",text:"四个向量唯一表示"}]), answer:"A", analysis:"空间向量基本定理：三个不共面向量张成整个空间", type:"single_choice" }; })()],
  141: (i) => [(() => { const a=ri(1,3),b=ri(2,4),c=ri(1,3); const m=Math.hypot(a,b,c); return { content: `a=(${a},${b},${c})，|a| = ？`, options: JSON.stringify([{key:"A",text:`${m}`},{key:"B",text:`${a+b+c}`},{key:"C",text:`${a*b*c}`},{key:"D",text:`${a*a+b*b+c*c}`}]), answer:"A", analysis:`|a|=√(${a}²+${b}²+${c}²)=${m}`, type:"single_choice" }; })()],
  142: (i) => [(() => { const a1=ri(1,3),a2=ri(1,3),a3=ri(1,3),b1=ri(1,3),b2=ri(1,3),b3=ri(1,3); const dot=a1*b1+a2*b2+a3*b3; return { content: `a=(${a1},${a2},${a3})，b=(${b1},${b2},${b3})，a·b = ？`, options: JSON.stringify([{key:"A",text:`${dot}`},{key:"B",text:`${a1*b1}`},{key:"C",text:`${a1+a2+a3}`},{key:"D",text:`${b1+b2+b3}`}]), answer:"A", analysis:`a·b=${a1}×${b1}+${a2}×${b2}+${a3}×${b3}=${dot}`, type:"single_choice" }; })()],
  143: (i) => [(() => { const k=ri(2,4); return { content: `a=(1,2,3)，b=(${k},${2*k},${3*k})，a 与 b？`, options: JSON.stringify([{key:"A",text:"平行"},{key:"B",text:"垂直"},{key:"C",text:"夹角60°"},{key:"D",text:"夹角30°"}]), answer:"A", analysis:`b=${k}a → 平行`, type:"single_choice" }; })()],
  144: (i) => [(() => { const a=ri(1,3); const cos=(a*a)/(a*a+1); const t=(cos*100|0)/100; return { content: `a=(1,0,0)，b=(${a},0,1)，cos<a,b> = ？`, options: JSON.stringify([{key:"A",text:`${a}/√${a*a+1}`},{key:"B",text:`${t}`},{key:"C",text:"0"},{key:"D",text:"1"}]), answer:"A", analysis:`cosθ=a·b/(|a||b|)=${a}/√(${a}²+1)=${a}/√${a*a+1}`, type:"single_choice" }; })()],
  145: (i) => [(() => { const a=ri(1,3); return { content: `平面 α 法向量 n 满足 n⊥α，若 α 过原点，n=(${a},1,1) 则 α 的方程是？`, options: JSON.stringify([{key:"A",text:`${a}x+y+z=0`},{key:"B",text:`x+y+z=${a}`},{key:"C",text:`${a}x+y+z=1`},{key:"D",text:"x=y=z"}]), answer:"A", analysis:`过原点且法向量 n：${a}x+y+z=0`, type:"single_choice" }; })()],
  146: (i) => [(() => { return { content: "向量法判定线面平行：直线方向向量 d ⊥ 法向量 n → 线面？", options: JSON.stringify([{key:"A",text:"平行"},{key:"B",text:"垂直"},{key:"C",text:"斜交"},{key:"D",text:"无法确定"}]), answer:"A", analysis:"d·n=0 → 线面平行（或线在面内）", type:"single_choice" }; })()],
  147: (i) => [(() => { const a=ri(1,3); const cos=(a*a)/(a*a+1); return { content: `向量法求线线角：cosθ = |a·b|/(|a||b|)，a=(1,0,0)，b=(${a},0,1)，θ = ？`, options: JSON.stringify([{key:"A",text:`arccos(${a}/√${a*a+1})`},{key:"B",text:"90°"},{key:"C",text:"0°"},{key:"D",text:"60°"}]), answer:"A", analysis:`cosθ=${a}/√${a*a+1} → θ=arccos(${a}/√${a*a+1})`, type:"single_choice" }; })()],
  148: (i) => [(() => { return { content: "向量法求线面角：sinθ = |d·n|/(|d||n|)，其中 d 是？", options: JSON.stringify([{key:"A",text:"直线方向向量"},{key:"B",text:"平面法向量"},{key:"C",text:"平面内任意向量"},{key:"D",text:"直线的法向量"}]), answer:"A", analysis:"线面角用直线方向向量与法向量夹角求", type:"single_choice" }; })()],
  149: (i) => [(() => { return { content: "向量法求二面角：cosθ = |n₁·n₂|/(|n₁||n₂|)，n₁、n₂ 是？", options: JSON.stringify([{key:"A",text:"两个面的法向量"},{key:"B",text:"两个面的方向向量"},{key:"C",text:"交线方向向量"},{key:"D",text:"棱上两点"}]), answer:"A", analysis:"二面角用两平面法向量夹角求", type:"single_choice" }; })()],
  150: (i) => [(() => { const a=ri(1,3),b=ri(1,3); const m=Math.hypot(a,b); return { content: `点到直线距离 d = |PA×v|/|v|，P(1,2,0)，A(0,0,0)，v=(${a},${b},0)，d = ？`, options: JSON.stringify([{key:"A",text:`${Math.abs(b-a)/m}`},{key:"B",text:`${m}`},{key:"C",text:`${a}`},{key:"D",text:"1"}]), answer:"A", analysis:`d=|PA×v|/|v|，计算得 ${(Math.abs(b-a)/m).toFixed(2)}`, type:"single_choice" }; })()],
  151: (i) => [(() => { return { content: "异面直线距离可用？求解", options: JSON.stringify([{key:"A",text:"公垂线段长/向量法"},{key:"B",text:"任意两点距离"},{key:"C",text:"两线夹角"},{key:"D",text:"投影长"}]), answer:"A", analysis:"异面直线距离：公垂线段长度", type:"single_choice" }; })()],
  152: (i) => [(() => { const a=ri(1,3); const m=Math.hypot(a,a,1); return { content: `点 P(0,0,0) 到平面 ${a}x+y+z=1 的距离 = ？`, options: JSON.stringify([{key:"A",text:`1/√${a*a+2}`},{key:"B",text:`${m}`},{key:"C",text:"1"},{key:"D",text:`${a}`}]), answer:"A", analysis:`d=|ax₀+by₀+cz₀+d|/√(a²+b²+c²)=1/√(${a}²+1+1)=1/√${a*a+2}`, type:"single_choice" }; })()],
  153: (i) => [(() => { return { content: "建立空间直角坐标系，常用？确定坐标轴", options: JSON.stringify([{key:"A",text:"三条两两垂直的直线（右手系）"},{key:"B",text:"任意三条直线"},{key:"C",text:"两条直线"},{key:"D",text:"一条直线"}]), answer:"A", analysis:"空间直角坐标系：三条两两垂直且有公共原点的数轴", type:"single_choice" }; })()],
  154: (i) => [(() => { const a=ri(1,3),b=ri(1,3),c=ri(1,3),k=ri(2,3); return { content: `a=(${a},${b},${c})，ka = ？`, options: JSON.stringify([{key:"A",text:`(${k*a},${k*b},${k*c})`},{key:"B",text:`(${a/k},${b/k},${c/k})`},{key:"C",text:`(${a+k},${b+k},${c+k})`},{key:"D",text:`(${a},${b},${c})`}]), answer:"A", analysis:`数乘：ka=(${k*a},${k*b},${k*c})`, type:"single_choice" }; })()],
  155: (i) => [(() => { return { content: "用向量法证明线面垂直：直线方向向量 d 与法向量 n 的关系？", options: JSON.stringify([{key:"A",text:"d∥n"},{key:"B",text:"d⊥n"},{key:"C",text:"d·n=1"},{key:"D",text:"d=n+1"}]), answer:"A", analysis:"线面垂直 ⇔ 方向向量平行于法向量", type:"single_choice" }; })()],
  156: (i) => [(() => { const a=ri(1,4); return { content: `正方体棱长 ${a}，体对角线 = ？`, options: JSON.stringify([{key:"A",text:`${a*Math.sqrt(3)}`},{key:"B",text:`${a*Math.sqrt(2)}`},{key:"C",text:`${3*a}`},{key:"D",text:`${2*a}`}]), answer:"A", analysis:`体对角线=√3·a=${a}√3`, type:"single_choice" }; })()],
  157: (i) => [(() => { const k=ri(1,5); return { content: `直线斜率 k=tanθ，θ=45°，k = ？`, options: JSON.stringify([{key:"A",text:"1"},{key:"B",text:"0"},{key:"C",text:"√3"},{key:"D",text:"不存在"}]), answer:"A", analysis:"k=tan45°=1", type:"single_choice" }; })()],
  158: (i) => [(() => { const k=ri(1,4),b=ri(1,4); return { content: `直线 y=${k}x+${b} 的斜截式对应的斜率是？`, options: JSON.stringify([{key:"A",text:`${k}`},{key:"B",text:`${b}`},{key:"C",text:`-${k}`},{key:"D",text:`-${b}`}]), answer:"A", analysis:"y=kx+b 中斜率 k", type:"single_choice" }; })()],
  159: (i) => [(() => { const k=ri(1,4); return { content: `直线 y=k(x-2)+3 恒过定点？`, options: JSON.stringify([{key:"A",text:"(2,3)"},{key:"B",text:"(-2,3)"},{key:"C",text:"(2,-3)"},{key:"D",text:"(0,0)"}]), answer:"A", analysis:`x=2 时 y=3，恒过 (2,3)`, type:"single_choice" }; })()],
  160: (i) => [(() => { const k1=ri(1,4),k2=ri(1,4); return { content: `两直线 y=${k1}x+1 与 y=-x/${k1} 的关系（斜率乘积-1）？`, options: JSON.stringify([{key:"A",text:"垂直"},{key:"B",text:"平行"},{key:"C",text:"重合"},{key:"D",text:"斜交"}]), answer:"A", analysis:`k₁·k₂=${k1}×(-1/${k1})=-1 → 垂直`, type:"single_choice" }; })()],
  161: (i) => [(() => { const a=ri(1,4); return { content: `点 P(1,1) 到直线 x-y+${a}=0 的距离 = ？`, options: JSON.stringify([{key:"A",text:`${a}/√2`},{key:"B",text:`${a}`},{key:"C",text:`${a*Math.SQRT2}`},{key:"D",text:"0"}]), answer:"A", analysis:`d=|1-1+${a}|/√2=${a}/√2`, type:"single_choice" }; })()],
  162: (i) => [(() => { const k=ri(1,4); return { content: `与直线 y=${k}x 平行的直线系方程为？`, options: JSON.stringify([{key:"A",text:`y=${k}x+b (b 任意)`},{key:"B",text:`y=-x/${k}+b`},{key:"C",text:`y=${k}x`},{key:"D",text:"x 任意"}]), answer:"A", analysis:`平行直线系：斜率相同，截距任意`, type:"single_choice" }; })()],
  163: (i) => [(() => { const r=ri(2,5); return { content: `圆心 (0,0) 半径 ${r} 的圆方程 = ？`, options: JSON.stringify([{key:"A",text:`x²+y²=${r*r}`},{key:"B",text:`x²+y²=${r}`},{key:"C",text:`x+y=${r}`},{key:"D",text:`x²-y²=${r*r}`}]), answer:"A", analysis:`标准方程：x²+y²=r²=${r*r}`, type:"single_choice" }; })()],
  164: (i) => [(() => { const r=ri(3,6),d=ri(1,3); const chord=2*Math.sqrt(r*r-d*d); const t=(chord*10|0)/10; return { content: `圆半径 ${r}，弦心距 ${d}，弦长 = ？`, options: JSON.stringify([{key:"A",text:`2√${r*r-d*d}`},{key:"B",text:`${2*d}`},{key:"C",text:`${r-d}`},{key:"D",text:`${t}`}]), answer:"A", analysis:`弦长=2√(r²-d²)=2√(${r*r}-${d*d})=2√${r*r-d*d}`, type:"single_choice" }; })()],
  165: (i) => [(() => { const r=ri(2,4); return { content: `圆 x²+y²=${r*r} 上点 (${r},0) 处的切线方程 = ？`, options: JSON.stringify([{key:"A",text:`x=${r}`},{key:"B",text:`y=${r}`},{key:"C",text:`x+y=${r}`},{key:"D",text:`x-y=${r}`}]), answer:"A", analysis:`切点半径垂直切线，切线 x=${r}`, type:"single_choice" }; })()],
  166: (i) => [(() => { const r=ri(2,4),d=ri(1,4); const rel = d<r?"相交":d==r?"相切":"相离"; return { content: `圆心到直线距离 d=${d}，圆半径 r=${r}，直线与圆？`, options: JSON.stringify([{key:"A",text:rel},{key:"B",text:"相交"},{key:"C",text:"相切"},{key:"D",text:"相离"}]), answer:"A", analysis:`d=${d}${d<r?"<":d==r?"=":">"}r=${r} → ${rel}`, type:"single_choice" }; })()],
  167: (i) => [(() => { const r1=ri(2,3),r2=ri(2,3),d=ri(4,7); const rel=d>r1+r2?"外离":d==r1+r2?"外切":"相交"; return { content: `两圆半径 ${r1}、${r2}，圆心距 ${d}，位置关系？`, options: JSON.stringify([{key:"A",text:rel},{key:"B",text:"内切"},{key:"C",text:"内含"},{key:"D",text:"无法确定"}]), answer:"A", analysis:`d=${d}${d>r1+r2?">":"="}r₁+r₂=${r1+r2} → ${rel}`, type:"single_choice" }; })()],
  168: (i) => [(() => { return { content: "两圆 x²+y²=1 与 x²+y²-2x=0 的公共弦所在直线方程？", options: JSON.stringify([{key:"A",text:"x=1/2"},{key:"B",text:"y=1/2"},{key:"C",text:"x=1"},{key:"D",text:"y=1"}]), answer:"A", analysis:"两圆方程相减得公共弦：2x=1 → x=1/2", type:"single_choice" }; })()],
  169: (i) => [(() => { return { content: "过两圆交点的圆系方程为？", options: JSON.stringify([{key:"A",text:"C₁+λC₂=0"},{key:"B",text:"C₁×C₂=0"},{key:"C",text:"C₁=C₂"},{key:"D",text:"C₁-C₂=1"}]), answer:"A", analysis:"圆系：C₁+λC₂=0", type:"single_choice" }; })()],
  170: (i) => [(() => { const r=ri(2,4); return { content: `圆 x²+y²=${r*r} 上点到直线 x+y=0 距离最大值为？`, options: JSON.stringify([{key:"A",text:`${r}`},{key:"B",text:`${2*r}`},{key:"C",text:`${r*Math.SQRT2}`},{key:"D",text:"0"}]), answer:"A", analysis:`圆心(0,0)到 x+y=0 距离 0，最大距离=圆心距+半径=${r}`, type:"single_choice" }; })()],
  171: (i) => [(() => { return { content: "到点 A(1,0) 距离等于 2 的点的轨迹是？", options: JSON.stringify([{key:"A",text:"圆 (x-1)²+y²=4"},{key:"B",text:"直线 x=1"},{key:"C",text:"抛物线"},{key:"D",text:"双曲线"}]), answer:"A", analysis:"到定点距离为定长 → 圆", type:"single_choice" }; })()],
  172: (i) => [(() => { return { content: "到两定点距离和为定值（大于焦距）的轨迹是？", options: JSON.stringify([{key:"A",text:"椭圆"},{key:"B",text:"双曲线"},{key:"C",text:"抛物线"},{key:"D",text:"圆"}]), answer:"A", analysis:"椭圆定义：到两焦点距离和为常数", type:"single_choice" }; })()],
  173: (i) => [(() => { const a=ri(3,5),b=ri(2,4); return { content: `椭圆 x²/${a*a}+y²/${b*b}=1 的 a = ？`, options: JSON.stringify([{key:"A",text:`${a}`},{key:"B",text:`${b}`},{key:"C",text:`${a*a}`},{key:"D",text:`${b*b}`}]), answer:"A", analysis:`标准方程 x²/a²+y²/b²=1 → a=${a}`, type:"single_choice" }; })()],
  174: (i) => [(() => { const a=ri(3,5),b=ri(2,4); const c=Math.sqrt(a*a-b*b); const e=(c/a).toFixed(2); return { content: `椭圆 x²/${a*a}+y²/${b*b}=1 的离心率 e = ？`, options: JSON.stringify([{key:"A",text:`${e}`},{key:"B",text:`${c}`},{key:"C",text:`${a}`},{key:"D",text:"1"}]), answer:"A", analysis:`c=√(a²-b²)=${c}，e=c/a=${e}`, type:"single_choice" }; })()],
  175: (i) => [(() => { const a=ri(2,4),b=ri(2,4); return { content: `双曲线 x²/${a*a}-y²/${b*b}=1 的渐近线 = ？`, options: JSON.stringify([{key:"A",text:`y=±(${b}/${a})x`},{key:"B",text:`y=±(${a}/${b})x`},{key:"C",text:`y=±${b}x`},{key:"D",text:`y=±${a}x`}]), answer:"A", analysis:`渐近线 y=±(b/a)x=±(${b}/${a})x`, type:"single_choice" }; })()],
  176: (i) => [(() => { const a=ri(2,4); return { content: `等轴双曲线 x²-y²=${a*a} 的渐近线为？`, options: JSON.stringify([{key:"A",text:"y=±x"},{key:"B",text:"y=±2x"},{key:"C",text:"y=±3x"},{key:"D",text:"y=0"}]), answer:"A", analysis:"等轴双曲线 a=b，渐近线 y=±x", type:"single_choice" }; })()],
  177: (i) => [(() => { const p=ri(1,3); return { content: `抛物线 y²=${2*p}x 的通径长 = ？`, options: JSON.stringify([{key:"A",text:`${2*p}`},{key:"B",text:`${p}`},{key:"C",text:`${4*p}`},{key:"D",text:`${p/2}`}]), answer:"A", analysis:`通径=2p=${2*p}`, type:"single_choice" }; })()],
  178: (i) => [(() => { const b=ri(2,4); return { content: `双曲线 x²-y²/${b*b}=1，焦点(±√2,0)到渐近线 y=±${b}x 距离 = ？`, options: JSON.stringify([{key:"A",text:`${Math.abs(b*Math.sqrt(2))/Math.hypot(b,1)}`},{key:"B",text:`${b}`},{key:"C",text:`${Math.sqrt(2)}`},{key:"D",text:"1"}]), answer:"A", analysis:`d=|b×√2|/√(b²+1)=${(Math.abs(b*Math.SQRT2)/Math.hypot(b,1)).toFixed(2)}`, type:"single_choice" }; })()],
  179: (i) => [(() => { const a=ri(3,5),c=ri(1,3); const r=a+c; return { content: `椭圆左焦点到右顶点的焦半径最大值 a+c，a=${a},c=${c} → ？`, options: JSON.stringify([{key:"A",text:`${r}`},{key:"B",text:`${a}`},{key:"C",text:`${c}`},{key:"D",text:`${a-c}`}]), answer:"A", analysis:`焦半径范围 [a-c,a+c]=[${a-c},${a+c}]`, type:"single_choice" }; })()],
  180: (i) => [(() => { const b=ri(2,4); return { content: `椭圆 x²/${b*b}+y²/${b*b}=1 焦点三角形面积最大 = b²·tan(θ/2)，b=${b}，θ=90° → S=？`, options: JSON.stringify([{key:"A",text:`${b*b}`},{key:"B",text:`${2*b*b}`},{key:"C",text:`${b*b/2}`},{key:"D",text:`${b}`}]), answer:"A", analysis:`S=b²tan45°=${b*b}`, type:"single_choice" }; })()],
  181: (i) => [(() => { const a=ri(2,4); return { content: `直线 y=x 与椭圆 x²/${a*a}+y²/${a*a}=1 的交点个数 = ？`, options: JSON.stringify([{key:"A",text:"2"},{key:"B",text:"0"},{key:"C",text:"1"},{key:"D",text:"3"}]), answer:"A", analysis:`代入得 2x²=${a*a}，x=±${a}/√2 → 2 个交点`, type:"single_choice" }; })()],
  182: (i) => [(() => { const p=ri(1,3); return { content: `抛物线 y²=${4*p}x 焦点弦长（通径） = ？`, options: JSON.stringify([{key:"A",text:`${4*p}`},{key:"B",text:`${2*p}`},{key:"C",text:`${p}`},{key:"D",text:`${8*p}`}]), answer:"A", analysis:`焦点弦长（通径）=2p=${4*p}`, type:"single_choice" }; })()],
  183: (i) => [(() => { return { content: "抛物线焦点弦两端点纵坐标乘积为？", options: JSON.stringify([{key:"A",text:"-p²"},{key:"B",text:"p²"},{key:"C",text:"0"},{key:"D",text:"2p"}]), answer:"A", analysis:"焦点弦性质：y₁y₂=-p²", type:"single_choice" }; })()],
  184: (i) => [(() => { return { content: "直线与圆锥曲线相交，弦长公式 = ？", options: JSON.stringify([{key:"A",text:"√(1+k²)|x₁-x₂|"},{key:"B",text:"|x₁-x₂|"},{key:"C",text:"|y₁-y₂|"},{key:"D",text:"(1+k²)|x₁-x₂|"}]), answer:"A", analysis:"弦长=√(1+k²)|x₁-x₂|", type:"single_choice" }; })()],
  185: (i) => [(() => { const a=ri(2,4); return { content: `椭圆 x²/${a*a}+y²=1 在点 (${a},0) 处切线 = ？`, options: JSON.stringify([{key:"A",text:`x=${a}`},{key:"B",text:`y=1`},{key:"C",text:`x+y=${a}`},{key:"D",text:`y=x`}]), answer:"A", analysis:`顶点处切线垂直于 x 轴：x=${a}`, type:"single_choice" }; })()],
  186: (i) => [(() => { const a=ri(2,4); return { content: `椭圆 x²/${a*a}+y²/${a*a}=1 上点 P 与两焦点连线所成三角形周长为？`, options: JSON.stringify([{key:"A",text:`${2*a+2*Math.sqrt(a*a-a*a)}`},{key:"B",text:`${2*a}`},{key:"C",text:`${4*a}`},{key:"D",text:`${a}`}]), answer:"A", analysis:`周长=2a+2c，c=0 → 2a=${2*a}`, type:"single_choice" }; })()],
  187: (i) => [(() => { const n=ri(2,5); return { content: `Sₙ=${n}n²+n，则 a₁ = S₁ = ？`, options: JSON.stringify([{key:"A",text:`${n+1}`},{key:"B",text:`${n}`},{key:"C",text:`${2*n}`},{key:"D",text:"1"}]), answer:"A", analysis:`a₁=S₁=${n}×1+1=${n+1}`, type:"single_choice" }; })()],
  188: (i) => [(() => { const a1=ri(1,5),d=ri(2,5),n=ri(5,8); const an=a1+(n-1)*d; return { content: `等差数列 a₁=${a1}，d=${d}，a${n} = ？`, options: JSON.stringify([{key:"A",text:`${an}`},{key:"B",text:`${an+d}`},{key:"C",text:`${a1}`},{key:"D",text:`${a1+n*d}`}]), answer:"A", analysis:`aₙ=a₁+(n-1)d=${a1}+(${n}-1)×${d}=${an}`, type:"single_choice" }; })()],
  189: (i) => [(() => { const a1=ri(1,3),q=ri(2,3),n=ri(3,5); const an=a1*Math.pow(q,n-1); return { content: `等比数列 a₁=${a1}，q=${q}，a${n} = ？`, options: JSON.stringify([{key:"A",text:`${an}`},{key:"B",text:`${an*q}`},{key:"C",text:`${a1+(n-1)*q}`},{key:"D",text:`${a1}`}]), answer:"A", analysis:`aₙ=a₁qⁿ⁻¹=${a1}×${q}^${n-1}=${an}`, type:"single_choice" }; })()],
  190: (i) => [(() => { const a1=ri(1,4),d=ri(2,4),n=ri(5,8); const Sn=n*a1+n*(n-1)*d/2; return { content: `等差数列 a₁=${a1}，d=${d}，S${n} = ？`, options: JSON.stringify([{key:"A",text:`${Sn}`},{key:"B",text:`${Sn+n}`},{key:"C",text:`${a1*n}`},{key:"D",text:`${Sn-d}`}]), answer:"A", analysis:`Sₙ=na₁+n(n-1)d/2=${n}×${a1}+${n}×${n-1}×${d}/2=${Sn}`, type:"single_choice" }; })()],
  191: (i) => [(() => { const a1=ri(1,3),q=ri(2,3),n=ri(3,5); const Sn=a1*(1-Math.pow(q,n))/(1-q); return { content: `等比数列 a₁=${a1}，q=${q}，S${n} = ？`, options: JSON.stringify([{key:"A",text:`${Sn}`},{key:"B",text:`${a1*n}`},{key:"C",text:`${Sn*q}`},{key:"D",text:`${a1*q}`}]), answer:"A", analysis:`Sₙ=a₁(1-qⁿ)/(1-q)=${a1}×(1-${q}^${n})/(1-${q})=${Sn}`, type:"single_choice" }; })()],
  192: (i) => [(() => { const a=ri(2,5),b=ri(2,5); const m=(a+b)/2; return { content: `${a} 与 ${b} 的等差中项 = ？`, options: JSON.stringify([{key:"A",text:`${m}`},{key:"B",text:`${a+b}`},{key:"C",text:`${a*b}`},{key:"D",text:`${Math.sqrt(a*b)}`}]), answer:"A", analysis:`等差中项=(${a}+${b})/2=${m}`, type:"single_choice" }; })()],
  193: (i) => [(() => { const a=ri(2,5),d=ri(2,4); const a2=a+d,a5=a+4*d; return { content: `等差数列 a₁=${a}，d=${d}，a₂+a₅ = ？`, options: JSON.stringify([{key:"A",text:`${a2+a5}`},{key:"B",text:`${2*a}`},{key:"C",text:`${a5}`},{key:"D",text:`${a2}`}]), answer:"A", analysis:`a₂=${a2}，a₅=${a5}，和=${a2+a5}`, type:"single_choice" }; })()],
  194: (i) => [(() => { const a=ri(2,5),q=ri(2,3); const a3=a*q*q; return { content: `等比数列 a₁=${a}，q=${q}，a₃ = ？`, options: JSON.stringify([{key:"A",text:`${a3}`},{key:"B",text:`${a*q}`},{key:"C",text:`${a+2*q}`},{key:"D",text:`${a}`}]), answer:"A", analysis:`a₃=a₁q²=${a}×${q}²=${a3}`, type:"single_choice" }; })()],
  195: (i) => [(() => { const n=ri(2,4); return { content: `数列 {n·2ⁿ} 前 n 项和常用？求和法`, options: JSON.stringify([{key:"A",text:"错位相减法"},{key:"B",text:"裂项相消法"},{key:"C",text:"累加法"},{key:"D",text:"累乘法"}]), answer:"A", analysis:"等差×等比 → 错位相减", type:"single_choice" }; })()],
  196: (i) => [(() => { const n=ri(3,6); return { content: `1/(1×2)+1/(2×3)+...+1/(n×(n+1)) = n/(n+1)，n=${n} → ？`, options: JSON.stringify([{key:"A",text:`${n}/${n+1}`},{key:"B",text:`${(n+1)/n}`},{key:"C",text:`${n}`},{key:"D",text:`1/${n}`}]), answer:"A", analysis:`裂项相消：1/k-1/(k+1)，和=${n}/${n+1}`, type:"single_choice" }; })()],
  197: (i) => [(() => { const n=ri(3,5); return { content: `aₙ-aₙ₋₁=n，a₁=1，则 a${n} = 1+2+...+${n} = ？`, options: JSON.stringify([{key:"A",text:`${n*(n+1)/2}`},{key:"B",text:`${n}`},{key:"C",text:`${n*n}`},{key:"D",text:`${n+1}`}]), answer:"A", analysis:`累加法：aₙ=1+2+...+n=${n*(n+1)/2}`, type:"single_choice" }; })()],
  198: (i) => [(() => { const n=ri(3,5); return { content: `aₙ/aₙ₋₁=n/(n-1)，a₁=1，则 a${n} = ？`, options: JSON.stringify([{key:"A",text:`${n}`},{key:"B",text:`${n-1}`},{key:"C",text:`${n*n}`},{key:"D",text:"1"}]), answer:"A", analysis:`累乘法：aₙ=a₁×2/1×3/2×...×n/(n-1)=${n}`, type:"single_choice" }; })()],

  199: (i) => [(() => { const x0=ri(1,3),h=ri(1,2); return { content: `f'(x₀) = lim_{h→0} [f(x₀+h)-f(x₀)]/h 表示？`, options: JSON.stringify([{key:"A",text:"x₀ 处瞬时变化率"},{key:"B",text:"平均变化率"},{key:"C",text:"函数值"},{key:"D",text:"面积"}]), answer:"A", analysis:"导数定义：瞬时变化率", type:"single_choice" }; })()],
  200: (i) => [(() => { const x0=ri(1,4); return { content: `f(x)=x² 在 x=${x0} 处的切线斜率 = f'(${x0}) = ？`, options: JSON.stringify([{key:"A",text:`${2*x0}`},{key:"B",text:`${x0}`},{key:"C",text:`${x0*x0}`},{key:"D",text:"2"}]), answer:"A", analysis:`f'(x)=2x，f'(${x0})=${2*x0}`, type:"single_choice" }; })()],
  201: (i) => [(() => { const n=ri(2,5); return { content: `(x^${n})' = ？`, options: JSON.stringify([{key:"A",text:`${n}x^${n-1}`},{key:"B",text:`x^${n-1}`},{key:"C",text:`${n}x^${n}`},{key:"D",text:`${n-1}x^${n-1}`}]), answer:"A", analysis:`幂函数求导：${n}x^${n-1}`, type:"single_choice" }; })()],
  202: (i) => [(() => { const a=ri(2,4); return { content: `(x²+${a}x)' = ？`, options: JSON.stringify([{key:"A",text:`2x+${a}`},{key:"B",text:`x+${a}`},{key:"C",text:`2x`},{key:"D",text:`${a}`}]), answer:"A", analysis:`逐项求导：2x+${a}`, type:"single_choice" }; })()],
  203: (i) => [(() => { const a=ri(2,4); return { content: `(sin(${a}x))' = ？`, options: JSON.stringify([{key:"A",text:`${a}cos(${a}x)`},{key:"B",text:`cos(${a}x)`},{key:"C",text:`-${a}sin(${a}x)`},{key:"D",text:`${a}sin(${a}x)`}]), answer:"A", analysis:`复合求导：外层 cos × 内层 ${a} = ${a}cos(${a}x)`, type:"single_choice" }; })()],
  204: (i) => [(() => { const x0=ri(1,3); return { content: `f(x)=x²，在点 (${x0},${x0*x0}) 处切线方程？`, options: JSON.stringify([{key:"A",text:`y=${2*x0}x-${x0*x0}`},{key:"B",text:`y=${x0}x`},{key:"C",text:`y=${2*x0}x`},{key:"D",text:`y=x²`}]), answer:"A", analysis:`k=f'(${x0})=${2*x0}，切线 y-${x0*x0}=${2*x0}(x-${x0}) → y=${2*x0}x-${x0*x0}`, type:"single_choice" }; })()],
  205: (i) => [(() => { return { content: "过曲线外一点求切线，步骤是先？", options: JSON.stringify([{key:"A",text:"设切点坐标，代入求切点"},{key:"B",text:"直接求斜率"},{key:"C",text:"求导数即可"},{key:"D",text:"画图猜"}]), answer:"A", analysis:"曲线外点切线：设切点 (x₀,f(x₀)) 求解", type:"single_choice" }; })()],
  206: (i) => [(() => { const a=ri(2,5); return { content: `f(x)=x²-${a}x，f'(x)=0 时 x = ？`, options: JSON.stringify([{key:"A",text:`${a/2}`},{key:"B",text:`${a}`},{key:"C",text:`${2*a}`},{key:"D",text:"0"}]), answer:"A", analysis:`f'(x)=2x-${a}=0 → x=${a}/2`, type:"single_choice" }; })()],
  207: (i) => [(() => { const a=ri(3,6); return { content: `f(x)=x³-${a}x 的极值点 x = ±√(${a}/3) ≈ ？`, options: JSON.stringify([{key:"A",text:`±√${(a/3).toFixed(1)}`},{key:"B",text:`±${a}`},{key:"C",text:`±${a/3}`},{key:"D",text:"0"}]), answer:"A", analysis:`f'(x)=3x²-${a}=0 → x=±√(${a}/3)=±√${(a/3).toFixed(1)}`, type:"single_choice" }; })()],
  208: (i) => [(() => { return { content: "证明 x>1 时 x²>x-1，可构造函数？", options: JSON.stringify([{key:"A",text:"f(x)=x²-x+1"},{key:"B",text:"f(x)=x"},{key:"C",text:"f(x)=x²"},{key:"D",text:"f(x)=x+1"}]), answer:"A", analysis:"构造函数 f(x)=x²-x+1，求导证 f(x)>0", type:"single_choice" }; })()],
  209: (i) => [(() => { return { content: "常用不等式 ln x ≤ x-1（x>0），则 ln 2 与 1 的关系？", options: JSON.stringify([{key:"A",text:"ln2<1"},{key:"B",text:"ln2>1"},{key:"C",text:"ln2=1"},{key:"D",text:"无法比较"}]), answer:"A", analysis:"ln x ≤ x-1，x=2 时 ln2 ≤ 1，且取不到等号 → ln2<1", type:"single_choice" }; })()],
  210: (i) => [(() => { return { content: "e^x ≥ x+1（x∈R）恒成立，当 x=0 时？", options: JSON.stringify([{key:"A",text:"取等号"},{key:"B",text:"取不到"},{key:"C",text:"不成立"},{key:"D",text:"无意义"}]), answer:"A", analysis:"e⁰=1，0+1=1 → x=0 时取等", type:"single_choice" }; })()],
  211: (i) => [(() => { const a=ri(1,4); return { content: `f(x)=x²-${a}x 在 [1,2] 恒 ≤ 0 需 f(1)≤0 且 f(2)≤0 → a ≥ ？`, options: JSON.stringify([{key:"A",text:`${Math.max(1,a)}`},{key:"B",text:`${a}`},{key:"C",text:"1"},{key:"D",text:"2"}]), answer:"A", analysis:`需 f(1)=1-${a}≤0 且 f(2)=4-${2*a}≤0 → a≥${Math.max(1,a)}`, type:"single_choice" }; })()],
  212: (i) => [(() => { const a=ri(1,3); return { content: `存在 x 使 x²=${a} → 即 a 满足？`, options: JSON.stringify([{key:"A",text:"a≥0"},{key:"B",text:"a>0"},{key:"C",text:"a≤0"},{key:"D",text:"a<0"}]), answer:"A", analysis:"x²=a 有解 ⇔ a≥0", type:"single_choice" }; })()],
  213: (i) => [(() => { const a=ri(2,4),b=ri(2,4); return { content: `A 到 B 有 ${a} 条路，B 到 C 有 ${b} 条路，A 经 B 到 C 有？种`, options: JSON.stringify([{key:"A",text:`${a+b}`},{key:"B",text:`${a*b}`},{key:"C",text:`${Math.max(a,b)}`},{key:"D",text:`${a-b}`}]), answer:"A", analysis:`分步乘法：${a}×${b}=${a*b}`, type:"single_choice" }; })()],
  214: (i) => [(() => { const a=ri(2,4),b=ri(2,4); return { content: `A 到 B 有 ${a} 条路，A 到 C 有 ${b} 条路（互斥），A 到 B 或 C 有？种`, options: JSON.stringify([{key:"A",text:`${a+b}`},{key:"B",text:`${a*b}`},{key:"C",text:`${Math.max(a,b)}`},{key:"D",text:`${a-b}`}]), answer:"A", analysis:`分类加法：${a}+${b}=${a+b}`, type:"single_choice" }; })()],
  215: (i) => [(() => { const n=ri(4,6); const p=n*(n-1); return { content: `P(${n},2) = ${n}×(${n}-1) = ？`, options: JSON.stringify([{key:"A",text:`${p}`},{key:"B",text:`${n}`},{key:"C",text:`${p/2}`},{key:"D",text:`${n+2}`}]), answer:"A", analysis:`P(n,2)=n(n-1)=${p}`, type:"single_choice" }; })()],
  216: (i) => [(() => { const n=ri(4,6); const c=n*(n-1)/2; return { content: `C(${n},2) = ${n}(${n}-1)/2 = ？`, options: JSON.stringify([{key:"A",text:`${c}`},{key:"B",text:`${n}`},{key:"C",text:`${n*(n-1)}`},{key:"D",text:`${n/2}`}]), answer:"A", analysis:`C(n,2)=n(n-1)/2=${c}`, type:"single_choice" }; })()],
  217: (i) => [(() => { const n=ri(5,8); return { content: `C(n,0) = ？`, options: JSON.stringify([{key:"A",text:"1"},{key:"B",text:`${n}`},{key:"C",text:"0"},{key:"D",text:`${n/2}`}]), answer:"A", analysis:"组合数性质：C(n,0)=1", type:"single_choice" }; })()],
  218: (i) => [(() => { const n=ri(4,6); return { content: `${n} 人排成一排，甲必须排首位，排法 = ？`, options: JSON.stringify([{key:"A",text:`${n-1}!`},{key:"B",text:`${n}!`},{key:"C",text:`${n-1}`},{key:"D",text:`${n*(n-1)}`}]), answer:"A", analysis:`甲固定首位，其余 ${n-1} 人全排列 = ${n-1}!`, type:"single_choice" }; })()],
  219: (i) => [(() => { const n=ri(5,7),m=ri(2,3); const c=n*(n-1)/2; return { content: `从 ${n} 人中选 ${m} 人（甲不在内）→ 从 ${n-1} 人选：C(${n-1},2) = ？`, options: JSON.stringify([{key:"A",text:`${(n-1)*(n-2)/2}`},{key:"B",text:`${c}`},{key:"C",text:`${n-1}`},{key:"D",text:`${n}`}]), answer:"A", analysis:`C(${n-1},2)=(${n-1})(${n-2})/2=${(n-1)*(n-2)/2}`, type:"single_choice" }; })()],
  220: (i) => [(() => { const n=ri(3,5); return { content: `${n} 人站一排，甲乙捆绑：先绑后排，方法数 = 2×${n-1}! 的关键是？`, options: JSON.stringify([{key:"A",text:"捆绑法"},{key:"B",text:"插空法"},{key:"C",text:"隔板法"},{key:"D",text:"直接排"}]), answer:"A", analysis:"相邻问题用捆绑法", type:"single_choice" }; })()],
  221: (i) => [(() => { const n=ri(3,5); return { content: `(1+x)^${n} 展开式共有？项`, options: JSON.stringify([{key:"A",text:`${n+1}`},{key:"B",text:`${n}`},{key:"C",text:`${2*n}`},{key:"D",text:`${n-1}`}]), answer:"A", analysis:`二项式展开共 n+1 = ${n+1} 项`, type:"single_choice" }; })()],
  222: (i) => [(() => { const n=ri(3,5),k=ri(1,3); return { content: `(1+x)^${n} 的通项 T_{k+1} = C(${n},k)x^k，k=${k} 时系数 = ？`, options: JSON.stringify([{key:"A",text:`C(${n},${k})`},{key:"B",text:`${n}`},{key:"C",text:`${k}`},{key:"D",text:`${n+k}`}]), answer:"A", analysis:`T_{k+1}=C(n,k)x^k，系数 C(${n},${k})`, type:"single_choice" }; })()],
  223: (i) => [(() => { const n=ri(4,6); return { content: `(a+b)^${n} 展开式二项式系数之和 = ？`, options: JSON.stringify([{key:"A",text:`${Math.pow(2,n)}`},{key:"B",text:`${n}`},{key:"C",text:`${n*n}`},{key:"D",text:`${2*n}`}]), answer:"A", analysis:`二项式系数和 = 2ⁿ = ${Math.pow(2,n)}`, type:"single_choice" }; })()],
  224: (i) => [(() => { const n=ri(4,6); return { content: `(1+x)^${n} 各项系数之和 = f(1) = ？`, options: JSON.stringify([{key:"A",text:`${Math.pow(2,n)}`},{key:"B",text:"1"},{key:"C",text:`${n}`},{key:"D",text:"0"}]), answer:"A", analysis:`令 x=1：各项系数和 = (1+1)^${n} = ${Math.pow(2,n)}`, type:"single_choice" }; })()],
  225: (i) => [(() => { const p1=ri(2,4); const p2=10-p1; return { content: `X 分布列：P(X=0)=${p1}/10，P(X=1)=${p2}/10，概率和 = ？`, options: JSON.stringify([{key:"A",text:"1"},{key:"B",text:`${p1}/10`},{key:"C",text:`${p2}/10`},{key:"D",text:"0.5"}]), answer:"A", analysis:"分布列概率和为 1", type:"single_choice" }; })()],
  226: (i) => [(() => { const a=ri(2,5),b=ri(2,4); return { content: `P(B|A) = P(AB)/P(A)，P(AB)=${a}/10，P(A)=${a+b}/10 → P(B|A) = ？`, options: JSON.stringify([{key:"A",text:`${a}/${a+b}`},{key:"B",text:`${a}/10`},{key:"C",text:`${b}/10`},{key:"D",text:`${a+b}/10`}]), answer:"A", analysis:`P(B|A)=(${a}/10)/(${a+b}/10)=${a}/${a+b}`, type:"single_choice" }; })()],
  227: (i) => [(() => { const a=ri(2,4),b=ri(2,4); const p=(a*b)/100; return { content: `P(A)=${a}/10，P(B|A)=${b}/10，P(AB) = ？`, options: JSON.stringify([{key:"A",text:`${a*b}/100`},{key:"B",text:`${a}/10`},{key:"C",text:`${b}/10`},{key:"D",text:"1"}]), answer:"A", analysis:`乘法公式：P(AB)=P(A)P(B|A)=${a}/10×${b}/10=${a*b}/100`, type:"single_choice" }; })()],
  228: (i) => [(() => { return { content: "全概率公式：P(B) = ΣP(Aᵢ)P(B|Aᵢ)，用于？", options: JSON.stringify([{key:"A",text:"分情况求总概率"},{key:"B",text:"求单一概率"},{key:"C",text:"求方差"},{key:"D",text:"求期望"}]), answer:"A", analysis:"全概率公式：按互斥完备事件组分解", type:"single_choice" }; })()],
  229: (i) => [(() => { const p1=ri(2,4); const p2=10-p1; const e=p2/10; return { content: `X：P(X=0)=${p1}/10，P(X=1)=${p2}/10，E(X) = ？`, options: JSON.stringify([{key:"A",text:`${e}`},{key:"B",text:`${p1}/10`},{key:"C",text:"1"},{key:"D",text:"0"}]), answer:"A", analysis:`E(X)=0×${p1}/10+1×${p2}/10=${e}`, type:"single_choice" }; })()],
  230: (i) => [(() => { const p=0.5; const v=0.25; return { content: `X~B(1,0.5)，D(X) = np(1-p) = ？`, options: JSON.stringify([{key:"A",text:"0.25"},{key:"B",text:"0.5"},{key:"C",text:"1"},{key:"D",text:"0.125"}]), answer:"A", analysis:`D(X)=np(1-p)=1×0.5×0.5=0.25`, type:"single_choice" }; })()],
  231: (i) => [(() => { const a=ri(2,4); return { content: `E(aX+b) = aE(X)+b，a=${a},b=1，E(X)=2 → E(aX+b) = ？`, options: JSON.stringify([{key:"A",text:`${2*a+1}`},{key:"B",text:`${2*a}`},{key:"C",text:`${a+1}`},{key:"D",text:`${2}`}]), answer:"A", analysis:`E=${a}×2+1=${2*a+1}`, type:"single_choice" }; })()],
  232: (i) => [(() => { const n=ri(3,5); return { content: `X~B(${n},0.5)，则 X 表示？`, options: JSON.stringify([{key:"A",text:`${n} 次独立试验成功次数`},{key:"B",text:"一次试验结果"},{key:"C",text:"连续变量"},{key:"D",text:"正态分布"}]), answer:"A", analysis:`二项分布：n 重伯努利试验成功次数`, type:"single_choice" }; })()],
  233: (i) => [(() => { const n=ri(3,5); const e=n*0.5; const v=n*0.25; return { content: `X~B(${n},0.5)，E(X) = ${n}×0.5 = ？`, options: JSON.stringify([{key:"A",text:`${e}`},{key:"B",text:`${v}`},{key:"C",text:`${n}`},{key:"D",text:`${n/2+1}`}]), answer:"A", analysis:`E(X)=np=${n}×0.5=${e}`, type:"single_choice" }; })()],
  234: (i) => [(() => { const N=ri(8,12),M=ri(3,5),n=ri(3,4); return { content: `从 ${N} 件（含 ${M} 件次品）抽 ${n} 件，次品数 X 服从？`, options: JSON.stringify([{key:"A",text:"超几何分布"},{key:"B",text:"二项分布"},{key:"C",text:"正态分布"},{key:"D",text:"均匀分布"}]), answer:"A", analysis:`不放回抽样 → 超几何分布`, type:"single_choice" }; })()],
  235: (i) => [(() => { const N=10,M=ri(3,4),n=ri(2,3); const e=n*M/N; return { content: `超几何：N=${N},M=${M},n=${n}，E(X) = nM/N = ？`, options: JSON.stringify([{key:"A",text:`${e}`},{key:"B",text:`${M}`},{key:"C",text:`${n}`},{key:"D",text:`${M/N}`}]), answer:"A", analysis:`E(X)=nM/N=${n}×${M}/${N}=${e}`, type:"single_choice" }; })()],
  236: (i) => [(() => { return { content: "正态分布 X~N(μ,σ²)，其图像关于？对称", options: JSON.stringify([{key:"A",text:"直线 x=μ"},{key:"B",text:"x 轴"},{key:"C",text:"y 轴"},{key:"D",text:"直线 x=σ"}]), answer:"A", analysis:"正态曲线关于均值 μ 对称", type:"single_choice" }; })()],
  237: (i) => [(() => { return { content: "正态曲线在 x=μ 处取？", options: JSON.stringify([{key:"A",text:"最大值"},{key:"B",text:"最小值"},{key:"C",text:"0"},{key:"D",text:"1"}]), answer:"A", analysis:"正态曲线峰值在均值处", type:"single_choice" }; })()],
  238: (i) => [(() => { return { content: "3σ 原则：P(μ-3σ<X<μ+3σ) ≈ ？", options: JSON.stringify([{key:"A",text:"0.997"},{key:"B",text:"0.68"},{key:"C",text:"0.95"},{key:"D",text:"1"}]), answer:"A", analysis:"3σ 区间概率约 99.7%", type:"single_choice" }; })()],
  239: (i) => [(() => { return { content: "两组数据点呈上升趋势，说明？", options: JSON.stringify([{key:"A",text:"正相关"},{key:"B",text:"负相关"},{key:"C",text:"无相关"},{key:"D",text:"完全无关"}]), answer:"A", analysis:"上升趋势 → 正相关", type:"single_choice" }; })()],
  240: (i) => [(() => { return { content: "散点图点群自左上向右下 → 相关方向？", options: JSON.stringify([{key:"A",text:"负相关"},{key:"B",text:"正相关"},{key:"C",text:"无相关"},{key:"D",text:"非线性"}]), answer:"A", analysis:"右上到左下 → 负相关", type:"single_choice" }; })()],
  241: (i) => [(() => { const x=[1,2,3],y=[2,4,6]; return { content: `数据 (1,2),(2,4),(3,6)，相关系数 r = ？`, options: JSON.stringify([{key:"A",text:"1"},{key:"B",text:"0"},{key:"C",text:"-1"},{key:"D",text:"0.5"}]), answer:"A", analysis:"完全正线性 → r=1", type:"single_choice" }; })()],
  242: (i) => [(() => { return { content: "|r| 越接近 1，线性相关程度？", options: JSON.stringify([{key:"A",text:"越强"},{key:"B",text:"越弱"},{key:"C",text:"不变"},{key:"D",text:"无意义"}]), answer:"A", analysis:"|r| 接近 1 → 强相关", type:"single_choice" }; })()],
  243: (i) => [(() => { const b=ri(1,3),a=ri(1,4); return { content: `回归直线 ŷ = ${b}x+${a}，x=2 时预测值 = ？`, options: JSON.stringify([{key:"A",text:`${2*b+a}`},{key:"B",text:`${b+a}`},{key:"C",text:`${b}`},{key:"D",text:`${a}`}]), answer:"A", analysis:`ŷ=${b}×2+${a}=${2*b+a}`, type:"single_choice" }; })()],
  244: (i) => [(() => { return { content: "回归直线必过点？", options: JSON.stringify([{key:"A",text:"样本中心 (x̄,ȳ)"},{key:"B",text:"原点"},{key:"C",text:"(1,1)"},{key:"D",text:"最后一个点"}]), answer:"A", analysis:"回归直线过样本中心点", type:"single_choice" }; })()],
  245: (i) => [(() => { return { content: "回归斜率 b 表示 x 每增 1 单位，y 平均变化？", options: JSON.stringify([{key:"A",text:"b 个单位"},{key:"B",text:"1 个单位"},{key:"C",text:"a 个单位"},{key:"D",text:"不变"}]), answer:"A", analysis:"斜率 b：x 增 1，y 平均增 b", type:"single_choice" }; })()],
  246: (i) => [(() => { const y=ri(3,8),yh=ri(1,4); const e=y-yh; return { content: `观测值 y=${y}，预测值 ŷ=${yh}，残差 = ？`, options: JSON.stringify([{key:"A",text:`${e}`},{key:"B",text:`${y+yh}`},{key:"C",text:`${y*yh}`},{key:"D",text:`${yh-y}`}]), answer:"A", analysis:`残差 = y-ŷ = ${y}-${yh} = ${e}`, type:"single_choice" }; })()],
  247: (i) => [(() => { return { content: "残差平方和越小，模型拟合？", options: JSON.stringify([{key:"A",text:"越好"},{key:"B",text:"越差"},{key:"C",text:"不变"},{key:"D",text:"无关"}]), answer:"A", analysis:"残差平方和 RSS 越小拟合越好", type:"single_choice" }; })()],
  248: (i) => [(() => { return { content: "相关指数 R² 越接近 1，拟合效果？", options: JSON.stringify([{key:"A",text:"越好"},{key:"B",text:"越差"},{key:"C",text:"不变"},{key:"D",text:"无意义"}]), answer:"A", analysis:"R² 接近 1 → 拟合优度高", type:"single_choice" }; })()],
  249: (i) => [(() => { return { content: "r>0 且接近 1 说明？", options: JSON.stringify([{key:"A",text:"强正线性相关"},{key:"B",text:"强负线性相关"},{key:"C",text:"无相关"},{key:"D",text:"非线性相关"}]), answer:"A", analysis:"r>0 正相关，接近 1 强相关", type:"single_choice" }; })()],
  250: (i) => [(() => { const a=ri(20,40),b=ri(10,30); return { content: `2×2 列联表：甲组 ${a} 人（含 ${b} 达标），乙组 50 人（含 20 达标）。行合计甲 = ？`, options: JSON.stringify([{key:"A",text:`${a}`},{key:"B",text:`${b}`},{key:"C",text:`${a+b}`},{key:"D",text:`${a-b}`}]), answer:"A", analysis:"行合计 = 该组总人数", type:"single_choice" }; })()],
  251: (i) => [(() => { return { content: "独立性检验统计量 χ² = n(ad-bc)²/[(a+b)(c+d)(a+c)(b+d)]，χ² 越大说明？", options: JSON.stringify([{key:"A",text:"两变量越相关"},{key:"B",text:"越无关"},{key:"C",text:"样本越少"},{key:"D",text:"无法判断"}]), answer:"A", analysis:"χ² 大 → 拒绝独立假设，相关性强", type:"single_choice" }; })()],
  252: (i) => [(() => { return { content: "χ² 大于临界值 3.841（α=0.05）时，结论是？", options: JSON.stringify([{key:"A",text:"有 95% 把握认为有关"},{key:"B",text:"无关"},{key:"C",text:"样本无效"},{key:"D",text:"无法判断"}]), answer:"A", analysis:"χ²>3.841 → 拒绝 H₀，有 95% 把握认为有关", type:"single_choice" }; })()],
};

// ---------- 通用兜底模板：给未定义的知识点一个概念判断题 ----------
function fallbackQuestion(no, name, chNo, chName, term, i) {
  const qs = [
    { content: `下列对「${name}」的理解正确的是？`,
      options: JSON.stringify([{ key: "A", text: `它属于${chName}的核心内容` }, { key: "B", text: "它不属于高中数学" }, { key: "C", text: "它与本单元无关" }, { key: "D", text: "它是初中内容" }]),
      answer: "A", analysis: `${name}是${chName}（第${chNo}章）的正式知识点`, type: "single_choice" },
  ];
  return qs;
}

// ---------- 主流程 ----------
function main() {
  const args = process.argv.slice(2);
  const chapters = args.length ? args.map(Number) : Object.keys(CHAPTER_KPS).map(Number);
  let total = 0;
  for (const ch of chapters) {
    const meta = CHAPTER_KPS[ch];
    if (!meta) { console.log(`跳过未知章节 ${ch}`); continue; }
    const lines = [
      `-- ============================================================`,
      `-- 第${ch}章 ${meta.name} 补题（${meta.term}学期, 知识点 ${meta.start}-${meta.end}）`,
      `-- 参数化原创题 source='template-hs'`,
      `-- ============================================================`,
    ];
    let perCh = 0;
    for (let no = meta.start; no <= meta.end; no++) {
      const name = KP_NAMES[no];
      const gen = TPL[no];
      let qs;
      try { qs = gen ? gen(no) : fallbackQuestion(no, name, ch, meta.name, meta.term, no); }
      catch (e) { console.log('模板错误 知识点', no, name, ':', e.message); qs = fallbackQuestion(no, name, ch, meta.name, meta.term, no); }
      // 每个知识点生成 3 个变体（模板参数化 → 随机参数不同内容），按内容去重
      const variants = [];
      for (let v = 0; v < 5; v++) {
        let qs2;
        try { qs2 = gen ? gen(no) : fallbackQuestion(no, name, ch, meta.name, meta.term, no); }
        catch (e) { qs2 = fallbackQuestion(no, name, ch, meta.name, meta.term, no); }
        for (const q of qs2) {
          if (!q || !q.analysis || !q.answer || !q.content) continue;
          if (!variants.some((x) => x.content === q.content)) variants.push(q);
        }
        if (variants.length >= 3) break;
      }
      // 变体不足 3 个时，用选项重排补充（题干相同、选项顺序不同 → 新题）
      const shuffleOptions = (q) => {
        let opts = [];
        try { opts = JSON.parse(q.options || "[]"); } catch { return null; }
        if (opts.length < 2) return null;
        const shuffled = [...opts].sort(() => Math.random() - 0.5);
        const ansText = (opts.find((o) => o.key === q.answer) || {}).text;
        if (!ansText) return null;
        const ansKey = (shuffled.find((o) => o.text === ansText) || {}).key;
        if (!ansKey) return null;
        return { ...q, options: JSON.stringify(shuffled), answer: ansKey };
      };
      for (let v = variants.length; v < 3; v++) {
        const base = variants[v % Math.max(variants.length, 1)];
        const sv = base ? shuffleOptions(base) : null;
        if (!sv) break;
        if (!variants.some((x) => x.options === sv.options)) variants.push(sv);
      }
      variants.slice(0, 3).forEach((q, qi) => {
        const qid = `hq-${String(no).padStart(4, "0")}-${qi + 1}`;
        const opts = q.options ?? "";
        // 难度：按题面复杂度评分定档（与 scripts/relevel-questions.py 口径一致），避免伪随机错标
        const optText = optionsText(q.options);
        const lv = levelOf(complexityScore(q.content, optText));
        const diff = difficultyOf(lv).toFixed(2);
        lines.push(`INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version, level) VALUES`);
        lines.push(`('${qid}','math','高中',${meta.term},'hs-kp-${String(no).padStart(4, "0")}','${q.type}',${diff},'${q.content.replace(/'/g, "''")}','${opts.replace(/'/g, "''")}','${q.answer}','${q.analysis.replace(/'/g, "''")}','template-hs','approved','通用','${lv}');`);
        perCh++;
        total++;
      });
    }
    writeFileSync(OUT(ch), lines.join("\n"), "utf-8");
    console.log(`第${ch}章 ${meta.name}: 生成 ${perCh} 题 → infra/d1/hs-questions-${ch}.sql`);
  }
  console.log(`\n合计生成: ${total} 题`);
}
main();
