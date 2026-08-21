# -*- coding: utf-8 -*-
"""
初中压轴题库导入器 —— 《H2026中考数学每日一道压轴题》
- 2025中考解答题压轴题130题（docx，130题）
- 2026中考每日一题（docx，120题）
- 全部为解答题压轴题 → level 固定「压轴」；解答题无选项、答案在参考答案PDF（未入库 → 待人工批改）
- 图片：WMF/PNG → apps/web/public/question-imgs/（命名 jhard-{seq}-f{n}.png）
- 知识点：按题干关键词映射到 jkp-XXXX（初中 437 知识点）
- 输出：infra/d1/junior-hard.sql（INSERT OR IGNORE，source='imported-junior-hard'）
用法: python scripts/import-junior-hard.py
"""
import os, re, sys, json
import importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIRS = [
    r"D:\BaiduNetdiskDownload\H2026中考数学每日一道压轴题\2025中考解答题压轴题130题",
    r"D:\BaiduNetdiskDownload\H2026中考数学每日一道压轴题\2026中考每日一题",
]
IMG_DIR = os.path.join(ROOT, "apps", "web", "public", "question-imgs")
OUT_SQL = os.path.join(ROOT, "infra", "d1", "junior-hard.sql")

# 复用 import-docx-bank 的解析/渲染函数
_spec = importlib.util.spec_from_file_location(
    "idb", os.path.join(os.path.dirname(os.path.abspath(__file__)), "import-docx-bank.py"))
idb = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(idb)

# ---------- 压轴题知识点映射（关键词 → jkp-XXXX）----------
# 顺序匹配，取第一个命中；未命中挂 jkp-0396（抛物线存在性综合，压轴通用）
HARD_KP_RULES = [
    ("抛物", "jkp-0396"), ("二次函数", "jkp-0396"), ("抛物线", "jkp-0396"),
    ("外接圆", "jkp-0357"), ("切线", "jkp-0361"), ("阴影", "jkp-0367"), ("扇形", "jkp-0367"),
    ("弧", "jkp-0349"), ("圆心", "jkp-0349"), ("圆周角", "jkp-0351"), ("弦", "jkp-0345"),
    ("旋转", "jkp-0343"), ("对称", "jkp-0173"),
    ("相似", "jkp-0409"), ("全等", "jkp-0167"), ("中点", "jkp-0286"),
    ("平行四边形", "jkp-0281"), ("矩形", "jkp-0288"), ("菱形", "jkp-0292"),
    ("正方形", "jkp-0296"), ("梯形", "jkp-0298"),
    ("等腰", "jkp-0181"), ("等边", "jkp-0183"), ("直角", "jkp-0268"), ("勾股", "jkp-0268"),
    ("面积", "jkp-0367"), ("最值", "jkp-0390"), ("存在", "jkp-0396"), ("最小值", "jkp-0390"),
    ("反比例", "jkp-0266"), ("一次函数", "jkp-0219"),
    ("菱形", "jkp-0292"),
]


def map_kp(content):
    for kw, kp in HARD_KP_RULES:
        if kw in content:
            return kp
    return "jkp-0396"


def split_hard_questions(paras):
    """按 ★...第N题★ 或 N． 切分题目；★ 标题只作分隔符，不计入题目内容"""
    questions = []
    cur = None
    for seq in paras:
        text = "".join(x[1] for x in seq if x[0] == "t").strip()
        m1 = re.match(r"^★.*第(\d+)题★", text)
        m2 = re.match(r"^(\d+)[．.]\s*", text)
        if m1:
            # 标题段：开启新题（内容从后续段落累计）
            if cur and cur.get("clen", 0) > 15:
                questions.append(cur)
            cur = {"no": int(m1.group(1)), "segs": [], "clen": 0}
        elif m2 and int(m2.group(1)) <= 250:
            if cur and cur.get("clen", 0) > 15:
                questions.append(cur)
            cur = {"no": int(m2.group(1)), "segs": [seq], "clen": len(text)}
        elif cur is not None:
            cur["segs"].append(seq)
            cur["clen"] = cur.get("clen", 0) + len(text)
    if cur and cur.get("clen", 0) > 15:
        questions.append(cur)
    return questions


def main():
    os.makedirs(IMG_DIR, exist_ok=True)
    all_rows = []
    seq = 0
    for src in SRC_DIRS:
        if not os.path.isdir(src):
            print("跳过（不存在）:", src)
            continue
        for fname in sorted(os.listdir(src)):
            if not fname.endswith(".docx"):
                continue
            path = os.path.join(src, fname)
            print("解析:", fname)
            paras, z, media_map = idb.parse_docx(path)
            qs = split_hard_questions(paras)
            print(f"  切分 {len(qs)} 题")
            for q in qs:
                seq += 1
                qid = f"jhard-{seq:04d}"
                # 组题干（文本 + 渲染图片）
                stream = []
                img_no = 0
                for seg in q["segs"]:
                    for kind, val in seg:
                        if kind == "img":
                            img_no += 1
                            fname_img = f"{qid}-f{img_no}.png"
                            if idb.render_wmf(z, val, fname_img):
                                stream.append(f"[IMG:{fname_img}]")
                        else:
                            stream.append(val)
                content = "".join(stream)
                content = re.sub(r"^\s*\d+[．.]\s*", "", content).strip()
                if len(content) < 10:
                    continue
                kp = map_kp(content)
                content = content.replace("'", "''")
                all_rows.append(
                    f"('{qid}','math','初中',0,'{kp}','short_answer',0.78,'{content}','','','','imported-junior-hard','approved','通用','压轴');"
                )
    with open(OUT_SQL, "w", encoding="utf-8") as f:
        f.write("-- 初中压轴题库（H2026中考数学每日一道压轴题）\n")
        f.write("-- source='imported-junior-hard'，level=压轴，解答题无答案（参考答案在PDF，后续可人工/LLM补）\n")
        for row in all_rows:
            f.write("INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version, level) VALUES " + row + "\n")
    print(f"\n共生成 {len(all_rows)} 题 → {OUT_SQL}")
    print(f"图片目录: {IMG_DIR}")


if __name__ == "__main__":
    main()
