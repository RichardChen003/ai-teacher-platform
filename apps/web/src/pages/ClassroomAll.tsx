import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LessonSelector from "../components/LessonSelector";
import { gradeLabel } from "../lib/grade";

export default function ClassroomAll() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("math");
  const [region, setRegion] = useState("");
  const [grade, setGrade] = useState(7);

  const subjectLabel = subject === "math" ? "数学" : subject === "physics" ? "物理" : "化学";

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z"
            clipRule="evenodd"
          />
        </svg>
        返回
      </button>

      <div className="page-head">
        <div>
          <h1 className="page-title">全部课程</h1>
          <p className="page-sub">按年级与科目浏览完整课程库</p>
        </div>
      </div>

      {/* 学科 + 就读地区 + 年级（与入测诊断同款选择器） */}
      <LessonSelector
        value={{ subject, region, grade }}
        onChange={(v) => {
          setSubject(v.subject);
          setRegion(v.region);
          setGrade(v.grade);
        }}
      />

      {/* 下：对应课程（暂未接入，留空） */}
      <div className="card flex flex-col items-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
        <div className="text-4xl">📚</div>
        <h3 className="mt-4 font-semibold text-slate-700">暂无课程</h3>
        <p className="mt-1.5 text-sm text-slate-500">
          「{subjectLabel} · {gradeLabel(grade)}」的课程正在整理中，敬请期待
        </p>
      </div>
    </div>
  );
}
