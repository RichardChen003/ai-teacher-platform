// 年级规范表述工具（学期粒度）：7~18 → 初一上~高三下
// 编码约定：7=初一上 8=初一下 9=初二上 10=初二下 11=初三上 12=初三下
//           13=高一上 14=高一下 15=高二上 16=高二下 17=高三上 18=高三下
// 学段判断：7~12 初中，13~18 高中

const GRADE_LABELS: Record<number, string> = {
  7: "初一上",
  8: "初一下",
  9: "初二上",
  10: "初二下",
  11: "初三上",
  12: "初三下",
  13: "高一上",
  14: "高一下",
  15: "高二上",
  16: "高二下",
  17: "高三上",
  18: "高三下",
};

/** 全部学期年级编码（7~18） */
export const ALL_GRADES: number[] = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

/** 初中年级编码（初一上~初三下） */
export const JUNIOR_GRADES: number[] = [7, 8, 9, 10, 11, 12];

/** 高中年级编码（高一上~高三下） */
export const SENIOR_GRADES: number[] = [13, 14, 15, 16, 17, 18];

/** 数字年级 → 规范中文表述（如 7 → "初一上"、17 → "高三上"）；不支持的返回兜底 */
export function gradeLabel(grade: number | string | null | undefined): string {
  if (grade === null || grade === undefined) return "未设置年级";
  const n = Number(grade);
  return GRADE_LABELS[n] ?? `${grade}年级`;
}

/** 学段判断：7~12 初中，13~18 高中 */
export function isJunior(grade: number | string): boolean {
  const n = Number(grade);
  return n >= 7 && n <= 12;
}

/** 高中判断 */
export function isSenior(grade: number | string): boolean {
  const n = Number(grade);
  return n >= 13 && n <= 18;
}
