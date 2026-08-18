# 现有高中题目 → 252 具体知识点 内容识别映射
# 读取 questions 表（含 content），按关键词规则映射到 kp-hs-XXXX，生成 UPDATE
import subprocess, json, re, sys

DB = "ai-teacher-db"

def d1(sql):
    r = subprocess.run(f"npx wrangler d1 execute {DB} --local --command \"{sql}\"",
                       capture_output=True, text=True, shell=True, encoding="utf-8")
    out = r.stdout + r.stderr
    # 提取 JSON results
    m = re.search(r'"results":\s*(\[.*?\])\s*,\s*"success"', out, re.S)
    if not m:
        m = re.search(r'"results":\s*(\[.*?\])\s*\]', out, re.S)
    if not m:
        return []
    try:
        return json.loads(m.group(1))
    except Exception:
        return []

# ---------- 映射规则：内容关键词 → 具体知识点 no ----------
# 按优先级从高到低匹配（先匹配更具体的）
RULES = [
    # 第1章 集合 (1-14)
    (r"A∩B|交集|并集", 4),                      # 集合的交并补
    (r"命题.{0,6}真假|真假命题", 14),             # 命题真假判断
    (r"否命题|逆命题|充要", 11),                  # 充分条件、必要条件判断
    (r"含.{0,4}集合|真子集|子集个数", 2),          # 有限数集子集个数
    # 第3章 函数 (31-48)
    (r"定义域", 31),                             # 具体函数的定义域
    (r"奇函数.{0,10}单调|偶函数.{0,10}单调|单调递增", 33),  # 单调性
    (r"奇函数", 40),                             # 奇函数特性
    (r"偶函数", 41),                             # 偶函数特性
    # 第4章 指数对数 (49-62)
    (r"log₂|log2|log₃|lg|ln", 53),               # 对数运算
    (r"2\^x|3\^x|指数运算", 50),                  # 指数运算
    (r"零点", 57),                               # 函数的零点
    # 第5章 三角函数 (63-72)
    (r"sin|cos|tan", 65),                        # 三角函数定义
    (r"周期", 69),                               # 图像性质
    # 第6章 平面向量 (73-87)
    (r"a\+b|向量加", 73),                        # 向量加法法则
    (r"a·b|数量积|点积", 77),                    # 向量数量积公式
    (r"\|a\+b\||模长", 78),                      # 向量模长公式
    # 第7章 复数 (88-96)
    (r"虚部|复数|i", 92),                        # 复数四则运算
    # 第11章 空间向量 (139-156)
    (r"空间向量|a=\([0-9],[0-9],[0-9]", 142),    # 空间向量数量积
    # 第13章 圆锥曲线 (172-186)
    (r"椭圆", 173),                              # 标准方程
    (r"双曲线", 173),
    (r"抛物线", 173),
    # 第14章 数列 (187-198)
    (r"等差数列", 188),                          # 等差数列通项
    (r"等比数列|公比", 189),                     # 等比数列通项
    (r"前 \d 项和|前4项和|S₄|S₅|Sₙ", 190),       # 前n项和
    # 第15章 导数 (199-212)
    (r"切线斜率|切线", 200),                      # 导数几何意义
    (r"导函数|求导|f′|f''", 201),                # 基本初等函数导数公式
    # 第16章 计数原理 (213-224)
    (r"种选法|选出|C\(|组合", 216),              # 组合数公式
    (r"排列|P\(|书架上", 215),                   # 排列数公式
    # 第17章 随机变量 (225-238)
    (r"E\(X\)|期望|分布列", 229),                # 期望
    # 第10章 概率 (127-138)
    (r"概率|P\(|随机取", 127),                   # 古典概型
    # 第9章 统计 (115-126)
    (r"样本|平均数|方差|标准差|中位数|众数", 117), # 样本平均数等
    # 第18章 成对数据 (239-252)
    (r"相关|回归|残差|χ²|卡方|列联表", 241),      # 线性相关系数
]

def map_kp(content):
    for pat, no in RULES:
        if re.search(pat, content):
            return f"kp-hs-{no:04d}"
    return None  # 无法识别

# 拉取所有高中题
rows = d1("SELECT id, content FROM questions WHERE subject='math' AND stage='高中'")
print(f"高中题目总数: {len(rows)}")

# 统计
mapped = {}; unmapped = []
for r in rows:
    kp = map_kp(r["content"])
    if kp:
        mapped.setdefault(kp, []).append(r["id"])
    else:
        unmapped.append(r["id"])

print(f"已映射: {sum(len(v) for v in mapped.values())} 题, 覆盖知识点 {len(mapped)} 个")
print(f"未映射: {len(unmapped)} 题")
if unmapped[:10]:
    sample = d1(f"SELECT id, content FROM questions WHERE id IN ({','.join('?'*0) or '1'})")  # noop
    for uid in unmapped[:8]:
        s = d1(f"SELECT content FROM questions WHERE id='{uid}'")
        print(f"  {uid}: {s[0]['content'][:60] if s else '?'}")

# 输出映射结果供后续 UPDATE（写文件）
with open(r"C:\Users\Richard chen\Desktop\ai-teacher-platform\.workbuddy\hs-mapping.json", "w", encoding="utf-8") as f:
    json.dump({kp: ids for kp, ids in mapped.items()}, f, ensure_ascii=False)
print("\n映射结果已保存 .workbuddy/hs-mapping.json")
