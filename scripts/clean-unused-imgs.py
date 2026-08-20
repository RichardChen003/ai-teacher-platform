# -*- coding: utf-8 -*-
"""清理未被引用的公式图：从 imported-bank.sql 提取 [IMG:xxx] 引用，删除 question-imgs 中未引用的 png
用法: python scripts/clean-unused-imgs.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQL = os.path.join(ROOT, "infra", "d1", "imported-bank.sql")
IMG_DIR = os.path.join(ROOT, "apps", "web", "public", "question-imgs")

referenced = set()
sql_text = open(SQL, encoding="utf-8").read()
referenced.update(re.findall(r"\[IMG:([^\]]+\.png)\]", sql_text))

# 数据库里其他来源的题也可能引用（生成题无图片，但保险起见从库再取一次）
try:
    import sqlite3
    db = os.path.join(ROOT, ".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject",
                      "c6c9fe2e839a026d2bc28c3710008b8d91b43bb2bed7c7b18fa3ea4062dfb1a0.sqlite")
    if os.path.exists(db):
        conn = sqlite3.connect(db)
        rows = conn.execute("SELECT content FROM questions WHERE content LIKE '%[IMG:%'").fetchall()
        conn.close()
        for (content,) in rows:
            referenced.update(re.findall(r"\[IMG:([^\]]+\.png)\]", content or ""))
except Exception:
    pass

files = [f for f in os.listdir(IMG_DIR) if f.endswith(".png")]
unused = [f for f in files if f not in referenced]
print(f"图片总数: {len(files)}  被引用: {len(referenced)}  未引用: {len(unused)}")
if unused:
    for f in sorted(unused)[:10]:
        print("  删除:", f)
    if len(unused) > 10:
        print(f"  …共 {len(unused)} 张")
    for f in unused:
        try:
            os.remove(os.path.join(IMG_DIR, f))
        except Exception as e:
            print("  删除失败:", f, e)
    print(f"已删除 {len(unused)} 张未引用图片")
else:
    print("无未引用图片")
