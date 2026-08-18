# 生成初中 29 章 437 知识点种子 SQL（仿高中 hs-syllabus 流程）
import os, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location(
    "junior_syllabus_data", os.path.join(os.path.dirname(os.path.abspath(__file__)), "junior-syllabus-data.py"))
_hsd = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_hsd)
CHAPTERS = _hsd.JUNIOR_CHAPTERS

OUT_SQL = os.path.join(ROOT, "infra", "d1", "junior-syllabus.sql")

lines = [
    "-- ============================================================",
    "-- 人教初中数学 29 章 437 知识点（章节层级）",
    "-- 表：junior_chapters / junior_knowledge_points",
    "-- 学期：ch1-4→7(初一上) ch5-10→8(初一下) ch11-15→9(初二上)",
    "--       ch16-20→10(初二下) ch21-25→11(初三上) ch26-29→12(初三下)",
    "-- ============================================================",
    "CREATE TABLE IF NOT EXISTS junior_chapters (",
    "  id       TEXT PRIMARY KEY,          -- jch1..jch29",
    "  no       INTEGER NOT NULL UNIQUE,   -- 1..29",
    "  name     TEXT NOT NULL,             -- 章节名",
    "  term     INTEGER NOT NULL,          -- 学期: 7|8|9|10|11|12",
    "  kp_start INTEGER NOT NULL,          -- 知识点起始编号",
    "  kp_end   INTEGER NOT NULL           -- 知识点结束编号",
    ");",
    "CREATE TABLE IF NOT EXISTS junior_knowledge_points (",
    "  id        TEXT PRIMARY KEY,         -- jkp-0001..0437",
    "  no        INTEGER NOT NULL UNIQUE,  -- 1..437 连续编号",
    "  chapter_id TEXT NOT NULL REFERENCES junior_chapters(id),",
    "  name      TEXT NOT NULL,            -- 知识点名",
    "  term      INTEGER NOT NULL          -- 学期: 7|8|9|10|11|12",
    ");",
    "CREATE INDEX IF NOT EXISTS idx_jkp_chapter ON junior_knowledge_points(chapter_id);",
    "CREATE INDEX IF NOT EXISTS idx_jkp_term ON junior_knowledge_points(term);",
]
# 章节
lines.append("INSERT OR IGNORE INTO junior_chapters (id, no, name, term, kp_start, kp_end) VALUES")
rows = []
kp_no = 1
for ch_no, ch_name, term, kps in CHAPTERS:
    start = kp_no; end = kp_no + len(kps) - 1
    rows.append(f"('jch{ch_no}',{ch_no},'{ch_name}',{term},{start},{end})")
    kp_no += len(kps)
lines.append(",\n".join(rows) + ";")
# 知识点
lines.append("INSERT OR IGNORE INTO junior_knowledge_points (id, no, chapter_id, name, term) VALUES")
rows = []
kp_no = 1
for ch_no, ch_name, term, kps in CHAPTERS:
    for name in kps:
        rows.append(f"('jkp-{kp_no:04d}',{kp_no},'jch{ch_no}','{name}',{term})")
        kp_no += 1
lines.append(",\n".join(rows) + ";")

# 同步到 knowledge_points（供题目外键与组卷；前缀 jkp-，parent 用 jch-）
lines.append("INSERT OR IGNORE INTO knowledge_points (id, subject, stage, grade_level, name, code, parent_id, depth, curriculum_ref, difficulty_base, order_index) VALUES")
lines.append("('jkp-root','math','初中',7,'初中数学（人教）','j-root',NULL,0,'人教初中',0.5,0);")
lines.append("INSERT OR IGNORE INTO knowledge_points (id, subject, stage, grade_level, name, code, parent_id, depth, curriculum_ref, difficulty_base, order_index) VALUES")
rows = []
for ch_no, ch_name, term, kps in CHAPTERS:
    rows.append(f"('jch-{ch_no:02d}','math','初中',{term},'第{ch_no}章 {ch_name}','jch{ch_no}','jkp-root',0,'人教初中',0.5,{2000 + ch_no})")
lines.append(",\n".join(rows) + ";")
lines.append("INSERT OR IGNORE INTO knowledge_points (id, subject, stage, grade_level, name, code, parent_id, depth, curriculum_ref, difficulty_base, order_index) VALUES")
rows = []
kp_no = 1
for ch_no, ch_name, term, kps in CHAPTERS:
    for name in kps:
        rows.append(f"('jkp-{kp_no:04d}','math','初中',{term},'{name}','jch{ch_no}.{kp_no:04d}','jch-{ch_no:02d}',1,'人教初中·第{ch_no}章 {ch_name}',0.5,{kp_no})")
        kp_no += 1
lines.append(",\n".join(rows) + ";")

with open(OUT_SQL, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"SQL 已生成: {OUT_SQL}")
print(f"总知识点: {kp_no - 1}")
