// ============================================================
// 精品课 PPT 渲染器（对标「基础教育精品课」赛课样式）
// 深绿 #3B5643 主题 · 16:9 · 含数字人口播讲稿（notes）
//
// 与 teaching.ts 的规则版 renderPptx 解耦：本文件只依赖 pptxgenjs，
// 可被 API 调用，也可被 scripts/render-quality-deck.ts 独立跑出 .pptx。
// ============================================================
import PptxGenJS from "pptxgenjs";

// ---------- 设计系统 ----------
export const THEME = {
  primary: "3B5643", // 深绿：标题 / 板块条
  accent: "136839", // 绿：口诀卡 / 勾选
  warn: "993C1D", // 红：注意格式 / 易错
  bg: "FFFFFF",
  bgSoft: "F2F2F2",
  text: "2C2C2A",
  textSub: "5F5E5A",
  badge: "6A8A73", // 水印浅绿
  font: "Microsoft YaHei",
} as const;

// ---------- 课件 JSON Schema（rich deck） ----------
export type Block =
  | { type: "text"; content: string; size?: number; color?: string; bold?: boolean; align?: "left" | "center" }
  | { type: "list"; items: string[] }
  | { type: "formula"; content: string; note?: string }
  | { type: "mnemonic"; content: string; title?: string }
  | { type: "def"; title: string; content: string }
  | { type: "example"; question: string; solution?: string; tip?: string }
  | { type: "practice"; question: string; hint?: string }
  | { type: "steps"; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "columns"; left: Block[]; right: Block[] }
  | { type: "balance"; left: string; right: string; caption?: string }
  | { type: "numberline"; from: number; to: number; marks: Array<{ n: number; label?: string; color?: string }> }
  | { type: "summary"; points: string[] };

export type Slide =
  | { layout: "cover"; title: string; subtitle?: string; meta?: string[]; notes?: string }
  | { layout: "divider"; section: string; title?: string; subtitle?: string; notes?: string }
  | { layout: "content"; section: string; title: string; blocks: Block[]; notes?: string };

export type Deck = {
  design: "jingpin";
  title: string;
  subject?: string;
  grade?: string;
  author?: string;
  school?: string;
  slides: Slide[];
};

/** 归一化入口：确保 deck 标记为精品课设计（内容包可直接 export Deck） */
export function buildQualityDeck(deck: Omit<Deck, "design">): Deck {
  return { ...deck, design: "jingpin" };
}

/**
 * 生成「答案单独一页」版本（用于 PPTX 下载，翻页揭晓答案）：
 * 把含 solution 的例题拆成两页——题目页去掉答案，紧跟一页「答案解析」。
 * 网页预览用原始 deck（点击揭晓），下载用此版本（翻页揭晓）。
 */
export function buildRevealDeck(deck: Deck): Deck {
  const slides: Slide[] = [];
  for (const slide of deck.slides) {
    if (slide.layout !== "content") {
      slides.push(slide);
      continue;
    }
    const hasSolution = slide.blocks.some((b) => b.type === "example" && b.solution);
    if (!hasSolution) {
      slides.push(slide);
      continue;
    }
    // 题目页：去掉答案（保留题目 + 提示）
    const questionBlocks: Block[] = slide.blocks.map((b) =>
      b.type === "example" && b.solution ? { ...b, solution: undefined } : b
    );
    slides.push({ ...slide, blocks: questionBlocks });
    // 答案页：单独一页，保留题目作回顾（去掉提示，避免重复）
    const answerBlocks: Block[] = slide.blocks
      .filter((b): b is Extract<Block, { type: "example" }> => b.type === "example" && !!b.solution)
      .map((b) => ({ ...b, tip: undefined }));
    slides.push({
      layout: "content",
      section: "答案",
      title: `${slide.title} · 答案解析`,
      blocks: answerBlocks,
      notes: "我们来看看这道题的答案。",
    });
  }
  return { ...deck, slides };
}

// ============================================================
// 渲染
// ============================================================
export async function renderQualityPptx(deck: Deck): Promise<ArrayBuffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
  pptx.author = deck.author ?? "AI 老师平台";
  pptx.title = deck.title;

  for (const slide of deck.slides) {
    const s = pptx.addSlide();
    s.background = { color: THEME.bg };
    if (slide.layout === "cover") renderCover(s, deck, slide);
    else if (slide.layout === "divider") renderDivider(s, slide);
    else renderContent(s, deck, slide);
    if (slide.notes) s.addNotes(slide.notes);
  }

  return (await pptx.write({ outputType: "arraybuffer" })) as ArrayBuffer;
}

// ---------- 通用装饰 ----------
function badge(s: PptxGenJS.Slide) {
  s.addText("基础教育精品课", {
    x: 10.4, y: 0.18, w: 2.7, h: 0.35, fontSize: 9, color: THEME.badge, fontFace: THEME.font, align: "right",
  });
}

function sectionTag(s: PptxGenJS.Slide, label: string) {
  s.addShape("roundRect", {
    x: 0.4, y: 0.22, w: 1.1, h: 0.42, rectRadius: 0.08, fill: { color: THEME.primary }, line: { type: "none" },
  });
  s.addText(label, {
    x: 0.4, y: 0.22, w: 1.1, h: 0.42, fontSize: 14, bold: true, color: "FFFFFF", fontFace: THEME.font, align: "center", valign: "middle",
  });
}

function titleBar(s: PptxGenJS.Slide, title: string) {
  s.addText(title, {
    x: 1.7, y: 0.18, w: 8.6, h: 0.5, fontSize: 24, bold: true, color: THEME.primary, fontFace: THEME.font, valign: "middle",
  });
}

// ---------- 封面 ----------
function renderCover(s: PptxGenJS.Slide, _deck: Deck, slide: Extract<Slide, { layout: "cover" }>) {
  // 顶部深绿饰带
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 0.22, fill: { color: THEME.primary }, line: { type: "none" } });
  badge(s);
  // 中部主标题
  s.addText(slide.title, {
    x: 1.2, y: 2.4, w: 10.9, h: 1.1, fontSize: 44, bold: true, color: THEME.primary, fontFace: THEME.font, align: "center", valign: "middle",
  });
  s.addShape("rect", { x: 5.67, y: 3.55, w: 2.0, h: 0.06, fill: { color: THEME.accent }, line: { type: "none" } });
  if (slide.subtitle) {
    s.addText(slide.subtitle, {
      x: 1.2, y: 3.75, w: 10.9, h: 0.5, fontSize: 18, color: THEME.textSub, fontFace: THEME.font, align: "center",
    });
  }
  // 底部信息（年级/学科/主讲人/学校）
  const meta = slide.meta ?? [];
  if (meta.length) {
    const y0 = 5.2;
    meta.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      s.addText(m, {
        x: col ? 6.9 : 2.3, y: y0 + row * 0.55, w: 4.0, h: 0.45, fontSize: 15, color: THEME.text, fontFace: THEME.font, align: "center", valign: "middle",
      });
    });
  }
}

// ---------- 环节分隔页 ----------
function renderDivider(s: PptxGenJS.Slide, slide: Extract<Slide, { layout: "divider" }>) {
  s.addShape("rect", { x: 0, y: 3.3, w: 13.333, h: 0.9, fill: { color: THEME.primary }, line: { type: "none" } });
  s.addText(slide.section, {
    x: 0, y: 3.3, w: 13.333, h: 0.9, fontSize: 32, bold: true, color: "FFFFFF", fontFace: THEME.font, align: "center", valign: "middle",
  });
  if (slide.subtitle) {
    s.addText(slide.subtitle, {
      x: 0, y: 4.4, w: 13.333, h: 0.5, fontSize: 16, color: THEME.textSub, fontFace: THEME.font, align: "center",
    });
  }
}

// ---------- 内容页 ----------
function renderContent(s: PptxGenJS.Slide, _deck: Deck, slide: Extract<Slide, { layout: "content" }>) {
  badge(s);
  sectionTag(s, slide.section);
  titleBar(s, slide.title);
  // 标题下浅色分隔线
  s.addShape("rect", { x: 0.4, y: 0.82, w: 12.5, h: 0.02, fill: { color: "D8DFDA" }, line: { type: "none" } });

  let y = 1.15;
  for (const b of slide.blocks) {
    y = renderBlock(s, b, y);
    if (y > 7.05) break;
  }
}

// 按字数估算换行数（中文字符宽≈字号），避免长文本换行后与下一块重叠
function estLines(text: string, fontSize: number, wIn: number): number {
  const perLine = Math.max(4, Math.floor((wIn * 72 - 30) / (fontSize * 1.12)));
  return String(text)
    .split("\n")
    .reduce((n, seg) => n + Math.max(1, Math.ceil(seg.length / perLine)), 0);
}
function lineH(fontSize: number): number {
  return (fontSize * 1.5) / 72; // 行高 ≈ 1.5 倍字号
}

function renderBlock(s: PptxGenJS.Slide, b: Block, y: number): number {
  switch (b.type) {
    case "text": {
      const fontSize = b.size ?? 18;
      const lines = estLines(b.content, fontSize, 12.2);
      const h = Math.max(0.4, lines * lineH(fontSize));
      s.addText(b.content, {
        x: 0.55, y, w: 12.2, h, fontSize, color: b.color ?? THEME.text, bold: b.bold ?? false, fontFace: THEME.font, align: b.align ?? "left", valign: "top",
      });
      return y + h + 0.08;
    }

    case "list":
      b.items.forEach((it) => {
        const lines = estLines(it, 18, 11.7);
        const h = Math.max(0.4, lines * lineH(18));
        s.addText(`• ${it}`, { x: 0.7, y, w: 11.7, h, fontSize: 18, color: THEME.text, fontFace: THEME.font, valign: "top" });
        y += h + 0.08;
      });
      return y + 0.05;

    case "formula": {
      const lines = estLines(b.content, 26, 9.1);
      const h = Math.max(0.7, lines * lineH(26) + 0.1);
      s.addShape("roundRect", {
        x: 2.0, y, w: 9.3, h, rectRadius: 0.12, fill: { color: THEME.bgSoft }, line: { color: "D8DFDA", width: 1 },
      });
      s.addText(b.content, {
        x: 2.1, y, w: 9.1, h, fontSize: 26, bold: true, color: THEME.primary, fontFace: THEME.font, align: "center", valign: "middle",
      });
      if (b.note) {
        s.addText(b.note, { x: 2.1, y: y + h + 0.05, w: 9.1, h: 0.4, fontSize: 13, color: THEME.textSub, fontFace: THEME.font, align: "center" });
        return y + h + 0.5;
      }
      return y + h + 0.15;
    }

    case "mnemonic": {
      const lines = estLines(b.content, 18, 9.9);
      const h = Math.max(0.7, lines * lineH(18) + 0.2);
      s.addShape("roundRect", {
        x: 0.55, y, w: 12.2, h, rectRadius: 0.12, fill: { color: "EAF2EC" }, line: { color: THEME.accent, width: 1.5 },
      });
      const label = b.title ?? "口诀";
      s.addText(`『${label}』`, { x: 0.85, y, w: 1.6, h, fontSize: 15, bold: true, color: THEME.accent, fontFace: THEME.font, valign: "middle" });
      s.addText(b.content, { x: 2.5, y, w: 10.0, h, fontSize: 18, bold: true, color: THEME.primary, fontFace: THEME.font, valign: "middle" });
      return y + h + 0.18;
    }

    case "def": {
      const contentLines = estLines(b.content, 15, 8.9);
      const h = Math.max(0.6, contentLines * lineH(15) + 0.22);
      s.addShape("rect", { x: 0.55, y, w: 0.09, h, fill: { color: THEME.accent }, line: { type: "none" } });
      s.addShape("roundRect", {
        x: 0.64, y, w: 12.1, h, rectRadius: 0.06, fill: { color: THEME.bgSoft }, line: { color: "E0E6E2", width: 1 },
      });
      s.addText(b.title, { x: 0.9, y, w: 2.6, h, fontSize: 17, bold: true, color: THEME.accent, fontFace: THEME.font, valign: "middle" });
      s.addText(b.content, { x: 3.5, y, w: 8.9, h, fontSize: 15, color: THEME.text, fontFace: THEME.font, valign: "middle" });
      return y + h + 0.16;
    }

    case "example": {
      s.addText("【例题】", { x: 0.55, y, w: 1.6, h: 0.45, fontSize: 16, bold: true, color: THEME.warn, fontFace: THEME.font, valign: "middle" });
      y += 0.5;
      const qLines = estLines(b.question, 18, 11.9);
      const qH = Math.max(0.5, qLines * lineH(18));
      s.addText(b.question, { x: 0.75, y, w: 11.9, h: qH, fontSize: 18, color: THEME.text, fontFace: THEME.font, valign: "top" });
      y += qH + 0.12;
      if (b.solution) {
        const sLines = estLines(b.solution, 16, 11.9);
        const sH = Math.max(0.5, sLines * lineH(16));
        s.addShape("rect", { x: 0.55, y, w: 0.09, h: sH, fill: { color: "C9D8CE" }, line: { type: "none" } });
        s.addText(`【解】${b.solution}`, { x: 0.75, y, w: 11.9, h: sH, fontSize: 16, color: THEME.textSub, fontFace: THEME.font, valign: "top" });
        y += sH + 0.12;
      }
      if (b.tip) {
        const tLines = estLines(b.tip, 14, 11.9);
        const tH = Math.max(0.4, tLines * lineH(14));
        s.addText(`⚠ ${b.tip}`, { x: 0.75, y, w: 11.9, h: tH, fontSize: 14, color: THEME.warn, fontFace: THEME.font, valign: "top" });
        y += tH + 0.08;
      }
      return y + 0.08;
    }

    case "practice": {
      s.addText("【练习】", { x: 0.55, y, w: 1.6, h: 0.45, fontSize: 16, bold: true, color: THEME.primary, fontFace: THEME.font, valign: "middle" });
      y += 0.5;
      const qLines = estLines(b.question, 18, 11.9);
      const qH = Math.max(0.5, qLines * lineH(18));
      s.addText(b.question, { x: 0.75, y, w: 11.9, h: qH, fontSize: 18, color: THEME.text, fontFace: THEME.font, valign: "top" });
      y += qH + 0.12;
      if (b.hint) {
        const hLines = estLines(b.hint, 14, 11.9);
        const hH = Math.max(0.4, hLines * lineH(14));
        s.addText(b.hint, { x: 0.75, y, w: 11.9, h: hH, fontSize: 14, color: THEME.textSub, fontFace: THEME.font, valign: "top" });
        y += hH + 0.08;
      }
      return y + 0.08;
    }

    case "steps": {
      const labels = ["一", "二", "三", "四", "五", "六"];
      b.items.forEach((it, i) => {
        const lines = estLines(it, 17, 11.3);
        const h = Math.max(0.45, lines * lineH(17));
        s.addShape("ellipse", { x: 0.6, y, w: 0.42, h: 0.42, fill: { color: THEME.accent }, line: { type: "none" } });
        s.addText(labels[i] ?? String(i + 1), { x: 0.6, y, w: 0.42, h: 0.42, fontSize: 15, bold: true, color: "FFFFFF", fontFace: THEME.font, align: "center", valign: "middle" });
        s.addText(it, { x: 1.2, y, w: 11.3, h, fontSize: 17, color: THEME.text, fontFace: THEME.font, valign: "top" });
        y += h + 0.12;
      });
      return y + 0.05;
    }

    case "table": {
      const colW = 12.2 / b.header.length;
      const headerRow = b.header.map((h) => ({
        text: h,
        options: { fill: { color: THEME.primary }, color: "FFFFFF", bold: true, fontSize: 14, fontFace: THEME.font, align: "center" as const, valign: "middle" as const },
      }));
      const bodyRows = b.rows.map((r) =>
        r.map((cell) => ({
          text: cell,
          options: { color: THEME.text, fontSize: 14, fontFace: THEME.font, align: "center" as const, valign: "middle" as const },
        }))
      );
      s.addTable([headerRow, ...bodyRows], { x: 0.55, y, w: 12.2, colW, border: { pt: 0.75, color: "B4C2B8" } });
      return y + 0.45 + b.rows.length * 0.48 + 0.2;
    }

    case "columns": {
      const yl = renderColumn(s, b.left, 0.6, y);
      const yr = renderColumn(s, b.right, 6.9, y);
      return Math.max(yl, yr) + 0.1;
    }

    case "balance":
      renderBalance(s, b.left, b.right, b.caption, y);
      return y + 3.55;

    case "numberline":
      renderNumberline(s, b.from, b.to, b.marks, y);
      return y + 2.0;

    case "summary":
      b.points.forEach((it) => {
        const lines = estLines(it, 17, 11.7);
        const h = Math.max(0.45, lines * lineH(17));
        s.addText(`✓ ${it}`, { x: 0.7, y, w: 11.7, h, fontSize: 17, color: THEME.accent, fontFace: THEME.font, valign: "top" });
        y += h + 0.08;
      });
      return y + 0.05;

    default:
      return y;
  }
}

function renderColumn(s: PptxGenJS.Slide, blocks: Block[], x: number, y: number): number {
  let yy = y;
  for (const b of blocks) {
    if (b.type === "text") {
      const lines = estLines(b.content, 17, 5.8);
      const h = Math.max(0.4, lines * lineH(17));
      s.addText(b.content, { x, y: yy, w: 5.8, h, fontSize: 17, color: THEME.text, fontFace: THEME.font, valign: "top" });
      yy += h + 0.08;
    } else if (b.type === "list") {
      b.items.forEach((it) => {
        const lines = estLines(it, 17, 5.6);
        const h = Math.max(0.4, lines * lineH(17));
        s.addText(`• ${it}`, { x: x + 0.15, y: yy, w: 5.6, h, fontSize: 17, color: THEME.text, fontFace: THEME.font, valign: "top" });
        yy += h + 0.08;
      });
    } else if (b.type === "formula") {
      const lines = estLines(b.content, 20, 5.8);
      const h = Math.max(0.5, lines * lineH(20));
      s.addText(b.content, { x, y: yy, w: 5.8, h, fontSize: 20, bold: true, color: THEME.primary, fontFace: THEME.font, valign: "top" });
      yy += h + 0.08;
    }
  }
  return yy;
}

// ---------- 天平（方程/等式的具象模型） ----------
function renderBalance(s: PptxGenJS.Slide, left: string, right: string, caption: string | undefined, y: number) {
  const cx = 6.67; // 中心
  const beamY = y + 1.1;
  const leftX = cx - 3.2;
  const rightX = cx + 3.2;

  // 支点（倒三角）：尖顶托横梁
  s.addShape("triangle", { x: cx - 0.5, y: beamY, w: 1.0, h: 0.8, fill: { color: THEME.primary }, line: { type: "none" } });
  // 底座
  s.addShape("rect", { x: cx - 0.9, y: beamY + 0.8, w: 1.8, h: 0.14, fill: { color: THEME.primary }, line: { type: "none" } });
  // 横梁
  s.addShape("rect", { x: leftX, y: beamY - 0.07, w: rightX - leftX, h: 0.14, fill: { color: THEME.primary }, line: { type: "none" } });
  // 两侧吊线 + 托盘
  [leftX, rightX].forEach((px) => {
    s.addShape("line", { x: px, y: beamY + 0.07, w: 0, h: 1.1, line: { color: THEME.primary, width: 2 } });
    s.addShape("roundRect", { x: px - 0.95, y: beamY + 1.17, w: 1.9, h: 0.3, rectRadius: 0.12, fill: { color: THEME.bgSoft }, line: { color: THEME.primary, width: 1.5 } });
  });
  // 标签
  s.addText(left, { x: leftX - 0.95, y: beamY + 1.5, w: 1.9, h: 0.4, fontSize: 20, bold: true, color: THEME.primary, fontFace: THEME.font, align: "center", valign: "middle" });
  s.addText(right, { x: rightX - 0.95, y: beamY + 1.5, w: 1.9, h: 0.4, fontSize: 20, bold: true, color: THEME.primary, fontFace: THEME.font, align: "center", valign: "middle" });
  if (caption) {
    s.addText(caption, { x: 0.55, y: beamY + 1.95, w: 12.2, h: 0.45, fontSize: 15, color: THEME.textSub, fontFace: THEME.font, align: "center", valign: "middle" });
  }
}

// ---------- 数轴（有理数类知识点用） ----------
function renderNumberline(s: PptxGenJS.Slide, from: number, to: number, marks: Array<{ n: number; label?: string; color?: string }>, y: number) {
  const x0 = 1.2;
  const x1 = 12.1;
  const axisY = y + 1.2;
  const span = to - from || 1;
  const pos = (n: number) => x0 + ((n - from) / span) * (x1 - x0);

  s.addShape("line", { x: x0, y: axisY, w: x1 - x0, h: 0, line: { color: THEME.text, width: 2 } });
  s.addShape("rightArrow", { x: x1 - 0.3, y: axisY - 0.12, w: 0.3, h: 0.24, fill: { color: THEME.text }, line: { type: "none" } });

  for (const m of marks) {
    const px = pos(m.n);
    s.addShape("line", { x: px, y: axisY - 0.12, w: 0, h: 0.24, line: { color: THEME.text, width: 2 } });
    s.addText(m.label ?? String(m.n), { x: px - 0.3, y: axisY + 0.2, w: 0.6, h: 0.4, fontSize: 14, bold: true, color: m.color ?? THEME.text, fontFace: THEME.font, align: "center" });
  }
}
