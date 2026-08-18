import { gradeLabel, JUNIOR_GRADES, SENIOR_GRADES } from "../lib/grade";
import { REGIONS, REGION_CITIES, textbookOfRegion, splitRegion } from "@aiteacher/shared";

/**
 * 课程/诊断共用的「学科 + 就读地区 + 就读年级」选择器
 * 样式与「入测诊断」完全一致：
 *  - 学科：3 个大按钮（emoji）
 *  - 地区：省 → 市 两级联动下拉（中考为市一级考核）
 *  - 年级：2 行 × 6 列（初一上~初三下 / 高一上~高三下）
 */
export type LessonSelection = {
  subject: string;
  region: string; // "" 或 "省-市" / "省"
  grade: number;  // 7~18 学期粒度
};

const SUBJECTS = [
  { key: "math", label: "数学", emoji: "📐" },
  { key: "physics", label: "物理", emoji: "⚛️" },
  { key: "chemistry", label: "化学", emoji: "🧪" },
];

function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
      <span className="text-base">{icon}</span>
      {text}
    </div>
  );
}

function gradeBtnCls(active: boolean) {
  return `rounded-xl border px-1 py-2.5 text-sm font-medium transition-all ${
    active
      ? "border-brand-400 bg-brand-600 text-white shadow-[0_4px_12px_-2px_rgb(43_83_223/0.4)]"
      : "border-slate-200 text-slate-600 hover:border-brand-200"
  }`;
}

export default function LessonSelector({
  value,
  onChange,
}: {
  value: LessonSelection;
  onChange: (v: LessonSelection) => void;
}) {
  const set = (patch: Partial<LessonSelection>) => onChange({ ...value, ...patch });

  return (
    <div className="card animate-fade-up p-6">
      {/* 学科 */}
      <SectionLabel icon="📘" text="选择学科" />
      <div className="mt-3 grid grid-cols-3 gap-3">
        {SUBJECTS.map((s) => (
          <button
            key={s.key}
            onClick={() => set({ subject: s.key })}
            className={`rounded-xl border p-4 text-center transition-all ${
              value.subject === s.key
                ? "border-brand-400 bg-brand-50 ring-4 ring-brand-100"
                : "border-slate-200 hover:border-brand-200"
            }`}
          >
            <div className="text-2xl">{s.emoji}</div>
            <div className={`mt-1.5 text-sm font-medium ${value.subject === s.key ? "text-brand-700" : "text-slate-600"}`}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* 就读地区（省 → 市 两级下拉） */}
      <div className="mt-7">
        <SectionLabel icon="📍" text="就读地区（匹配教材版本）" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">省份</label>
            <select
              className="input"
              value={splitRegion(value.region).province}
              onChange={(e) => {
                const p = e.target.value;
                if (!p) {
                  set({ region: "" });
                  return;
                }
                // 选中省份：默认选该省第一个城市（直辖市则直接省名）
                const city = REGION_CITIES[p]?.[0] ?? "";
                set({ region: city ? `${p}-${city}` : p });
              }}
            >
              <option value="">不限（通用）</option>
              {REGIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">城市</label>
            <select
              className="input"
              disabled={!splitRegion(value.region).province}
              value={splitRegion(value.region).city}
              onChange={(e) => {
                const city = e.target.value;
                const prov = splitRegion(value.region).province;
                set({ region: city ? `${prov}-${city}` : prov });
              }}
            >
              {splitRegion(value.region).province && <option value="">仅省（不分城市）</option>}
              {(REGION_CITIES[splitRegion(value.region).province] ?? []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          {value.region
            ? `已匹配教材：${textbookOfRegion(value.region)}（按该版本优先出题，题量不足时自动放宽）`
            : "不指定地区时按全国通用（人教版）出题"}
        </p>
      </div>

      {/* 就读年级：2 行 × 6 列 */}
      <div className="mt-7">
        <SectionLabel icon="🎓" text="选择年级" />
        <div className="mt-3 grid grid-cols-6 gap-2">
          {JUNIOR_GRADES.map((g) => (
            <button key={g} onClick={() => set({ grade: g })} className={gradeBtnCls(value.grade === g)}>
              {gradeLabel(g)}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {SENIOR_GRADES.map((g) => (
            <button key={g} onClick={() => set({ grade: g })} className={gradeBtnCls(value.grade === g)}>
              {gradeLabel(g)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
