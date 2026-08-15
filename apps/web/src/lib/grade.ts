// 年级规范表述工具：7~12 → 初一~初三、高一~高三（避免"初7/初中7年级"等汉字数字混用）

const GRADE_LABELS: Record<number, string> = {
  7: "初一",
  8: "初二",
  9: "初三",
  10: "高一",
  11: "高二",
  12: "高三",
};

/** 数字年级 → 规范中文表述（如 7 → "初一"、10 → "高一"）；不支持的返回 "年级" 兜底 */
export function gradeLabel(grade: number | string | null | undefined): string {
  if (grade === null || grade === undefined) return "未设置年级";
  const n = Number(grade);
  return GRADE_LABELS[n] ?? `${grade}年级`;
}

/** 学段判断：7-9 初中，10-12 高中 */
export function isJunior(grade: number | string): boolean {
  return Number(grade) <= 9;
}
