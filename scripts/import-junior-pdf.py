# -*- coding: utf-8 -*-
"""
初中计算专项导入器 —— 《初中数学重点计算专项练习》（27 个 PDF）
- 全部为基础计算/练习 → level 固定「基础」；无答案（练习册无答案区 → 待人工批改）
- PDF 文本提取（PyMuPDF）+ 乱码清洗 + 按题号切分
- 知识点：按文件名映射到 jkp-XXXX
- 输出：infra/d1/junior-pdf.sql（INSERT OR IGNORE，source='imported-junior-pdf'）
用法: python scripts/import-junior-pdf.py
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = r"D:\BaiduNetdiskDownload\初中数学重点计算专项练习"
OUT_SQL = os.path.join(ROOT, "infra", "d1", "junior-pdf.sql")

# 文件名关键词 → jkp-XXXX（首个数字）
PDF_KP_MAP = [
    ("有理数", "jkp-0023"),
    ("绝对值", "jkp-0010"),
    ("整式加减", "jkp-0034"),
    ("整式乘法与因式分解", "jkp-0235"),
    ("一元一次方程", "jkp-0041"),
    ("不等式", "jkp-0131"),
    ("二元一次方程组", "jkp-0121"),
    ("相交线与平行线（上）", "jkp-0078"),
    ("相交线与平行线（下）", "jkp-0080"),
    ("线与角", "jkp-0059"),
    ("全等三角形中考", "jkp-0160"),
    ("全等三角形含辅助线", "jkp-0167"),
    ("勾股定理", "jkp-0268"),
    ("分式及分式方程", "jkp-0241"),
    ("二次根式", "jkp-0310"),
    ("一元二次方程常考", "jkp-0321"),
    ("一元二次方程大总结", "jkp-0321"),
    ("一次函数大综合", "jkp-0219"),
    ("一次函数", "jkp-0213"),
    ("反比例函数", "jkp-0265"),
    ("锐角三角函数", "jkp-0422"),
    ("二次函数核心必会", "jkp-0375"),
    ("二次函数", "jkp-0375"),
    ("四边形", "jkp-0278"),
    ("相似含辅助线", "jkp-0409"),
    ("相似三角形", "jkp-0409"),
    ("圆", "jkp-0344"),
]

# 乱码字替换（PDF 字体编码错位）
GARBAGE_MAP = {
    "癿": "的", "亍": "于", "斱": "方", "泟": "法", "濄": "过", "汄": "内",
    "圀": "圆", "刞": "列", "洏": "而", "沵": "式", "洄": "同", "沴": "次",
    "漤": "数", "溍": "般", "澅": "画", "灄": "设",
    "卖庖": "商铺", "迕": "进", "兊": "克", "庖": "铺", "幵": "并",
}

# 答案区标志：命中后其后的文本全部丢弃
ANSWER_MARKERS = ("参考答案与解析", "参考答案", "答案解析", "答案与解析", "参 考 答 案")


def map_kp(fname):
    for kw, kp in PDF_KP_MAP:
        if kw in fname:
            return kp
    return "jkp-0034"


def clean_text(text):
    # 答案区截断（防答案被切成题）
    for marker in ANSWER_MARKERS:
        idx = text.find(marker)
        if idx != -1:
            text = text[:idx]
            break
    for a, b in GARBAGE_MAP.items():
        text = text.replace(a, b)
    # 清理控制字符与异常空白
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    text = text.replace("\u3000", " ").replace("|", "")
    return text


def split_questions(text):
    """按题号切分：'数字．' 或 '数字.' 或 '数字、'；返回 [(题号, 内容)]"""
    # 行合并：孤立纯数字行（分数分子分母）与上一行粘连
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    merged = []
    for l in lines:
        if merged and re.fullmatch(r"\d+", l) and len(l) <= 3:
            merged[-1] += " " + l
        else:
            merged.append(l)
    block = "\n".join(merged)
    # 按行首题号切分（排除小数：后不跟数字）；题号一般独立在行首
    parts = re.split(r"(?m)(?:^|\n)\s*(\d{1,3})\s*[．.、](?!\d)", block)
    qs = []
    for i in range(1, len(parts) - 1, 2):
        no = int(parts[i])
        content = parts[i + 1].strip()
        if content and len(content) >= 5:
            qs.append((no, content))
    return qs


def main():
    import pymupdf
    all_rows = []
    seq = 0
    skipped = 0
    for fname in sorted(os.listdir(SRC_DIR)):
        if not fname.endswith(".pdf"):
            continue
        path = os.path.join(SRC_DIR, fname)
        try:
            doc = pymupdf.open(path)
        except Exception as e:
            print(f"打开失败 {fname}: {e}")
            continue
        full = []
        for i in range(doc.page_count):
            try:
                full.append(doc[i].get_text())
            except Exception:
                pass  # xref 报错页跳过
        text = clean_text("".join(full))
        qs = split_questions(text)
        kp = map_kp(fname)
        for no, content in qs:
            # 内容门槛：分数损坏（过短）/ 答案区 / 概念目录页 → 丢弃
            content = re.sub(r"\s+", " ", content).strip()
            if len(content) < 12 or len(content) > 500:
                skipped += 1
                continue
            if re.search(r"【答案】|【解析】|考点|知识点|答案：|^解[:：]", content):
                skipped += 1
                continue
            # 分数损坏特征：含大量孤立单数字（如 '2 2 1 2'）
            digits = re.findall(r"(?<!\d)\d(?!\d)", content)
            if len(digits) >= 6 and len(content) < 40:
                skipped += 1
                continue
            # 去题首残留题号
            content = re.sub(r"^\d{1,3}[．.、]\s*", "", content)
            if len(content) < 10:
                skipped += 1
                continue
            seq += 1
            qid = f"jpdf-{seq:05d}"
            content = content.replace("'", "''")
            all_rows.append(
                f"('{qid}','math','初中',0,'{kp}','short_answer',0.38,'{content}','','','','imported-junior-pdf','approved','通用','基础');"
            )
        print(f"{fname[:34]:36s} 提取 {len(qs)} 题")
    # 写 SQL
    with open(OUT_SQL, "w", encoding="utf-8") as f:
        f.write("-- 初中计算专项（27个PDF）\n")
        f.write("-- source='imported-junior-pdf'，level=基础，无答案（待人工批改）\n")
        for row in all_rows:
            f.write("INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version, level) VALUES " + row + "\n")
    print(f"\n共生成 {len(all_rows)} 题 → {OUT_SQL}  跳过 {skipped} 条")


if __name__ == "__main__":
    main()
