// ============================================================
// 难度评分（JS 版，与 scripts/relevel-questions.py 的 complexity_score 一致）
// 供生成脚本使用：新题入库前直接算出 level + difficulty，避免伪随机错标
// 用法: import { scoreLevel, difficultyOf } from "./difficulty-score.mjs";
// ============================================================

const SYMBOL_WEIGHTS = [
  ["√", 2], ["log", 1], ["ln", 1], ["sin", 1], ["cos", 1], ["tan", 1],
  ["∑", 2], ["∫", 3], ["lim", 2], ["²", 1], ["³", 2], ["⁻", 1], ["π", 1],
];
const KEYWORD_WEIGHTS = [
  ["恒成立", 3], ["证明", 3], ["构造", 2], ["综合", 2], ["最值", 2], ["存在", 2],
  ["取值范围", 2], ["应用", 1], ["实际", 1], ["讨论", 1], ["分类", 1], ["单调性", 1],
];

export function complexityScore(content = "", optionsText = "") {
  let s = 0;
  const L = content.length;
  if (L >= 25) s += 1;
  if (L >= 60) s += 1;
  for (const [sym, w] of SYMBOL_WEIGHTS) {
    if (content.includes(sym)) s += (content.split(sym).length - 1) * w;
  }
  if (content.includes("/") || content.includes("分之")) s += 1;
  for (const [kw, w] of KEYWORD_WEIGHTS) {
    if (content.includes(kw)) s += w;
  }
  const opt = optionsText || "";
  if (opt.length > 100) s += 1;
  if (["√", "∑", "∫", "分之"].some((x) => opt.includes(x))) s += 1;
  return s;
}

export function levelOf(s) {
  if (s <= 1) return "基础";
  if (s <= 4) return "中档";
  return "压轴";
}

/** 返回与档位匹配的 difficulty（确定性：同一档位固定中间值，避免伪随机） */
export function difficultyOf(level) {
  const map = { 基础: 0.38, 中档: 0.58, 压轴: 0.78 };
  return map[level] ?? 0.5;
}

/** 选项文本拼接辅助 */
export function optionsText(options) {
  try {
    const arr = typeof options === "string" ? JSON.parse(options) : options;
    return (arr || []).map((o) => (typeof o === "string" ? o : o.text || "")).join(" ");
  } catch {
    return "";
  }
}
