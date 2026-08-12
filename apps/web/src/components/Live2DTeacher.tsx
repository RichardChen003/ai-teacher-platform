import { useEffect, useRef, useState } from "react";

/**
 * 数字人老师（Live2D）
 * - 动态加载 pixi-live2d-display（避免拖慢首屏）
 * - speaking=true 时播放说话动作，停止时回到待机
 * - 任何失败自动降级为静态形象（不阻断课堂）
 */
export default function Live2DTeacher({
  speaking,
  emotion = "normal",
}: {
  speaking: boolean;
  emotion?: "normal" | "happy" | "thinking";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    let disposed = false;
    let app: any = null;
    let model: any = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      try {
        const [PIXI, live2d] = await Promise.all([
          import("pixi.js"),
          import("pixi-live2d-display"),
        ]);
        (window as any).PIXI = PIXI;
        const { Live2DModel } = live2d;

        const el = containerRef.current;
        if (!el || disposed) return;

        // 超时保护：20s 未就绪则降级
        timer = setTimeout(() => {
          if (!disposed && state !== "ready") setState("fallback");
        }, 20000);

        app = new PIXI.Application({
          width: el.clientWidth || 320,
          height: el.clientHeight || 360,
          backgroundAlpha: 0,
          autoStart: true,
          antialias: true,
        });
        el.appendChild(app.view as HTMLCanvasElement);

        const url = `${import.meta.env.BASE_URL}live2d/Haru/Haru.model3.json`;
        model = await Live2DModel.from(url, { autoInteract: false });

        const scaleX = (el.clientWidth || 320) / (model.width || 512);
        const scaleY = (el.clientHeight || 360) / (model.height || 512);
        const scale = Math.max(scaleX, scaleY) * 1.15;
        model.scale.set(scale);
        model.anchor.set(0.5, 0.5);
        model.position.set((el.clientWidth || 320) / 2, (el.clientHeight || 360) / 1.85);
        app.stage.addChild(model);
        (el as any).__model = model; // 供说话/表情切换使用
        (el as any).__app = app;

        // 待机动作
        model.motion("idle");
        if (!disposed) {
          setState("ready");
          if (timer) clearTimeout(timer);
        }
      } catch (e) {
        console.warn("[Live2D] 降级为静态形象:", e);
        if (!disposed) setState("fallback");
      }
    })();

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      try {
        app?.destroy?.(true, { children: true, texture: true });
      } catch {
        /* ignore */
      }
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 说话状态切换动作
  useEffect(() => {
    if (state !== "ready") return;
    const el = containerRef.current as any;
    const model = el?.__model;
    if (!model) return;
    try {
      if (speaking) {
        model.motion("talking");
      } else {
        model.motion("idle");
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speaking, state]);

  // 表情切换
  useEffect(() => {
    if (state !== "ready") return;
    const el = containerRef.current as any;
    const model = el?.__model;
    if (!model || !model.expression) return;
    try {
      model.expression(emotion === "happy" ? "F01" : emotion === "thinking" ? "F03" : "F05");
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emotion, state]);

  if (state === "fallback") {
    return <StaticTeacher />;
  }

  return (
    <div className="relative h-full w-full">
      {state === "loading" && <StaticTeacher dim />}
      <div
        ref={containerRef}
        className={`absolute inset-0 transition-opacity duration-500 ${state === "ready" ? "opacity-100" : "opacity-0"}`}
        onMouseDown={(e) => {
          // 点击模型可以触发小动作（人性化细节）
          const el = containerRef.current as any;
          const m = el?.__model;
          try {
            m?.motion?.("tap");
          } catch {
            /* ignore */
          }
        }}
      />
      {state === "ready" && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2">
          <span className={`badge ${speaking ? "badge-green" : "badge-slate"} bg-white/80 backdrop-blur`}>
            {speaking ? "● 正在讲解" : "等待提问"}
          </span>
        </div>
      )}
    </div>
  );
}

function StaticTeacher({ dim }: { dim?: boolean }) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center ${dim ? "opacity-40" : ""}`}>
      <div className="relative">
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 shadow-[0_12px_32px_-8px_rgb(43_83_223/0.55)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" className="h-16 w-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
          </svg>
        </div>
        <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow">
          👩‍🏫
        </div>
      </div>
      <div className="mt-4 rounded-full bg-white px-4 py-1 text-xs font-medium text-slate-500 shadow-sm">
        林老师 · 初中数学
      </div>
    </div>
  );
}
