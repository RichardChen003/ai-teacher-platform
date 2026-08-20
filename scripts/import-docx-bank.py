# -*- coding: utf-8 -*-
"""
docx 分层题库导入器
- 解析 D 盘「2026新高考数学分层练1000题」33 个 docx（基础500/中档300/压轴200）
- 提取：题干（文本 + 公式图占位 [IMG:xxx]）、选项、答案（表格）、解析（【解析】段）
- 公式图：WMF → PNG（Pillow/GDI），存 apps/web/public/question-imgs/
- 知识点：按文件名章节 + 内容关键词映射到 hs-kp-XXXX
- 输出：infra/d1/imported-bank.sql（INSERT OR IGNORE，source='imported-docx'）
用法: python scripts/import-docx-bank.py [--limit N] [--only <文件夹关键词>]
"""
import os, re, sys, json, zipfile, struct, random
from lxml import etree
from PIL import Image
import io
import importlib.util
_spec = importlib.util.spec_from_file_location(
    "wg", os.path.join(os.path.dirname(os.path.abspath(__file__)), "wmf-gdi-render.py"))
wg = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(wg)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_BASE = r"D:\BaiduNetdiskDownload\2026新高考数学分层练1000题基础题中档题难题培优拔尖题"
IMG_DIR = os.path.join(ROOT, "apps", "web", "public", "question-imgs")
OUT_SQL = os.path.join(ROOT, "infra", "d1", "imported-bank.sql")

LEVELS = [
    ("基础", "高考数学基础通关500题", "basic"),
    ("中档", "高考数学中档提升300题", "mid"),
    ("压轴", "高考数学压轴拔尖200题", "hard"),
]

W_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
        "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
        "v": "urn:schemas-microsoft-com:vml"}


def parse_docx(path):
    """返回段落列表：每段为 [('t', text) | ('img', rId)] 序列"""
    z = zipfile.ZipFile(path)
    xml = z.read("word/document.xml")
    root = etree.fromstring(xml)
    rels_xml = z.read("word/_rels/document.xml.rels")
    rels = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', rels_xml.decode("utf-8")))
    # rId -> media 文件名
    media_map = {}
    for rid, tgt in rels.items():
        base = os.path.basename(tgt)
        if base and base not in media_map.values():
            media_map[rid] = base
    paras = []
    for p in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
        seq = []
        # 按顺序遍历段内节点（含嵌套 object/shape）
        def walk(node):
            for child in node:
                tag = etree.QName(child).localname
                if tag == "t":
                    seq.append(("t", child.text or ""))
                elif tag == "object":
                    # 公式对象：取 imagedata 的 r:id
                    rid = None
                    for im in child.iter("{urn:schemas-microsoft-com:vml}imagedata"):
                        rid = im.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id") or im.get("r:id")
                    if rid:
                        seq.append(("img", media_map.get(rid, rid)))
                    else:
                        walk(child)
                elif tag == "drawing":
                    # 普通图片
                    for blip in child.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}blip"):
                        rid = blip.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed")
                        if rid:
                            seq.append(("img", media_map.get(rid, rid)))
                    if not list(child.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}blip")):
                        walk(child)
                elif tag in ("r", "p"):
                    walk(child)
                # 其他标签忽略
        walk(p)
        paras.append(seq)
    return paras, z, media_map


def render_wmf(z, media_name, out_name, dpi=600):
    """公式/插图 -> PNG
    - wmf：Windows GDI 原生渲染（与 Word 同引擎，矢量高清），失败回退 Pillow
    - png/jpeg：几何插图直接复制原图（保持清晰）
    返回文件名；失败返回 None"""
    try:
        ext = media_name.lower().split(".")[-1]
        data = z.read("word/media/" + media_name)
        if ext == "wmf":
            img = wg.render_wmf_gdi(data, dpi)
            if img is None:
                # 回退 Pillow（保底）
                tmp = os.path.join(IMG_DIR, ".tmp.wmf")
                with open(tmp, "wb") as f:
                    f.write(data)
                im = Image.open(tmp)
                im.load()
                w, h = im.size
                img = im.resize((max(1, int(w * 3)), max(1, int(h * 3))), Image.LANCZOS)
            img.save(os.path.join(IMG_DIR, out_name), "PNG", optimize=True)
        else:
            # 原图直接复制（png/jpeg 等）
            with open(os.path.join(IMG_DIR, out_name), "wb") as f:
                f.write(data)
        return out_name
    except Exception as e:
        print(f"  [渲染失败] {media_name}: {e}")
        return None


def split_questions(paras):
    """段落序列 -> 题目列表 [{no, segments:[...], type}]（答案/解析区不并入题目）"""
    questions = []
    cur = None
    in_answers = False  # 进入答案区后不再并入任何题目
    for seq in paras:
        text = "".join(x[1] for x in seq if x[0] == "t").strip()
        m = re.match(r"^(\d+)[．.]\s*(.*)$", text)
        # 答案区开始标志（不限于数字开头）：文档末尾的《xx》参考答案 / 题号表 / 答案表
        if (
            "参考答案" in text
            or "答案表" in text
            or text.startswith("题号")
            or text.startswith("答案：")
            or re.match(r"^《[^》]+》\s*参考答案", text)
        ):
            if cur:
                questions.append(cur)
                cur = None
            in_answers = True
            continue
        if m and int(m.group(1)) <= 100:
            rest = m.group(2).strip()
            # 答案区形如 "14．B" / "15．C【分析】"：rest 以单个答案字母开头
            if re.match(r"^[A-D][．.]?\s*$", rest) or re.match(r"^[A-D]【", rest):
                if cur:
                    questions.append(cur)
                    cur = None
                in_answers = True
                continue
            if in_answers:
                continue
            # 新题开始
            no = int(m.group(1))
            if cur:
                questions.append(cur)
            cur = {"no": no, "segs": [seq], "text": text}
        elif cur is not None and not in_answers and not text.startswith("【"):
            # 若答案区标志与题干同段（如 "…最大值 .《直线与圆的方程》参考答案题号123…"），
            # 截断：只保留标志前的文本段（图片保留，未引用的稍后清理）
            cut = len(text)
            for marker in ("参考答案", "答案表"):
                idx = text.find(marker)
                if idx != -1:
                    cut = min(cut, idx)
            if cut < len(text):
                kept = []
                pos = 0
                for kind, val in seq:
                    if kind == "t":
                        if pos >= cut:
                            continue
                        seg_text = val[: max(0, cut - pos)]
                        if seg_text:
                            kept.append((kind, seg_text))
                        pos += len(val)
                    else:
                        kept.append((kind, val))
                cur["segs"].append(kept)
                questions.append(cur)
                cur = None
                in_answers = True
            else:
                cur["segs"].append(seq)
    if cur:
        questions.append(cur)
    return questions


def collect_answers(path):
    """从答案表格提取 {题号: 答案}（表格多行对：题号行/答案行交替）"""
    try:
        import docx
        d = docx.Document(path)
        ans = {}
        for t in d.tables:
            rows = t.rows
            for ri in range(0, len(rows) - 1, 2):
                if rows[ri].cells[0].text.strip() != "题号":
                    continue
                nums = [c.text.strip() for c in rows[ri].cells][1:]
                vals = [c.text.strip() for c in rows[ri + 1].cells][1:]
                for n, v in zip(nums, vals):
                    if n.isdigit() and v:
                        ans[int(n)] = v
        return ans
    except Exception:
        return {}


def extract_question(q, z, media_map, qid, answers):
    """题目段 -> {content, options, answer, analysis}"""
    # 1) 收集该题全部内容的流（文本与图片按顺序），并渲染图片
    stream = []
    img_no = 0
    for seg in q["segs"]:
        for kind, val in seg:
            if kind == "img":
                img_no += 1
                fname = f"{qid}-f{img_no}.png"
                if render_wmf(z, val, fname):
                    stream.append(f"[IMG:{fname}]")
                else:
                    stream.append("")
            else:
                stream.append(val)
    full_text = "".join(stream)
    full_text = re.sub(r"^\s*\d+[．.]\s*", "", full_text).strip()
    # 双保险：content 级剔除混入的答案区文本（"《xx》参考答案题号123…答案BCCB…"）
    for marker in ("参考答案", "答案表"):
        idx = full_text.find(marker)
        if idx != -1:
            full_text = full_text[:idx].rstrip(" ．.")
            break
    # 2) 按选项标记切分（选项可能同段 tab 分隔，也可能分多段）
    parts = re.split(r"(?=[A-D][．．.])", full_text)
    stem = parts[0]
    opts_raw = [p for p in parts[1:] if re.match(r"^[A-D][．．.]", p)]
    opt_objs = []
    for p in opts_raw:
        m = re.match(r"^([A-D])[．．.]\s*(.*)$", p, re.S)
        if m:
            opt_objs.append({"key": m.group(1), "text": m.group(2).strip()})
    # 3) 答案
    answer = answers.get(q["no"], "")
    # 4) 题干里去除非题干噪音
    return {
        "no": q["no"],
        "content": stem,
        "options": opt_objs,
        "answer": answer,
        "analysis": "",
    }


# ---------- 章节 → 知识点映射 ----------
KP_RULES = [
    # (章节关键词, 知识点范围[(start,end)], 细化关键词表 {关键词: kp序号})
    ("集合", [(1, 14)], {"交": 4, "并": 4, "补": 4, "子集": 3, "真子集": 3, "空集": 9,
                          "充分": 11, "必要": 11, "充要": 6, "命题": 14, "全称": 12, "存在": 13, "量词": 12, "否定": 5}),
    ("复数", [(88, 96)], {"虚部": 95, "实部": 95, "共轭": 90, "模": 89, "象限": 93, "平面内": 93,
                           "方程": 94, "相等": 94, "运算": 92, "四则": 92, "i": 88}),
    ("向量", [(73, 87)], {"数量积": 77, "夹角": 80, "垂直": 76, "平行": 75, "共线": 82,
                           "投影": 79, "模": 78, "单位向量": 81, "三角形": 86, "正弦": 84, "余弦": 85, "面积": 86}),
    ("不等式", [(15, 30)], {"均值": 18, "基本不等式": 18, "一元二次": 26, "恒成立": 27, "存在": 28,
                             "性质": 16, "二次函数": 29, "根与系数": 24, "判别式": 26, "最大值": 21, "最小值": 21, "最值": 21}),
    ("函数与导数", [(31, 62)], {"定义域": 31, "单调": 33, "奇偶": 39, "偶函数": 39, "奇函数": 40,
                                 "周期": 45, "对称": 46, "零点": 57, "二分": 62, "指数": 50, "对数": 53,
                                 "换底": 54, "幂函数": 56, "图像": 36, "值域": 31}),
    ("导数", [(199, 212)], {"切线": 200, "斜率": 200, "单调": 206, "极值": 207, "求导": 201,
                             "复合": 203, "恒成立": 211, "存在性": 212, "构造": 208, "放缩": 210}),
    ("三角函数", [(63, 72)], {"弧度": 63, "扇形": 64, "sin": 65, "cos": 65, "tan": 65,
                               "诱导": 68, "周期": 69, "图像变换": 70, "倍角": 71, "辅助角": 71, "求值": 72}),
    ("解三角形", [(84, 87)], {"正弦": 84, "余弦": 85, "面积": 86, "角": 87}),
    ("数列", [(187, 198)], {"等差": 188, "等比": 189, "前n项和": 190, "通项": 187, "Sn": 187,
                             "错位相减": 195, "裂项": 196, "累加": 197, "累乘": 198, "中项": 192}),
    ("立体几何", [(97, 114)], {"平行": 100, "垂直": 103, "角": 106, "二面角": 108, "距离": 109,
                                "表面积": 110, "体积": 111, "三视图": 98, "斜二测": 97}),
    ("空间向量", [(139, 156)], {"法向量": 145, "线面角": 148, "二面角": 149, "距离": 150,
                                 "坐标": 153, "数量积": 142, "共面": 139}),
    ("直线与圆", [(157, 171)], {"斜率": 157, "倾斜角": 157, "平行": 160, "垂直": 160, "距离": 161,
                                 "圆": 163, "弦长": 164, "切线": 165, "位置关系": 166, "轨迹": 171, "最值": 170}),
    ("圆锥曲线", [(172, 186)], {"椭圆": 172, "双曲线": 172, "抛物线": 172, "离心率": 174, "渐近线": 175,
                                 "通径": 177, "焦点": 178, "焦半径": 179, "弦长": 184, "切线": 185, "点差法": 185}),
    ("解析几何", [(172, 186)], {"椭圆": 172, "双曲线": 172, "抛物线": 172, "离心率": 174, "弦": 184}),
    ("计数", [(213, 224)], {"排列": 215, "组合": 216, "二项式": 221, "通项": 222, "分类": 213, "分步": 214,
                             "捆绑": 220, "插空": 220, "隔板": 220}),
    ("统计", [(115, 126)], {"抽样": 115, "直方图": 116, "平均数": 117, "中位数": 117, "众数": 117,
                             "方差": 120, "标准差": 120, "百分位": 118}),
    ("概率", [(127, 138)], {"古典概型": 127, "互斥": 128, "对立": 129, "独立": 130, "乘法公式": 131,
                             "频率": 135, "样本空间": 134}),
    ("随机变量", [(225, 238)], {"分布列": 225, "条件概率": 226, "期望": 229, "方差": 230, "二项分布": 232,
                                 "超几何": 234, "正态": 236, "3σ": 238}),
    ("成对数据", [(239, 252)], {"相关": 239, "相关系数": 241, "回归": 243, "残差": 246, "卡方": 251,
                                 "独立性检验": 252, "列联表": 250}),
]


def map_knowledge_point(docx_name, content):
    """按章节 + 关键词映射到 hs-kp-XXXX；返回 (kp_id, kp_name) 或 None"""
    for keyword, ranges, detail in KP_RULES:
        if keyword not in docx_name and not (keyword == "解三角形" and "三角形" in docx_name):
            continue
        # 先按内容关键词细化
        for kw, no in detail.items():
            if kw in content:
                return f"hs-kp-{no:04d}"
        # 兜底：挂该章节第一个知识点
        start = ranges[0][0]
        return f"hs-kp-{start:04d}"
    return None


def main():
    args = sys.argv[1:]
    only = None
    for a in args:
        if a.startswith("--only="):
            only = a.split("=")[1]
    os.makedirs(IMG_DIR, exist_ok=True)
    random.seed(20260820)
    all_rows = []
    seq = 0
    for level, folder, lv_key in LEVELS:
        folder_path = os.path.join(SRC_BASE, folder)
        if not os.path.isdir(folder_path):
            print(f"跳过（不存在）: {folder_path}")
            continue
        for fname in sorted(os.listdir(folder_path)):
            if not fname.endswith(".docx"):
                continue
            if only and only not in fname:
                continue
            path = os.path.join(folder_path, fname)
            print(f"[{level}] {fname}")
            try:
                paras, z, media_map = parse_docx(path)
                answers = collect_answers(path)
                questions = split_questions(paras)
                for q in questions:
                    seq += 1
                    qid = f"imp-{lv_key}-{seq:04d}"
                    data = extract_question(q, z, media_map, qid, answers)
                    if not data["content"] or len(data["content"]) < 8:
                        continue
                    # 关键词匹配时把选项文本也纳入（题干公式多为图片，选项文本更全）
                    opt_text = " ".join(o["text"] for o in data["options"])
                    kp = map_knowledge_point(fname, data["content"] + " " + opt_text)
                    if not kp:
                        continue
                    # difficulty：按档随机
                    if level == "基础":
                        diff = round(random.uniform(0.3, 0.45), 2)
                    elif level == "中档":
                        diff = round(random.uniform(0.5, 0.65), 2)
                    else:
                        diff = round(random.uniform(0.7, 0.85), 2)
                    opts = json.dumps(data["options"], ensure_ascii=False) if data["options"] else ""
                    qtype = "single_choice" if data["options"] else "short_answer"
                    content = data["content"].replace("'", "''")
                    analysis = data["analysis"].replace("'", "''")
                    all_rows.append(
                        f"('{qid}','math','高中',0,'{kp}','{qtype}',{diff},'{content}','{opts.replace(chr(39), chr(39)+chr(39))}','{data['answer']}','{analysis}','imported-docx','approved','通用','{level}');"
                    )
            except Exception as e:
                print(f"  [解析失败] {fname}: {e}")
    # 写 SQL
    header = (
        "-- 分层题库导入（2026新高考数学分层练1000题）\n"
        "-- source='imported-docx'，含 [IMG:xxx] 公式图片占位，图片位于 apps/web/public/question-imgs/\n"
        "INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version, level) VALUES\n"
    )
    with open(OUT_SQL, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("\n".join(all_rows))
        f.write("\n")
    print(f"\n共生成 {len(all_rows)} 题 → {OUT_SQL}")
    print(f"图片目录: {IMG_DIR}（{len(os.listdir(IMG_DIR))} 个文件）")


if __name__ == "__main__":
    main()
