import { useMemo, useState } from "react";
import type { RichBlock, RichDeck, RichSlide } from "../lib/api";

// 精品课绿主题（与 qualityDeck.ts 的 THEME 对齐）
const C = {
  primary: "#3B5643",
  accent: "#136839",
  warn: "#993C1D",
  text: "#2C2C2A",
  sub: "#5F5E5A",
  soft: "#F2F2F2",
  line: "#D8DFDA",
};

/* ---------- 例题（答案点击揭晓） ---------- */
function ExampleBlock({ block }: { block: Extract<RichBlock, { type: "example" }> }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="text-sm font-semibold" style={{ color: C.warn }}>
        【例题】
      </div>
      <p className="mt-1 whitespace-pre-line text-sm leading-snug" style={{ color: C.text }}>
        {block.question}
      </p>
      {block.solution && (
        <div className="mt-2">
          {show ? (
            <div className="border-l-2 pl-2.5 text-[13px] leading-snug" style={{ borderColor: "#C9D8CE", color: C.sub }}>
              【解】{block.solution}
            </div>
          ) : (
            <button
              onClick={() => setShow(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-sm font-medium transition hover:opacity-80"
              style={{ color: C.accent, borderColor: C.accent }}
            >
              💡 点击查看答案
            </button>
          )}
        </div>
      )}
      {block.tip && (
        <div className="mt-1.5 text-xs" style={{ color: C.warn }}>
          ⚠ {block.tip}
        </div>
      )}
    </div>
  );
}

/* ---------- 单个 block 渲染 ---------- */
function BlockView({ block }: { block: RichBlock }) {
  switch (block.type) {
    case "text":
      return (
        <p
          className="leading-snug"
          style={{
            fontSize: block.size ?? 15,
            color: block.color ?? C.text,
            fontWeight: block.bold ? 600 : 400,
            textAlign: block.align ?? "left",
          }}
        >
          {block.content}
        </p>
      );
    case "list":
      return (
        <ul className="space-y-1">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-2 text-[15px]" style={{ color: C.text }}>
              <span style={{ color: C.accent }}>•</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "formula":
      return (
        <div>
          <div className="rounded-lg px-4 py-3 text-center text-lg font-semibold" style={{ background: C.soft, color: C.primary, border: `1px solid ${C.line}` }}>
            {block.content}
          </div>
          {block.note && (
            <div className="mt-1.5 text-center text-xs" style={{ color: C.sub }}>
              {block.note}
            </div>
          )}
        </div>
      );
    case "mnemonic":
      return (
        <div className="rounded-lg px-3.5 py-2.5" style={{ background: "#EAF2EC", border: `1.5px solid ${C.accent}` }}>
          <span className="font-semibold" style={{ color: C.accent }}>
            『{block.title ?? "口诀"}』
          </span>
          <span className="ml-2 font-semibold" style={{ color: C.primary }}>
            {block.content}
          </span>
        </div>
      );
    case "def":
      return (
        <div className="flex overflow-hidden rounded-lg" style={{ background: C.soft, border: "1px solid #E0E6E2" }}>
          <div className="w-1 shrink-0" style={{ background: C.accent }} />
          <div className="flex min-w-0 flex-1 items-baseline gap-2 px-3 py-2">
            <span className="shrink-0 text-sm font-semibold" style={{ color: C.accent }}>
              {block.title}
            </span>
            <span className="text-sm leading-snug" style={{ color: C.text }}>
              {block.content}
            </span>
          </div>
        </div>
      );
    case "example":
      return <ExampleBlock block={block} />;
    case "practice":
      return (
        <div>
          <div className="text-sm font-semibold" style={{ color: C.primary }}>
            【练习】
          </div>
          <p className="mt-1 whitespace-pre-line text-sm leading-snug" style={{ color: C.text }}>
            {block.question}
          </p>
          {block.hint && (
            <div className="mt-1 text-xs" style={{ color: C.sub }}>
              {block.hint}
            </div>
          )}
        </div>
      );
    case "steps": {
      const labels = ["一", "二", "三", "四", "五", "六"];
      return (
        <div className="space-y-2">
          {block.items.map((it, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: C.accent }}
              >
                {labels[i] ?? i + 1}
              </span>
              <span className="text-sm" style={{ color: C.text }}>
                {it}
              </span>
            </div>
          ))}
        </div>
      );
    }
    case "table":
      return (
        <table className="w-full border-collapse text-center text-sm">
          <thead>
            <tr>
              {block.header.map((h, i) => (
                <th key={i} className="px-2 py-1.5 text-white" style={{ background: C.primary, border: "1px solid #B4C2B8" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1" style={{ color: C.text, border: "1px solid #B4C2B8" }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "columns":
      return (
        <div className="grid grid-cols-2 gap-6">
          <Column blocks={block.left} />
          <Column blocks={block.right} />
        </div>
      );
    case "balance":
      return <BalanceView left={block.left} right={block.right} caption={block.caption} />;
    case "numberline":
      return <NumberlineView from={block.from} to={block.to} marks={block.marks} />;
    case "summary":
      return (
        <div className="space-y-1.5">
          {block.points.map((it, i) => (
            <div key={i} className="flex gap-2 text-sm font-medium" style={{ color: C.accent }}>
              <span>✓</span>
              <span>{it}</span>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function Column({ blocks }: { blocks: RichBlock[] }) {
  return (
    <div className="space-y-2">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  );
}

/* ---------- 天平 SVG ---------- */
function BalanceView({ left, right, caption }: { left: string; right: string; caption?: string }) {
  const cx = 200, beamY = 52, leftX = 60, rightX = 340;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 400 150" className="w-full max-w-[360px]">
        <line x1={leftX} y1={beamY} x2={rightX} y2={beamY} stroke={C.primary} strokeWidth="4" />
        <path d={`M ${cx} ${beamY} l -22 30 l 44 0 Z`} fill={C.primary} />
        <rect x={cx - 32} y={beamY + 30} width="64" height="6" fill={C.primary} />
        {[leftX, rightX].map((px) => (
          <g key={px}>
            <line x1={px} y1={beamY} x2={px} y2={beamY + 40} stroke={C.primary} strokeWidth="3" />
            <rect x={px - 32} y={beamY + 40} width="64" height="12" rx="6" fill={C.soft} stroke={C.primary} strokeWidth="2" />
          </g>
        ))}
        <text x={leftX} y={beamY + 72} textAnchor="middle" fontSize="20" fontWeight="700" fill={C.primary}>
          {left}
        </text>
        <text x={rightX} y={beamY + 72} textAnchor="middle" fontSize="20" fontWeight="700" fill={C.primary}>
          {right}
        </text>
      </svg>
      {caption && (
        <div className="text-center text-xs" style={{ color: C.sub }}>
          {caption}
        </div>
      )}
    </div>
  );
}

/* ---------- 数轴 SVG ---------- */
function NumberlineView({ from, to, marks }: { from: number; to: number; marks: Array<{ n: number; label?: string; color?: string }> }) {
  const x0 = 30, x1 = 470;
  const span = to - from || 1;
  const pos = (n: number) => x0 + ((n - from) / span) * (x1 - x0);
  return (
    <svg viewBox="0 0 500 80" className="w-full max-w-[500px]">
      <line x1={x0} y1={40} x2={x1} y2={40} stroke={C.text} strokeWidth="2" />
      <polygon points={`${x1},40 ${x1 - 10},34 ${x1 - 10},46`} fill={C.text} />
      {marks.map((m, i) => (
        <g key={i}>
          <line x1={pos(m.n)} y1={34} x2={pos(m.n)} y2={46} stroke={C.text} strokeWidth="2" />
          <text x={pos(m.n)} y={62} textAnchor="middle" fontSize="13" fontWeight="600" fill={m.color ?? C.text}>
            {m.label ?? m.n}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- 单页 slide 渲染 ---------- */
function SlideView({ slide }: { slide: RichSlide }) {
  if (slide.layout === "cover") {
    return (
      <div className="flex h-full flex-col items-center justify-center px-10 text-center">
        <div className="text-xs" style={{ color: C.accent }}>
          基础教育精品课
        </div>
        <h3 className="mt-6 text-3xl font-bold" style={{ color: C.primary }}>
          {slide.title}
        </h3>
        <div className="mt-3 h-0.5 w-16" style={{ background: C.accent }} />
        {slide.subtitle && (
          <div className="mt-3 text-sm" style={{ color: C.sub }}>
            {slide.subtitle}
          </div>
        )}
        {slide.meta && (
          <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-2 text-sm" style={{ color: C.text }}>
            {slide.meta.map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (slide.layout === "divider") {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="px-10 py-4 text-3xl font-bold text-white" style={{ background: C.primary }}>
          {slide.section}
        </div>
        {slide.subtitle && (
          <div className="mt-4 text-sm" style={{ color: C.sub }}>
            {slide.subtitle}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-8 pb-4 pt-5">
      <div className="flex items-center gap-2">
        <span className="rounded-md px-2 py-0.5 text-xs font-bold text-white" style={{ background: C.primary }}>
          {slide.section}
        </span>
        <span className="truncate text-lg font-bold" style={{ color: C.primary }}>
          {slide.title}
        </span>
      </div>
      <div className="mt-2 h-px w-full" style={{ background: C.line }} />
      <div className="mt-4 flex-1 space-y-3 overflow-hidden">
        {slide.blocks.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </div>
    </div>
  );
}

/* ---------- 预览主组件 ---------- */
export default function DeckPreview({ deck }: { deck: RichDeck }) {
  const [idx, setIdx] = useState(0);
  const slides = deck.slides;
  const total = slides.length;
  const slide = slides[idx];

  const thumbs = useMemo(() => slides.map((s) => (s.layout === "divider" ? s.section : s.title)), [slides]);

  return (
    <div className="space-y-3">
      {/* 主预览区（16:9） */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" style={{ aspectRatio: "16 / 9" }}>
        <SlideView slide={slide} />
      </div>

      {/* 控制条 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
          </svg>
          上一页
        </button>
        <div className="text-sm font-medium" style={{ color: C.sub }}>
          第 {idx + 1} / {total} 页
        </div>
        <button
          onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
          disabled={idx === total - 1}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          下一页
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* 缩略条 */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {thumbs.map((t, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`shrink-0 rounded-md border px-2.5 py-1 text-xs transition ${
              i === idx ? "border-transparent text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
            style={i === idx ? { background: C.primary } : undefined}
          >
            {i + 1}. {t}
          </button>
        ))}
      </div>
    </div>
  );
}
