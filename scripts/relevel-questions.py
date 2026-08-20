# -*- coding: utf-8 -*-
"""
难度重打标 —— 以《2026新高考数学分层练1000题》为基准
========================================================
背景：生成题（template/template-hs/template-j/teacher）的 level 此前按伪随机
difficulty 数值切分（0.3~0.45 基础 / 0.46~0.65 中档 / 0.7+ 压轴），而 difficulty
本身是 `0.3 + (no % 6) * 0.08` 这类与题面无关的伪随机数 → 简单题（如 log₂16=?）
被标成中档/压轴。

新规则（以题面复杂度为准，可解释、可复现）：
  S = 题面复杂度评分（题干 + 选项文本的数学符号/长度/关键词）
  S <= 1   → 基础
  2 <= S <= 4 → 中档
  S >= 5   → 压轴

导入题（imported-docx）难度来自题库文档本身，是权威基准，不重打标。

输出：
  infra/d1/relevel-questions.sql  （UPDATE 语句，供审计/回滚）
  直接连本地 D1 sqlite 执行（若未锁）
用法: python scripts/relevel-questions.py
"""
import os
import random
import re
import sqlite3
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(
    ROOT, ".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject",
    "c6c9fe2e839a026d2bc28c3710008b8d91b43bb2bed7c7b18fa3ea4062dfb1a0.sqlite",
)
OUT_SQL = os.path.join(ROOT, "infra", "d1", "relevel-questions.sql")

# ---------------- 复杂度评分 ----------------
SYMBOL_WEIGHTS = [
    ("√", 2), ("log", 1), ("ln", 1), ("sin", 1), ("cos", 1), ("tan", 1),
    ("∑", 2), ("∫", 3), ("lim", 2), ("²", 1), ("³", 2), ("⁻", 1), ("π", 1),
]
KEYWORD_WEIGHTS = [
    ("恒成立", 3), ("证明", 3), ("构造", 2), ("综合", 2), ("最值", 2), ("存在", 2),
    ("取值范围", 2), ("应用", 1), ("实际", 1), ("讨论", 1), ("分类", 1), ("单调性", 1),
]


def complexity_score(content: str, options_text: str) -> int:
    s = 0
    L = len(content or "")
    if L >= 25:
        s += 1
    if L >= 60:
        s += 1
    for sym, w in SYMBOL_WEIGHTS:
        if sym in content:
            s += content.count(sym) * w
    if "/" in content or "分之" in content:
        s += 1
    for kw, w in KEYWORD_WEIGHTS:
        if kw in content:
            s += w
    # 选项复杂度（低权重：仅当选项含复杂结构时 +1）
    opt = options_text or ""
    if len(opt) > 100:
        s += 1
    if any(sym in opt for sym in ("√", "∑", "∫", "分之")):
        s += 1
    return s


def level_of(s: int) -> str:
    if s <= 1:
        return "基础"
    if s <= 4:
        return "中档"
    return "压轴"


def difficulty_of(level: str, rng: random.Random) -> float:
    lo, hi = {"基础": (0.30, 0.45), "中档": (0.50, 0.65), "压轴": (0.70, 0.85)}[level]
    return round(rng.uniform(lo, hi), 2)


def main():
    if not os.path.exists(DB):
        print("数据库不存在:", DB)
        sys.exit(1)
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    cur.execute(
        "SELECT id, source, knowledge_point_id, content, options, type, level, difficulty FROM questions"
    )
    rows = cur.fetchall()
    print(f"总题数: {len(rows)}")

    rng = random.Random(20260820)  # 固定种子，difficulty 可复现
    updates = []
    stats = {"基础": 0, "中档": 0, "压轴": 0}
    changed = 0
    skipped = 0
    for qid, source, kp, content, options, qtype, old_level, old_diff in rows:
        if source == "imported-docx":
            skipped += 1
            continue  # 权威基准，不重打标
        opt_text = ""
        if options:
            try:
                import json
                opt_text = " ".join(o.get("text", "") for o in json.loads(options))
            except Exception:
                opt_text = ""
        s = complexity_score(content or "", opt_text)
        new_level = level_of(s)
        new_diff = difficulty_of(new_level, rng)
        stats[new_level] += 1
        if new_level != old_level or abs(new_diff - float(old_diff or 0)) > 1e-9:
            changed += 1
        updates.append((new_level, new_diff, qid))

    print(f"重打标题数(非导入题): {len(updates)}  其中档位/难度有变化: {changed}  导入题保留: {skipped}")
    print(f"新分布: 基础 {stats['基础']} / 中档 {stats['中档']} / 压轴 {stats['压轴']}")

    # 写审计 SQL
    with open(OUT_SQL, "w", encoding="utf-8") as f:
        f.write("-- 难度重打标（2026-08-20，以1000题题库为基准，题面复杂度评分）\n")
        f.write("-- 来源: scripts/relevel-questions.py\n\n")
        for lv, diff, qid in updates:
            f.write(f"UPDATE questions SET level='{lv}', difficulty={diff} WHERE id='{qid.replace(chr(39), chr(39)+chr(39))}';\n")
    print("SQL 已写入:", OUT_SQL)

    # 尝试直连执行（wrangler dev 运行中可能锁库，失败则提示手动执行）
    try:
        conn.execute("BEGIN")
        for lv, diff, qid in updates:
            cur.execute("UPDATE questions SET level=?, difficulty=? WHERE id=?", (lv, diff, qid))
        conn.commit()
        print("数据库已更新 ✅")
    except Exception as e:
        conn.rollback()
        print("直连执行失败（可能被 wrangler dev 锁定）:", e)
        print("可停止 wrangler dev 后用 sqlite3 执行:", OUT_SQL)

    # 抽查：对数运算/集合/零点 的题
    print("\n=== 抽查 ===")
    for kid, name in [("hs-kp-0053", "对数运算"), ("hs-kp-0001", "常见的集合"), ("hs-kp-0057", "函数的零点")]:
        cur.execute(
            "SELECT level, difficulty, substr(content,1,40) FROM questions WHERE knowledge_point_id=? AND source!='imported-docx' LIMIT 6",
            (kid,),
        )
        print(f"[{name}]")
        for r in cur.fetchall():
            print("  ", r)
    conn.close()


if __name__ == "__main__":
    main()
