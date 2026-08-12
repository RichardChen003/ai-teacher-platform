import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Live2DTeacher from "../components/Live2DTeacher";
import {
  getActiveSyllabus,
  getLessonDeck,
  generatePpt,
  getQuiz,
  generateQuiz,
  submitQuiz,
  type Deck,
  type Question,
} from "../lib/api";
import { QuestionCard } from "./Diagnosis";

/* ---------- 语音讲解（Web Speech API） ---------- */
function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) return;
      stop();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "zh-CN";
      u.rate = rate;
      u.onend = () => {
        setSpeaking(false);
        setPaused(false);
      };
      u.onerror = () => {
        setSpeaking(false);
        setPaused(false);
      };
      utterRef.current = u;
      window.speechSynthesis.speak(u);
      setSpeaking(true);
      setPaused(false);
    },
    [rate, stop]
  );

  const togglePause = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else if (speaking) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }, [paused, speaking]);

  useEffect(() => () => stop(), [stop]);

  return { speaking, paused, rate, setRate, speak, stop, togglePause };
}

/* ---------- 课后小测面板 ---------- */
function QuizPanel({ lessonId, onClose }: { lessonId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [phase, setPhase] = useState<"init" | "quiz" | "result">("init");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assessmentId, setAssessmentId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    detail: Array<{ questionId: string; correct: boolean; correctAnswer: string; analysis: string }>;
  } | null>(null);

  const { data: existing } = useQuery({
    queryKey: ["quiz", lessonId],
    queryFn: () => getQuiz(lessonId),
    retry: false,
  });

  async function start() {
    setBusy(true);
    setError("");
    try {
      if (existing && existing.status === "in_progress" && existing.questions.length > 0) {
        setQuestions(existing.questions);
        setAssessmentId(existing.assessmentId);
        setPhase("quiz");
      } else {
        const res = await generateQuiz(lessonId);
        if (!res.questions.length) {
          setError("题库中没有适合本节课的题目");
          return;
        }
        setQuestions(res.questions);
        setAssessmentId(res.assessmentId);
        setPhase("quiz");
      }
    } catch (e: any) {
      setError(e.message ?? "生成小测失败");
    }
    setBusy(false);
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await submitQuiz(
        lessonId,
        questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "", timeSpentSec: 15 }))
      );
      setResult(res);
      setPhase("result");
      qc.invalidateQueries({ queryKey: ["syllabus-active"] });
    } catch (e: any) {
      setError(e.message ?? "交卷失败");
    }
    setBusy(false);
  }

  const answered = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">📋 课后小测</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {phase === "init" && (
          <div className="py-10 text-center">
            <div className="text-4xl">✍️</div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              检测这节课的学习效果，
              <br />
              结果会用来微调你的专属大纲。
            </p>
            {error && <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>}
            <button className="btn-accent mt-6" onClick={start} disabled={busy}>
              {busy ? "生成中…" : "开始小测"}
            </button>
          </div>
        )}

        {phase === "quiz" && (
          <>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span>已作答 {answered}/{questions.length}</span>
                <span>{current + 1}/{questions.length}</span>
              </div>
              <div className="bar-track mt-1.5">
                <div className="bar-fill" style={{ width: `${Math.max(3, (answered / questions.length) * 100)}%` }} />
              </div>
            </div>
            <QuestionCard
              q={questions[current]}
              index={current}
              total={questions.length}
              value={answers[questions[current].id] ?? ""}
              onChange={(v) => setAnswers((a) => ({ ...a, [questions[current].id]: v }))}
            />
            <div className="mt-4 flex justify-between">
              <button className="btn-ghost" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>上一题</button>
              {current < questions.length - 1 ? (
                <button className="btn-primary" onClick={() => setCurrent((c) => c + 1)}>下一题</button>
              ) : (
                <button className="btn-accent" onClick={submit} disabled={busy}>{busy ? "判分中…" : "交卷"}</button>
              )}
            </div>
          </>
        )}

        {phase === "result" && result && (
          <div className="py-6 text-center">
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl ${
              result.score / result.maxScore >= 0.6 ? "bg-emerald-100" : "bg-amber-100"
            }`}>
              {result.score / result.maxScore >= 0.6 ? "🎉" : "💪"}
            </div>
            <h4 className="mt-4 text-xl font-bold text-slate-800">
              得分 {result.score}/{result.maxScore}
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              {result.score / result.maxScore >= 0.8
                ? "掌握得很棒！大纲可以推进下一课了"
                : "部分知识点还不熟，大纲已标记巩固建议"}
            </p>
            <div className="mt-5 max-h-48 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-4 text-left">
              {result.detail.map((d, i) => (
                <div key={d.questionId} className="flex items-start gap-2 text-xs">
                  <span className={`mt-0.5 shrink-0 ${d.correct ? "text-emerald-600" : "text-rose-500"}`}>
                    {d.correct ? "✓" : "✗"}
                  </span>
                  <div className="text-slate-600">
                    第 {i + 1} 题
                    {!d.correct && d.correctAnswer && <span className="text-slate-400"> · 正确答案：{d.correctAnswer}</span>}
                    {!d.correct && d.analysis && (
                      <p className="mt-0.5 text-slate-400">解析：{d.analysis}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary mt-6" onClick={onClose}>完成</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 课堂主页面 ---------- */
export default function Classroom() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = params.get("lesson");
  const [slideIdx, setSlideIdx] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const { speaking, paused, rate, setRate, speak, stop, togglePause } = useSpeech();
  const [emotion, setEmotion] = useState<"normal" | "happy" | "thinking">("normal");
  const [pptBusy, setPptBusy] = useState(false);
  const [pptError, setPptError] = useState("");

  const { data: syllabus } = useQuery({
    queryKey: ["syllabus-active"],
    queryFn: () => getActiveSyllabus("math"),
    retry: false,
  });
  const lesson = useMemo(
    () => syllabus?.lessons.find((l) => l.id === lessonId) ?? null,
    [syllabus, lessonId]
  );

  const { data: deck, isLoading: deckLoading } = useQuery({
    queryKey: ["deck", lessonId],
    queryFn: () => getLessonDeck(lessonId!),
    enabled: !!lessonId && !!lesson,
    retry: false,
  });

  const genPpt = useMutation({
    mutationFn: () => generatePpt(lessonId!),
    onSuccess: (data) => {
      qc.setQueryData(["deck", lessonId], data.deck);
      setPptBusy(false);
    },
    onError: (e: any) => {
      setPptError(e.message ?? "生成课件失败");
      setPptBusy(false);
    },
  });
  const qc = useQueryClient();

  // 切换页面自动朗读讲稿
  useEffect(() => {
    if (!deck || !deck.narration) return;
    const text = deck.narration[slideIdx];
    if (text) {
      setEmotion("normal");
      speak(text);
    } else {
      stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIdx, deck]);

  useEffect(() => () => stop(), [stop]);

  // 未选择课时 → 引导
  if (!lessonId || !lesson) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-4xl shadow-xl">
          🎬
        </div>
        <h2 className="mt-6 text-xl font-bold text-slate-800">
          {syllabus ? "选择一节课开始学习" : "还没有课程可上"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {syllabus
            ? "从教学大纲中选择一节「待学习」的课，数字人老师会为你讲解。"
            : "完成入测诊断并生成教学大纲后，这里就会变成你的专属课堂。"}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {syllabus ? (
            <button className="btn-primary" onClick={() => navigate("/syllabus")}>查看大纲</button>
          ) : (
            <>
              <button className="btn-primary" onClick={() => navigate("/diagnosis")}>去做入测诊断</button>
              <button className="btn-ghost" onClick={() => navigate("/syllabus")}>生成大纲</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 顶部信息条 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">第 {lesson.seq} 课 · {lesson.title}</h1>
          <p className="page-sub">数字人老师讲解 · 预计 {lesson.durationMin} 分钟</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-soft" onClick={() => navigate("/syllabus")}>返回大纲</button>
          <button className="btn-accent" onClick={() => setShowQuiz(true)}>
            📋 课后小测
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* 左侧：数字人老师 */}
        <div className="space-y-4">
          <div className={`card relative overflow-hidden ${speaking ? "speaking-ring" : ""}`} style={{ height: 380 }}>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/60 via-transparent to-transparent" />
            <Live2DTeacher speaking={speaking} emotion={emotion} />
            {/* 语音控制条 */}
            <div className="absolute inset-x-3 bottom-3 rounded-xl border border-slate-100 bg-white/90 p-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => (speaking ? togglePause() : speak(deck?.narration?.[slideIdx] ?? ""))}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                    speaking ? (paused ? "bg-amber-100 text-amber-600" : "bg-brand-600 text-white") : "bg-brand-100 text-brand-700 hover:bg-brand-200"
                  }`}
                  title={speaking ? (paused ? "继续" : "暂停") : "讲解"}
                >
                  {speaking ? (
                    paused ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M8 5v14l11-7z" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M6 5h4v14H6zm8 0h4v14h-4z" /></svg>
                    )
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
                <div className="flex flex-1 items-center gap-2 text-xs text-slate-400">
                  <span>语速</span>
                  <input
                    type="range" min={0.6} max={1.6} step={0.1} value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-20 accent-brand-600"
                  />
                  <span className="w-8">{rate.toFixed(1)}x</span>
                </div>
                {speaking && (
                  <button onClick={stop} className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100">停止</button>
                )}
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-lg">🎯</div>
              <div className="min-w-0">
                <div className="text-xs text-slate-400">本节课目标</div>
                <p className="truncate text-sm font-medium text-slate-700">
                  {lesson.objectives.join("；") || "掌握本节核心知识点"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：课件 */}
        <div className="space-y-4">
          {deckLoading && (
            <div className="card flex h-[420px] flex-col items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              <p className="mt-3 text-sm text-slate-400">正在加载课件…</p>
            </div>
          )}

          {!deckLoading && !deck && (
            <div className="card flex h-[420px] flex-col items-center justify-center p-8 text-center">
              <div className="text-4xl">📑</div>
              <h3 className="mt-4 font-semibold text-slate-700">课件尚未生成</h3>
              <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                点击按钮生成这节课的教学课件（PPT），生成后可直接在线讲解或导出 PPTX 文件。
              </p>
              {pptError && <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{pptError}</div>}
              <button className="btn-primary mt-5" onClick={() => { setPptBusy(true); genPpt.mutate(); }} disabled={pptBusy}>
                {pptBusy ? "生成中…" : "生成课件"}
              </button>
            </div>
          )}

          {deck && (
            <>
              {/* 幻灯片 */}
              <div className="card animate-fade-up relative flex min-h-[420px] flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                  <span className="badge-blue">{slideIdx + 1} / {deck.slides.length}</span>
                  <span className="text-sm font-semibold text-slate-700">{deck.slides[slideIdx].title}</span>
                  <button
                    className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                    onClick={() => window.open(`/api/lessons/${lessonId}/ppt`, "_blank")}
                    title="导出 PPTX（下载接口）"
                  >
                    导出 PPTX
                  </button>
                </div>
                <div className="flex-1 px-8 py-6">
                  <SlideView slide={deck.slides[slideIdx]} />
                </div>
                {/* 翻页控制 */}
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                  <button
                    className="btn-ghost px-3 py-2 text-xs"
                    disabled={slideIdx === 0}
                    onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                  >
                    上一页
                  </button>
                  <div className="flex gap-1">
                    {deck.slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSlideIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${i === slideIdx ? "w-6 bg-brand-500" : "w-1.5 bg-slate-200 hover:bg-slate-300"}`}
                      />
                    ))}
                  </div>
                  <button
                    className="btn-primary px-3 py-2 text-xs"
                    disabled={slideIdx === deck.slides.length - 1}
                    onClick={() => setSlideIdx((i) => Math.min(deck.slides.length - 1, i + 1))}
                  >
                    下一页
                  </button>
                </div>
              </div>

              {/* 讲稿字幕 */}
              <div className="card p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={speaking ? "text-emerald-500" : ""}>🔊 {speaking ? (paused ? "已暂停" : "正在讲解…") : "点击播放收听讲解"}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {deck.narration?.[slideIdx] ?? "本页无讲稿"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {showQuiz && <QuizPanel lessonId={lessonId} onClose={() => setShowQuiz(false)} />}
    </div>
  );
}

function SlideView({ slide }: { slide: { title: string; bulletPoints?: string[]; formula?: string; example?: string } }) {
  return (
    <div className="flex h-full flex-col">
      <h2 className="text-xl font-bold text-slate-900">{slide.title}</h2>
      {slide.bulletPoints && slide.bulletPoints.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {slide.bulletPoints.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              {b}
            </li>
          ))}
        </ul>
      )}
      {slide.formula && (
        <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/60 px-5 py-4 text-center font-mono text-lg text-brand-800">
          {slide.formula}
        </div>
      )}
      {slide.example && (
        <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/60 px-5 py-4">
          <div className="text-xs font-semibold text-amber-600">例题</div>
          <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{slide.example}</p>
        </div>
      )}
    </div>
  );
}
