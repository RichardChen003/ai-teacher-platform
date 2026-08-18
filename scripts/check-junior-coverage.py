# 初中各学期章节/知识点覆盖检查报告（仿高中 check-hs-coverage）
import subprocess, json, re, os, importlib.util
from datetime import datetime

_spec = importlib.util.spec_from_file_location(
    "jsd", os.path.join(os.path.dirname(os.path.abspath(__file__)), "junior-syllabus-data.py"))
_hsd = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_hsd)
CHAPTERS = _hsd.JUNIOR_CHAPTERS

def d1(sql):
    r = subprocess.run(f"npx wrangler d1 execute ai-teacher-db --local --command \"{sql}\"",
                       capture_output=True, text=True, shell=True, encoding="utf-8")
    out = r.stdout + r.stderr
    m = re.search(r'"results":\s*(\[.*?\])\s*,\s*"success"', out, re.S)
    if not m: m = re.search(r'"results":\s*(\[.*?\])\s*\]', out, re.S)
    return json.loads(m.group(1)) if m else []

qs = d1("SELECT knowledge_point_id, COUNT(*) AS c FROM questions WHERE subject='math' AND stage='初中' AND review_status='approved' GROUP BY knowledge_point_id")
have = {q["knowledge_point_id"]: q["c"] for q in qs}

# 全 437 知识点
ALL = []  # (no, ch_no, ch_name, term, kp_id, kp_name)
for ch_no, ch_name, term, kps in CHAPTERS:
    for k in kps:
        ALL.append((len(ALL)+1, ch_no, ch_name, term, f"jkp-{len(ALL)+1:04d}", k))

TERM_NAMES = {7: "初一上(七年级上)", 8: "初一下(七年级下)", 9: "初二上(八年级上)", 10: "初二下(八年级下)", 11: "初三上(九年级上)", 12: "初三下(九年级下)"}
term_items = {}
for no, ch_no, ch_name, term, kp_id, kp_name in ALL:
    term_items.setdefault(term, []).append((ch_no, ch_name, kp_id, kp_name))

L = []
L.append("# 初中各学期章节·知识点覆盖检查报告")
L.append(f"\n> 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}")
L.append(f"> 初中已标记题目：{sum(have.values())} 题，覆盖知识点：{sum(1 for k in have if k.startswith('jkp-'))} 个 / 437 个")
L.append(f"> 初三上(11)/初三下(12)为复习：应覆盖之前所有学期（全部 437 知识点）\n")

for term in [7, 8, 9, 10, 11, 12]:
    items = term_items[term]
    L.append(f"\n## {TERM_NAMES[term]} —— 应覆盖知识点 {len(items)} 个")
    by_ch = {}
    for ch_no, ch_name, kp_id, kp_name in items:
        by_ch.setdefault((ch_no, ch_name), []).append((kp_id, kp_name))
    for (ch_no, ch_name), kps in by_ch.items():
        ch_ids = [k for k, _ in kps]
        have_ch = sum(1 for k in ch_ids if have.get(k, 0) > 0)
        L.append(f"\n### 第{ch_no}章 {ch_name} —— 该章知识点 {len(kps)} 个，已有题目 {have_ch} 个")
        missing = [(k, n) for k, n in kps if have.get(k, 0) == 0]
        if missing:
            L.append(f"**缺失 {len(missing)} 个知识点：**")
            for k, n in missing:
                L.append(f"- {n}（{k}）")
        else:
            L.append("全部知识点已有题目 ✅")

L.append("\n\n## 初三上（11）/ 初三下（12）复习覆盖（应含全部 437 知识点）")
j_missing = [(k, n) for no, ch, cn, t, k, n in ALL if have.get(k, 0) == 0]
L.append(f"- 当前已覆盖 {437 - len(j_missing)} 个，缺失 {len(j_missing)} 个")
if j_missing:
    L.append("\n**初三复习缺失知识点（需补题）：**")
    for k, n in j_missing:
        L.append(f"- {n}（{k}）")

report = "\n".join(L)
out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "初中知识点覆盖检查报告.md")
with open(out, "w", encoding="utf-8") as f:
    f.write(report)
print(report[:2000])
print(f"\n... 完整报告已写入: {out}")
