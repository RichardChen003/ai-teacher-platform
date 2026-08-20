# -*- coding: utf-8 -*-
"""重灌导入题库：删除旧 imported-docx 题 → 逐行插入新 SQL → 修正 grade_level
用法: python scripts/reload-imported-bank.py
"""
import sqlite3, os

DB = r"C:\Users\Richard chen\Desktop\ai-teacher-platform\.wrangler\state\v3\d1\miniflare-D1DatabaseObject\c6c9fe2e839a026d2bc28c3710008b8d91b43bb2bed7c7b18fa3ea4062dfb1a0.sqlite"
SQL = r"C:\Users\Richard chen\Desktop\ai-teacher-platform\infra\d1\imported-bank.sql"

conn = sqlite3.connect(DB, timeout=60)
conn.execute("PRAGMA foreign_keys = ON")
cur = conn.cursor()

# 1. 删除旧导入题
cur.execute("DELETE FROM questions WHERE source='imported-docx'")
print("删除旧导入题:", cur.rowcount)
conn.commit()

# 2. 逐行插入（每行一条完整 INSERT）
lines = open(SQL, encoding="utf-8").read().splitlines()
ok = skip = fail = 0
for line in lines:
    line = line.strip()
    if not line.startswith("("):
        continue
    try:
        cur.execute("INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version, level) VALUES " + line)
        if cur.rowcount:
            ok += 1
        else:
            skip += 1
    except Exception as e:
        print("FAIL:", str(e)[:80])
        fail += 1
conn.commit()
print(f"插入 {ok} / 已存在 {skip} / 失败 {fail}")

# 3. 修正 grade_level（从知识点表取学期）
cur.execute("""UPDATE questions SET grade_level = (SELECT kp.grade_level FROM knowledge_points kp WHERE kp.id = questions.knowledge_point_id)
                WHERE source='imported-docx' AND (grade_level = 0 OR grade_level IS NULL)""")
print("grade_level 修正:", cur.rowcount)
conn.commit()

cur.execute("SELECT COUNT(*) FROM questions WHERE source='imported-docx'")
print("导入题总数:", cur.fetchone()[0])
cur.execute("SELECT COUNT(*) FROM questions")
print("总题数:", cur.fetchone()[0])
conn.close()
