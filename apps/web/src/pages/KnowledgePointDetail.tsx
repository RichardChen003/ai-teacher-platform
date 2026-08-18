import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { knowledgePoints } from "../lib/knowledgePoints";
import { generateKnowledgePpt, type RichDeck } from "../lib/api";
import { gradeLabel } from "../lib/grade";
import DeckPreview from "../components/DeckPreview";

const subjectLabelMap: Record<string, string> = {
  math: "数学",
  physics: "物理",
  chemistry: "化学",
};

/* ---------- 思维导图（中心节点 + 放射状分支） ---------- */
function MindMap({ root, children }: { root: string; children: string[] }) {
  const W = 480;
  const H = 440;
  const cx = W / 2;
  const cy = H / 2;
  const R = 150;
  const n = children.length;
  const step = (2 * Math.PI) / n;
  const start = -Math.PI / 2;

  const pos = (i: number) => {
    const a = start + step * i;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  };

  return (
    <div className="relative mx-auto" style={{ width: W, height: H }}>
      <svg className="absolute inset-0" width={W} height={H}>
        {children.map((_, i) => {
          const p = pos(i);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#c0d5fc" strokeWidth={2} />;
        })}
      </svg>

      {/* 中心节点 */}
      <div
        className="absolute z-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-3 text-center text-sm font-bold text-white shadow-lg"
        style={{ left: cx, top: cy, transform: "translate(-50%, -50%)", width: 150 }}
      >
        {root}
      </div>

      {/* 分支节点 */}
      {children.map((c, i) => {
        const p = pos(i);
        return (
          <div
            key={i}
            className="absolute z-10 rounded-xl border border-brand-100 bg-white px-3 py-2 text-center text-xs font-medium text-slate-700 shadow-sm"
            style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)", width: 116 }}
          >
            {c}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- 知识点详情页 ---------- */
export default function KnowledgePointDetail() {
  const navigate = useNavigate();
  const { subject = "math", grade = "7", index = "0" } = useParams();
  const [selected, setSelected] = useState<"quiz" | "ppt" | "micro" | null>(null);
  const [ppt, setPpt] = useState<{
    status: "idle" | "generating" | "done" | "error";
    progress: number;
    deck?: RichDeck;
    pptxBase64?: string;
    filename?: string;
    error?: string;
  }>({ status: "idle", progress: 0 });

  const g = Number(grade);
  const idx = Number(index);
  // 学期粒度(7~18) → 学年粒度(7~11)：知识库按学年组织，同学年上/下学期共用
  const yearOf = (n: number) => Math.floor((n - 7) / 2) + 7;
  const point = knowledgePoints[subject]?.[yearOf(g)]?.[idx];

  const subjectLabel = subjectLabelMap[subject] ?? subject;

  const actions = [
    {
      key: "quiz" as const,
      label: "生成练习卷",
      desc: "围绕该知识点组卷，检验掌握程度",
      color: "from-brand-500 to-brand-600",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      ),
    },
    {
      key: "ppt" as const,
      label: "生成学习PPT",
      desc: "生成该知识点的讲解课件",
      color: "from-accent-400 to-accent-500",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
    },
    {
      key: "micro" as const,
      label: "生成微课堂",
      desc: "数字人老师微课讲解",
      color: "from-violet-500 to-purple-600",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
    },
  ];

  async function handleGeneratePpt() {
    if (!point) return;
    setSelected("ppt");
    setPpt({ status: "generating", progress: 0 });
    const timer = window.setInterval(() => {
      setPpt((s) =>
        s.status === "generating" ? { ...s, progress: Math.min(90, s.progress + 2 + Math.random() * 5) } : s
      );
    }, 220);
    try {
      const res = await generateKnowledgePpt({ subject, grade: Number(grade), name: point.name, children: point.children });
      window.clearInterval(timer);
      setPpt({ status: "done", progress: 100, deck: res.deck, pptxBase64: res.pptxBase64, filename: res.filename });
    } catch (e) {
      window.clearInterval(timer);
      setPpt({ status: "error", progress: 100, error: e instanceof Error ? e.message : "生成失败，请重试" });
    }
  }

  function handleDownload() {
    if (!ppt.pptxBase64 || !ppt.filename) return;
    const bin = atob(ppt.pptxBase64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ppt.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!point) {
    return (
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
          </svg>
          返回
        </button>
        <div className="card flex flex-col items-center py-16 text-center">
          <div className="text-4xl">🔍</div>
          <h3 className="mt-4 font-semibold text-slate-700">未找到该知识点</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
        </svg>
        返回
      </button>

      <div className="page-head">
        <div>
          <h1 className="page-title">{point.name}</h1>
          <p className="page-sub">
            {subjectLabel} · {gradeLabel(g)} · 完整教学大纲
          </p>
        </div>
      </div>

      {/* 思维导图 */}
      <div className="card animate-fade-up p-4 sm:p-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-semibold text-slate-800">🧠 知识思维导图</h3>
          <span className="badge-blue">{point.children.length} 个分支</span>
        </div>
        <MindMap root={point.name} children={point.children} />
      </div>

      {/* 三个功能入口 */}
      <div>
        <h3 className="font-semibold text-slate-800">选择生成内容</h3>
        <p className="mt-0.5 text-xs text-slate-400">针对「{point.name}」生成配套学习材料</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {actions.map((a) => (
            <button
              key={a.key}
              onClick={() => (a.key === "ppt" ? handleGeneratePpt() : setSelected(a.key))}
              className="card group relative flex flex-col overflow-hidden p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgb(15_23_42/0.25)]"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${a.color} text-white shadow-lg`}>
                {a.icon}
              </div>
              <div className="mt-3 font-semibold text-slate-800">{a.label}</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{a.desc}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                去生成
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {selected === "ppt" && (
          <div className="mt-5 space-y-4">
            {ppt.status === "generating" && (
              <div className="card p-5">
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    正在生成「{point.name}」学习 PPT…
                  </span>
                  <span className="tabular-nums text-slate-500">{Math.round(ppt.progress)}%</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-300"
                    style={{ width: `${ppt.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {ppt.progress < 25 ? "准备课件内容…" : ppt.progress < 55 ? "组织教学结构…" : ppt.progress < 85 ? "渲染 PPT 页面…" : "即将完成…"}
                </p>
              </div>
            )}

            {ppt.status === "done" && ppt.deck && (
              <div className="card p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">「{point.name}」学习 PPT 已生成</h3>
                    <p className="mt-0.5 text-xs text-slate-400">共 {ppt.deck.slides.length} 页 · 可预览或下载</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPpt({ status: "idle", progress: 0 })}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      收起
                    </button>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      下载 PPT
                    </button>
                  </div>
                </div>
                <DeckPreview deck={ppt.deck} />
              </div>
            )}

            {ppt.status === "error" && (
              <div className="rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 text-sm text-red-700">
                生成失败：{ppt.error}
                <button onClick={handleGeneratePpt} className="ml-2 font-semibold underline">
                  重试
                </button>
              </div>
            )}
          </div>
        )}

        {selected && selected !== "ppt" && (
          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-amber-700">
            「{actions.find((a) => a.key === selected)?.label}」功能正在开发中，敬请期待。
          </div>
        )}
      </div>
    </div>
  );
}
