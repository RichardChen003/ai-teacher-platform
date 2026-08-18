# 生成高中 18 章 252 知识点种子 SQL + 覆盖检查报告
# 用法: python scripts/gen-hs-syllabus.py
import sys, os, json
import importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 加载同目录数据文件
_spec = importlib.util.spec_from_file_location(
    "hs_syllabus_data", os.path.join(os.path.dirname(os.path.abspath(__file__)), "hs-syllabus-data.py")
)
_hsd = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_hsd)
CHAPTERS = _hsd.CHAPTERS

OUT_SQL = os.path.join(ROOT, "infra", "d1", "hs-syllabus.sql")

# ---------- 1. 生成知识点种子 SQL ----------
# 新表 hs_knowledge_points：独立于旧 knowledge_points，承载 18 章 252 知识点
lines = [
    "-- ============================================================",
    "-- 人教A版2019 高中数学 18章 252 知识点（章节层级）",
    "-- 表：hs_knowledge_points / hs_chapters",
    "-- 学期：ch1-5→高一上(13) ch6-10→高一下(14) ch11-13→高二上(15) ch14-18→高二下(16)",
    "-- ============================================================",
    "CREATE TABLE IF NOT EXISTS hs_chapters (",
    "  id       TEXT PRIMARY KEY,          -- ch1..ch18",
    "  no       INTEGER NOT NULL UNIQUE,   -- 1..18",
    "  name     TEXT NOT NULL,             -- 章节名",
    "  term     INTEGER NOT NULL,          -- 学期: 13|14|15|16",
    "  kp_start INTEGER NOT NULL,          -- 知识点起始编号",
    "  kp_end   INTEGER NOT NULL           -- 知识点结束编号",
    ");",
    "CREATE TABLE IF NOT EXISTS hs_knowledge_points (",
    "  id        TEXT PRIMARY KEY,         -- kp-hs-0001..0252",
    "  no        INTEGER NOT NULL UNIQUE,  -- 1..252 连续编号",
    "  chapter_id TEXT NOT NULL REFERENCES hs_chapters(id),",
    "  name      TEXT NOT NULL,            -- 知识点名",
    "  term      INTEGER NOT NULL          -- 学期: 13|14|15|16",
    ");",
    "CREATE INDEX IF NOT EXISTS idx_hskp_chapter ON hs_knowledge_points(chapter_id);",
    "CREATE INDEX IF NOT EXISTS idx_hskp_term ON hs_knowledge_points(term);",
]
# 章节
lines.append("INSERT OR IGNORE INTO hs_chapters (id, no, name, term, kp_start, kp_end) VALUES")
rows = []
kp_no = 1
for ch_no, ch_name, term, kps in CHAPTERS:
    start = kp_no
    end = kp_no + len(kps) - 1
    rows.append(f"('ch{ch_no}',{ch_no},'{ch_name}',{term},{start},{end})")
    kp_no += len(kps)
lines.append(",\n".join(rows) + ";")
# 知识点
lines.append("INSERT OR IGNORE INTO hs_knowledge_points (id, no, chapter_id, name, term) VALUES")
rows = []
kp_no = 1
for ch_no, ch_name, term, kps in CHAPTERS:
    for name in kps:
        rows.append(f"('kp-hs-{kp_no:04d}',{kp_no},'ch{ch_no}','{name}',{term})")
        kp_no += 1
lines.append(",\n".join(rows) + ";")

# ---------- 3. 同步到 knowledge_points（供题目外键与组卷使用） ----------
# 根节点 → 18 章节父节点 → 252 知识点（id: hs-kp-root / hs-ch-XX / hs-kp-XXXX）
lines.append("INSERT OR IGNORE INTO knowledge_points (id, subject, stage, grade_level, name, code, parent_id, depth, curriculum_ref, difficulty_base, order_index) VALUES")
lines.append("('hs-kp-root','math','高中',13,'高中数学（人教A版2019）','hs-root',NULL,0,'人教A版2019',0.5,0);")
lines.append("INSERT OR IGNORE INTO knowledge_points (id, subject, stage, grade_level, name, code, parent_id, depth, curriculum_ref, difficulty_base, order_index) VALUES")
rows = []
for ch_no, ch_name, term, kps in CHAPTERS:
    rows.append(
        f"('hs-ch-{ch_no:02d}','math','高中',{term},'第{ch_no}章 {ch_name}','ch{ch_no}','hs-kp-root',0,'人教A版2019',0.5,{1000 + ch_no})"
    )
lines.append(",\n".join(rows) + ";")
lines.append("INSERT OR IGNORE INTO knowledge_points (id, subject, stage, grade_level, name, code, parent_id, depth, curriculum_ref, difficulty_base, order_index) VALUES")
rows = []
kp_no = 1
for ch_no, ch_name, term, kps in CHAPTERS:
    for k_i, name in enumerate(kps):
        rows.append(
            f"('hs-kp-{kp_no:04d}','math','高中',{term},'{name}','ch{ch_no}.{kp_no:04d}','hs-ch-{ch_no:02d}',1,'人教A版2019·第{ch_no}章 {ch_name}',0.5,{kp_no})"
        )
        kp_no += 1
lines.append(",\n".join(rows) + ";")

with open(OUT_SQL, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"SQL 已生成: {OUT_SQL}")
print(f"总知识点: {kp_no - 1}")

# ---------- 2. 章节学期归属汇总 ----------
print("\n=== 章节学期归属 ===")
term_chs = {}
for ch_no, ch_name, term, kps in CHAPTERS:
    term_chs.setdefault(term, []).append((ch_no, ch_name, len(kps)))
for term in sorted(term_chs):
    chs = term_chs[term]
    total = sum(c for _, _, c in chs)
    names = ", ".join(f"{n}({c}个)" for _, n, c in chs)
    print(f"  学期{term}: 章节 {names} | 知识点 {total} 个")
