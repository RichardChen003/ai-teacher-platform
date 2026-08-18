# 高中各学期章节/知识点覆盖检查报告
# 对比：hs_knowledge_points（应有）vs questions 实际挂载（现有）
# 用法: python scripts/check-hs-coverage.py
import subprocess, json, re, sys, os
import importlib.util

_spec = importlib.util.spec_from_file_location(
    "hsd", os.path.join(os.path.dirname(os.path.abspath(__file__)), "hs-syllabus-data.py"))
_hsd = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_hsd)
CHAPTERS = _hsd.CHAPTERS

def d1(sql):
    r = subprocess.run(f"npx wrangler d1 execute ai-teacher-db --local --command \"{sql}\"",
                       capture_output=True, text=True, shell=True, encoding="utf-8")
    out = r.stdout + r.stderr
    m = re.search(r'"results":\s*(\[.*?\])\s*,\s*"success"', out, re.S)
    if not m:
        m = re.search(r'"results":\s*(\[.*?\])\s*\]', out, re.S)
    return json.loads(m.group(1)) if m else []

# 学期 → 章节
TERM_CHS = {}
for ch_no, ch_name, term, kps in CHAPTERS:
    TERM_CHS.setdefault(term, []).append((ch_no, ch_name, [f"hs-kp-{n:04d}" for n in range(1, 253) if False]))  # placeholder

# 实际：每题的知识点 → 统计
qs = d1("SELECT knowledge_point_id, COUNT(*) AS c FROM questions WHERE subject='math' AND stage='高中' AND review_status='approved' GROUP BY knowledge_point_id")
have = {q["knowledge_point_id"]: q["c"] for q in qs}

# 全 252 知识点清单（按章节）
ALL = []  # (no, ch_no, ch_name, term, kp_id, kp_name)
for ch_no, ch_name, term, kps in CHAPTERS:
    for k in kps:
        ALL.append((len(ALL) + 1, ch_no, ch_name, term, f"hs-kp-{len(ALL)+1:04d}", k))

# 输出报告
lines = []
lines.append("# 高中各学期章节·知识点覆盖检查报告")
lines.append(f"\n> 生成时间：{__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}")
lines.append(f"> 高中已标记题目：{sum(have.values())} 题，覆盖知识点：{sum(1 for k in have if k.startswith('hs-kp-'))} 个 / 252 个")
lines.append(f"> 高三上(17)/高三下(18)为复习：应覆盖全部 252 知识点（复用各学期题目）\n")

# 按学期
TERM_NAMES = {13: "高一上", 14: "高一下", 15: "高二上", 16: "高二下", 17: "高三上", 18: "高三下"}
term_items = {}
for no, ch_no, ch_name, term, kp_id, kp_name in ALL:
    term_items.setdefault(term, []).append((ch_no, ch_name, kp_id, kp_name))

for term in [13, 14, 15, 16]:
    items = term_items[term]
    lines.append(f"\n## {TERM_NAMES[term]}（第{''}学期）—— 应覆盖知识点 {len(items)} 个")
    # 章节聚合
    by_ch = {}
    for ch_no, ch_name, kp_id, kp_name in items:
        by_ch.setdefault((ch_no, ch_name), []).append((kp_id, kp_name))
    for (ch_no, ch_name), kps in by_ch.items():
        ch_ids = [k for k, _ in kps]
        have_ch = sum(1 for k in ch_ids if have.get(k, 0) > 0)
        lines.append(f"\n### 第{ch_no}章 {ch_name} —— 该章知识点 {len(kps)} 个，已有题目 {have_ch} 个")
        # 缺失知识点
        missing = [(k, n) for k, n in kps if have.get(k, 0) == 0]
        if missing:
            lines.append(f"**缺失 {len(missing)} 个知识点：**")
            for k, n in missing:
                lines.append(f"- {n}（{k}）")
        else:
            lines.append("全部知识点已有题目 ✅")

# 高三覆盖
lines.append("\n\n## 高三上（17）/ 高三下（18）复习覆盖")
hs_missing = [(k, n) for no, ch, cn, t, k, n in ALL if have.get(k, 0) == 0]
lines.append(f"- 高三复习应覆盖全部 252 知识点")
lines.append(f"- 当前已覆盖 {252 - len(hs_missing)} 个，缺失 {len(hs_missing)} 个")
if hs_missing:
    lines.append("\n**高三缺失知识点（需要补题）：**")
    for k, n in hs_missing:
        lines.append(f"- {n}（{k}）")

report = "\n".join(lines)
out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "高中知识点覆盖检查报告.md")
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    f.write(report)
print(report[:3000])
print(f"\n... 完整报告已写入: {out_path}")
