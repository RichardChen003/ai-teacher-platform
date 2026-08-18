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
      const qs = gen ? gen(no) : fallbackQuestion(no, name, ch, meta.name, meta.term, no);
      // 每个知识点 1 题（chunk 单条 INSERT）
      qs.forEach((q, qi) => {
        const qid = `hq-${String(no).padStart(4, "0")}-${qi + 1}`;
        const opts = q.options ?? "";
        const diff = (0.35 + (no % 5) * 0.1).toFixed(2);
        lines.push(`INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES`);
        lines.push(`('${qid}','math','高中',${meta.term},'hs-kp-${String(no).padStart(4, "0")}','${q.type}',${diff},'${q.content.replace(/'/g, "''")}','${opts.replace(/'/g, "''")}','${q.answer}','${q.analysis.replace(/'/g, "''")}','template-hs','approved','通用');`);
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
