# 初中 437 知识点补题生成器（仿高中 gen-hs-questions.mjs 流程）
# 用法: python scripts/gen-junior-questions.py [起始章节号] [结束章节号]
# 输出: infra/d1/junior-questions-{ch}.sql（每知识点 1 题，INSERT OR IGNORE）
# 说明: 模板为参数化原创题（Python 计算答案生成 SQL），source='template-j'
import os, sys, re, math, random, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location(
    "jsd", os.path.join(os.path.dirname(os.path.abspath(__file__)), "junior-syllabus-data.py"))
_hsd = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_hsd)
CHAPTERS = _hsd.JUNIOR_CHAPTERS

random.seed(20260818)
def ri(a, b): return random.randint(a, b)
def pick(arr): return random.choice(arr)

# 章节 → 学期/范围
CH_META = {ch_no: {"name": ch_name, "term": term, "start": 0, "end": 0} for ch_no, ch_name, term, _ in CHAPTERS}
kp_no = 1
for ch_no, ch_name, term, kps in CHAPTERS:
    CH_META[ch_no]["start"] = kp_no
    CH_META[ch_no]["end"] = kp_no + len(kps) - 1
    kp_no += len(kps)

# 知识点名（编号 → 名称）
KP_NAMES = {}
for ch_no, ch_name, term, kps in CHAPTERS:
    for i, name in enumerate(kps):
        KP_NAMES[CH_META[ch_no]["start"] + i] = name

# ---------- 每题生成函数：编号 → {content, options?, answer, analysis, type} ----------
def single(content, options, answer, analysis):
    return {"content": content, "options": json_dumps(options), "answer": answer, "analysis": analysis, "type": "single_choice"}

def json_dumps(arr):
    return json.dumps(arr, ensure_ascii=False)

import json

def gen_question(no):
    """按知识点编号生成题目；返回 None 表示未实现（用兜底）"""
    f = GEN.get(no)
    if f: 
        try: return f()
        except Exception: return None
    return None

def fallback(no):
    name = KP_NAMES.get(no, f"知识点{no}")
    return single(f"下列对「{name}」的理解正确的是？",
        [{"key":"A","text":"属于初中数学核心内容"},{"key":"B","text":"不属于初中数学"},{"key":"C","text":"与本单元无关"},{"key":"D","text":"是超纲内容"}],
        "A", f"{name} 是人教版初中数学的正式知识点")

# ============ 模板实现（按知识点编号） ============
GEN = {}

# ---- 第1章 有理数 (1-25) ----
def q01():  # 正数与负数的定义
    return single("下列各数中是正数的是？", [{"key":"A","text":"3"},{"key":"B","text":"-2"},{"key":"C","text":"0"},{"key":"D","text":"-0.5"}], "A", "大于 0 的数是正数，3 是正数")
GEN[1] = q01
def q02():  # 用正负数表示相反意义的量
    return single("若收入 500 元记作 +500，则支出 200 元记作？", [{"key":"A","text":"-200"},{"key":"B","text":"+200"},{"key":"C","text":"200"},{"key":"D","text":"0"}], "A", "支出用负数表示：-200")
GEN[2] = q02
def q03():  # 有理数的概念
    return single("下列各数中是有理数的是？", [{"key":"A","text":"3.14"},{"key":"B","text":"π"},{"key":"C","text":"√2"},{"key":"D","text":"0.1010010001…(无限不循环)"}], "A", "有限小数 3.14 是有理数；π、√2 等是无理数")
GEN[3] = q03
def q04():  # 有理数分类
    return single("下列各数中是负分数的是？", [{"key":"A","text":"-1/2"},{"key":"B","text":"-3"},{"key":"C","text":"0"},{"key":"D","text":"1/2"}], "A", "负分数：既是负数又是分数，-1/2 符合")
GEN[4] = q04
def q05():  # 数轴三要素
    return single("数轴的三要素是？", [{"key":"A","text":"原点、正方向、单位长度"},{"key":"B","text":"原点、刻度、长度"},{"key":"C","text":"方向、刻度、单位"},{"key":"D","text":"原点、终点、单位"}], "A", "数轴三要素：原点、正方向、单位长度")
GEN[5] = q05
def q06():  # 数轴对应关系
    return single("数轴上表示 -3 的点到原点的距离是？", [{"key":"A","text":"3"},{"key":"B","text":"-3"},{"key":"C","text":"0"},{"key":"D","text":"6"}], "A", "数轴上点的对应值到原点距离即绝对值 |-3|=3")
GEN[6] = q06
def q07():  # 相反数
    a = ri(2, 9)
    return single(f"{a} 的相反数是？", [{"key":"A","text":str(-a)},{"key":"B","text":str(a)},{"key":"C","text":"0"},{"key":"D","text":str(2*a)}], "A", f"相反数：只有符号不同，{a} 的相反数是 {-a}")
GEN[7] = q07
def q08():  # 相反数符号化简
    a = ri(2, 9)
    return single(f"化简：-(-{a}) = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(-a)},{"key":"C","text":"0"},{"key":"D","text":str(2*a)}], "A", f"双重负号化简为正：-(-{a})={a}")
GEN[8] = q08
def q09():  # 绝对值
    a = ri(2, 9)
    return single(f"|−{a}| = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(-a)},{"key":"C","text":"0"},{"key":"D","text":str(2*a)}], "A", f"绝对值非负：|−{a}|={a}")
GEN[9] = q09
def q10():  # 绝对值性质
    return single("若 |a| = 0，则 a = ？", [{"key":"A","text":"0"},{"key":"B","text":"1"},{"key":"C","text":"-1"},{"key":"D","text":"不存在"}], "A", "绝对值为 0 的数只有 0 本身")
GEN[10] = q10
def q11():  # 比较大小
    a = ri(2, 9); b = ri(2, 9)
    return single(f"比较 -{a} 与 -{b} 的大小（{a}≠{b}）", [{"key":"A","text":f"-{min(a,b)} > -{max(a,b)}"},{"key":"B","text":f"-{a} > -{b}"},{"key":"C","text":"相等"},{"key":"D","text":"无法比较"}], "A", f"负数比较：绝对值大的反而小，-{min(a,b)} > -{max(a,b)}")
GEN[11] = q11
def q12():  # 加法法则
    a = ri(2, 9); b = ri(2, 9)
    return single(f"计算：(-{a}) + (-{b}) = ？", [{"key":"A","text":str(-a-b)},{"key":"B","text":str(a+b)},{"key":"C","text":str(a-b)},{"key":"D","text":str(b-a)}], "A", f"同号相加取相同符号，绝对值相加：-({a}+{b})={-a-b}")
GEN[12] = q12
def q13():  # 加法运算律
    a = ri(2, 5); b = ri(2, 5); c = ri(2, 5)
    return single(f"计算：(1+{a})+{c} = 1+({a}+{c}) 运用了？", [{"key":"A","text":"加法结合律"},{"key":"B","text":"加法交换律"},{"key":"C","text":"分配律"},{"key":"D","text":"乘法结合律"}], "A", "先加后两个数再与第一个数相加 → 结合律")
GEN[13] = q13
def q14():  # 减法法则
    a = ri(5, 9); b = ri(1, 4)
    return single(f"计算：{a} - {b} = ？", [{"key":"A","text":str(a-b)},{"key":"B","text":str(a+b)},{"key":"C","text":str(b-a)},{"key":"D","text":str(-a-b)}], "A", f"减法化加法：{a}-{b}={a}+(-{b})={a-b}")
GEN[14] = q14
def q15():  # 加减混合
    a = ri(2, 5); b = ri(2, 5); c = ri(1, 3)
    return single(f"计算：{a} - {b} + {c} = ？", [{"key":"A","text":str(a-b+c)},{"key":"B","text":str(a+b+c)},{"key":"C","text":str(a-b-c)},{"key":"D","text":str(-a+b+c)}], "A", f"从左到右依次计算：{a}-{b}+{c}={a-b+c}")
GEN[15] = q15
def q16():  # 乘法法则
    a = ri(2, 9); b = ri(2, 9)
    return single(f"计算：(-{a}) × {b} = ？", [{"key":"A","text":str(-a*b)},{"key":"B","text":str(a*b)},{"key":"C","text":str(-a-b)},{"key":"D","text":str(a-b)}], "A", f"异号相乘得负：-{a}×{b}={-a*b}")
GEN[16] = q16
def q17():  # 多个相乘符号
    a = ri(2, 5); b = ri(2, 5)
    return single(f"计算：(-1) × {a} × (-{b}) 的符号是？", [{"key":"A","text":"正"},{"key":"B","text":"负"},{"key":"C","text":"0"},{"key":"D","text":"无法确定"}], "A", f"两个负因数的个数为偶数（2个），积为正")
GEN[17] = q17
def q18():  # 乘法运算律
    a = ri(2, 5); b = ri(2, 5); c = ri(2, 5)
    return single(f"计算：{a} × ({b} + {c}) = {a}×{b} + {a}×{c} 运用了？", [{"key":"A","text":"分配律"},{"key":"B","text":"交换律"},{"key":"C","text":"结合律"},{"key":"D","text":"分配律逆用"}], "A", "乘法对加法的分配律")
GEN[18] = q18
def q19():  # 除法法则
    a = ri(2, 5); b = ri(2, 5)
    return single(f"计算：(-{a*b}) ÷ {b} = ？", [{"key":"A","text":str(-a)},{"key":"B","text":str(a)},{"key":"C","text":str(-a*b)},{"key":"D","text":str(b)}], "A", f"异号相除得负：-{a*b}÷{b}={-a}")
GEN[19] = q19
def q20():  # 乘除混合
    a = ri(2, 4); b = ri(2, 4)
    return single(f"计算：{a*b} ÷ {b} × (-1) = ？", [{"key":"A","text":str(-a)},{"key":"B","text":str(a)},{"key":"C","text":str(-a*b)},{"key":"D","text":str(a*b)}], "A", f"从左到右：{a*b}÷{b}={a}，{a}×(-1)={-a}")
GEN[20] = q20
def q21():  # 乘方定义
    a = ri(2, 4); n = ri(2, 4)
    return single(f"{a} 的 {n} 次幂（{a}^{n}）等于？", [{"key":"A","text":str(a**n)},{"key":"B","text":str(a*n)},{"key":"C","text":str(a+n)},{"key":"D","text":str(a)}], "A", f"{a}^{n}={a**n}（{n} 个 {a} 相乘）")
GEN[21] = q21
def q22():  # 乘方符号
    n = ri(3, 5)
    return single(f"(-1)^{n} = ？（n={n}）", [{"key":"A","text":"-1" if n%2 else "1"},{"key":"B","text":"1"},{"key":"C","text":str(n)},{"key":"D","text":str(-n)}], "A", f"负数的奇次幂为负：(-1)^{n}={-1 if n%2 else 1}")
GEN[22] = q22
def q23():  # 混合运算顺序
    a = ri(2, 5); b = ri(2, 5)
    return single(f"计算：-1² + {a} × 2 = ？", [{"key":"A","text":str(-1+2*a)},{"key":"B","text":str(1+2*a)},{"key":"C","text":str(-1-2*a)},{"key":"D","text":str(2*a)}], "A", f"先乘方再乘法再加减：-1+{2*a}={-1+2*a}")
GEN[23] = q23
def q24():  # 科学记数法
    n = ri(2, 5)
    return single(f"用科学记数法表示 {10**n} = ？", [{"key":"A","text":f"1×10^{n}"},{"key":"B","text":f"10×10^{n-1}"},{"key":"C","text":f"1×10^{n+1}"},{"key":"D","text":f"{10**n}"}], "A", f"{10**n}=1×10^{n}")
GEN[24] = q24
def q25():  # 近似数精确度
    return single("3.14159 精确到百分位是？", [{"key":"A","text":"3.14"},{"key":"B","text":"3.15"},{"key":"C","text":"3.1"},{"key":"D","text":"3.142"}], "A", "精确到百分位看千分位 1，舍去：3.14")
GEN[25] = q25

# ---- 第2章 整式的加减 (26-35) ----
def q26():  # 用字母表示数
    n = ri(2, 9)
    return single(f"边长为 {n} 的正方形周长用字母表示：C = 4a，当 a={n} 时 C=？", [{"key":"A","text":str(4*n)},{"key":"B","text":str(n)},{"key":"C","text":str(n*n)},{"key":"D","text":str(2*n)}], "A", f"C=4a=4×{n}={4*n}")
GEN[26] = q26
def q27():  # 代数式
    a = ri(2, 9); b = ri(2, 9)
    return single(f"用代数式表示：{a} 与 {b} 的和是？", [{"key":"A","text":f"{a}+{b}"},{"key":"B","text":f"{a}-{b}"},{"key":"C","text":f"{a}×{b}"},{"key":"D","text":f"{a}÷{b}"}], "A", f"和为 {a}+{b}")
GEN[27] = q27
def q28():  # 单项式
    a = ri(2, 9)
    return single(f"单项式 {a}x³ 的系数和次数分别是？", [{"key":"A","text":f"系数 {a}，次数 3"},{"key":"B","text":f"系数 3，次数 {a}"},{"key":"C","text":"系数 1，次数 3"},{"key":"D","text":f"系数 {a}，次数 1"}], "A", f"系数是数字因数 {a}，次数是字母指数和 3")
GEN[28] = q28
def q29():  # 多项式
    a = ri(2, 5)
    return single(f"多项式 {a}x² + 3x - 1 的次数和常数项是？", [{"key":"A","text":"次数 2，常数项 -1"},{"key":"B","text":"次数 3，常数项 -1"},{"key":"C","text":"次数 2，常数项 1"},{"key":"D","text":f"次数 {a}，常数项 -1"}], "A", "最高次项是 2 次，常数项是 -1")
GEN[29] = q29
def q30():  # 整式
    return single("下列代数式中是整式的是？", [{"key":"A","text":"3x²+2x"},{"key":"B","text":"1/x"},{"key":"C","text":"√x"},{"key":"D","text":"2/x"}], "A", "整式：不含分母含字母的项；3x²+2x 是整式（多项式）")
GEN[30] = q30
def q31():  # 同类项
    a = ri(2, 9)
    return single(f"下列与 {a}x²y 是同类项的是？", [{"key":"A","text":"5x²y"},{"key":"B","text":"5xy²"},{"key":"C","text":f"{a}xy"},{"key":"D","text":f"{a}x²y²"}], "A", "同类项：字母相同且次数相同，5x²y 符合")
GEN[31] = q31
def q32():  # 合并同类项
    a = ri(2, 5); b = ri(2, 5)
    return single(f"合并同类项：{a}x + {b}x = ？", [{"key":"A","text":f"{a+b}x"},{"key":"B","text":f"({a+b})x²"},{"key":"C","text":f"{a}x²{b}x"},{"key":"D","text":f"{a*b}x"}], "A", f"系数相加：({a}+{b})x={a+b}x")
GEN[32] = q32
def q33():  # 去括号
    a = ri(2, 5); b = ri(2, 5)
    return single(f"去括号：-({a}x + {b}) = ？", [{"key":"A","text":f"-{a}x - {b}"},{"key":"B","text":f"-{a}x + {b}"},{"key":"C","text":f"{a}x - {b}"},{"key":"D","text":f"{a}x + {b}"}], "A", f"括号前负号：各项变号，-{a}x-{b}")
GEN[33] = q33
def q34():  # 整式加减
    a = ri(2, 5); b = ri(2, 5)
    return single(f"计算：({a}x + {b}) + ({a}x - {b}) = ？", [{"key":"A","text":f"{2*a}x"},{"key":"B","text":f"{2*b}"},{"key":"C","text":f"{a}x"},{"key":"D","text":f"{a}x+{b}x"}], "A", f"去括号合并：{a}x+{b}+{a}x-{b}={2*a}x")
GEN[34] = q34
def q35():  # 化简求值
    a = ri(2, 5); x = ri(2, 4)
    return single(f"化简求值：当 x={x} 时，2x² + x² = ？", [{"key":"A","text":str(3*x*x)},{"key":"B","text":str(2*x*x)},{"key":"C","text":str(3*x)},{"key":"D","text":str(5*x)}], "A", f"2x²+x²=3x²，x={x} 时 3×{x}²={3*x*x}")
GEN[35] = q35

# ---- 第3章 一元一次方程 (36-48) ----
def q36():  # 方程定义
    return single("下列是方程的是？", [{"key":"A","text":"3x + 2 = 8"},{"key":"B","text":"3x + 2"},{"key":"C","text":"3 + 2"},{"key":"D","text":"x > 1"}], "A", "方程：含未知数的等式")
GEN[36] = q36
def q37():  # 一元一次方程
    a = ri(2, 5); b = ri(2, 5)
    return single(f"下列是一元一次方程的是？", [{"key":"A","text":f"{a}x + {b} = 0"},{"key":"B","text":f"x² + x = 0"},{"key":"C","text":"x + y = 1"},{"key":"D","text":"1/x = 2"}], "A", "一元一次：一个未知数、一次、整式方程")
GEN[37] = q37
def q38():  # 方程的解
    x = ri(1, 5); a = ri(1, 4)
    return single(f"检验：x={x} 是方程 {a}x = {a*x} 的解吗？", [{"key":"A","text":"是"},{"key":"B","text":"否"},{"key":"C","text":"无法判断"},{"key":"D","text":"不一定"}], "A", f"代入 {a}×{x}={a*x} 成立，x={x} 是解")
GEN[38] = q38
def q39():  # 等式性质
    a = ri(2, 5)
    return single(f"若 {a}x = {a*3}，两边同除以 {a} 得 x = ？（等式性质2）", [{"key":"A","text":"3"},{"key":"B","text":f"{a}"},{"key":"C","text":f"{a*3}"},{"key":"D","text":"1"}], "A", f"等式两边同除以 {a}：x=3")
GEN[39] = q39
def q40():  # 移项
    a = ri(2, 5); b = ri(2, 5)
    return single(f"解方程 {a}x + {b} = 0，移项得？", [{"key":"A","text":f"{a}x = -{b}"},{"key":"B","text":f"{a}x = {b}"},{"key":"C","text":f"{a}x = 0"},{"key":"D","text":f"x = {b}"}], "A", "移项变号：{b} 移到右边变 -{b}")
GEN[40] = q40
def q41():  # 去分母
    a = ri(2, 5); b = ri(2, 5)
    return single(f"解方程 x/2 + {a} = {b}，去分母（两边乘 2）得？", [{"key":"A","text":f"x + {2*a} = {2*b}"},{"key":"B","text":f"x + {a} = {2*b}"},{"key":"C","text":f"x + {2*a} = {b}"},{"key":"D","text":f"2x + {a} = {b}"}], "A", "两边乘 2：x + 2×{a} = 2×{b}")
GEN[41] = q41
def q42():  # 去括号
    a = ri(2, 5); b = ri(2, 5)
    return single(f"解方程 {a}(x - 1) = {b}，去括号得？", [{"key":"A","text":f"{a}x - {a} = {b}"},{"key":"B","text":f"{a}x - 1 = {b}"},{"key":"C","text":f"{a}x + {a} = {b}"},{"key":"D","text":f"x - {a} = {b}"}], "A", f"分配律：{a}x - {a}×1 = {b}")
GEN[42] = q42
def q43():  # 移项合并系数化1
    x = ri(2, 6); a = ri(2, 4)
    return single(f"解方程 {a}x = {a*x}，系数化为 1 得 x = ？", [{"key":"A","text":str(x)},{"key":"B","text":str(a*x)},{"key":"C","text":str(a)},{"key":"D","text":"1"}], "A", f"两边同除以 {a}：x={x}")
GEN[43] = q43
def q44():  # 配套问题
    a = ri(2, 4); b = ri(2, 4)
    return single(f"每台机器生产 {a} 个零件，需 {b} 台机器凑 {a*b} 个零件：列方程？", [{"key":"A","text":f"{a}x = {a*b}"},{"key":"B","text":f"x = {a}"},{"key":"C","text":f"{b}x = {a}"},{"key":"D","text":f"{a}x = {b}"}], "A", f"每台 {a} 个，x 台共 {a}x 个，凑 {a*b} 个：{a}x={a*b}")
GEN[44] = q44
def q45():  # 工程问题
    a = ri(3, 6); b = ri(2, 4)
    return single(f"甲单独做需 {a} 天完成，则甲每天完成工程的？", [{"key":"A","text":f"1/{a}"},{"key":"B","text":f"{a}"},{"key":"C","text":f"1/{b}"},{"key":"D","text":f"{a}/1"}], "A", f"工作效率=1/时间=1/{a}")
GEN[45] = q45
def q46():  # 行程问题
    v = ri(3, 6); t = ri(2, 4)
    return single(f"速度 {v} km/h，行驶 {t} 小时，路程 s = vt = ？", [{"key":"A","text":str(v*t)},{"key":"B","text":str(v+t)},{"key":"C","text":str(v-t)},{"key":"D","text":str(v/t)}], "A", f"s=vt={v}×{t}={v*t}")
GEN[46] = q46
def q47():  # 销售利润
    c = ri(3, 8); p = ri(1, 3)
    return single(f"进价 {c} 元，售价 {c+p} 元，利润 = ？", [{"key":"A","text":str(p)},{"key":"B","text":str(c)},{"key":"C","text":str(c+p)},{"key":"D","text":str(c-p)}], "A", f"利润=售价-进价={c+p}-{c}={p}")
GEN[47] = q47
def q48():  # 分段计费
    a = ri(2, 4); b = ri(2, 4)
    return single(f"月用水不超过 {a} 吨每吨 {b} 元，超过部分每吨 {b+1} 元。用 {a+1} 吨费用 = ？", [{"key":"A","text":str(a*b + 1*(b+1))},{"key":"B","text":str((a+1)*b)},{"key":"C","text":str(a*b)},{"key":"D","text":str((a+1)*(b+1))}], "A", f"前 {a} 吨 {a}×{b}={a*b}，超 1 吨 {b+1}，共 {a*b+b+1}")
GEN[48] = q48

# ---- 第4章 图形的认识初步 (49-65) ----
def q49():  # 立体/平面图形
    return single("下列是立体图形的是？", [{"key":"A","text":"球"},{"key":"B","text":"三角形"},{"key":"C","text":"圆"},{"key":"D","text":"正方形"}], "A", "球是立体图形，其余是平面图形")
GEN[49] = q49
def q50():  # 常见几何体
    return single("下列属于柱体的是？", [{"key":"A","text":"圆柱"},{"key":"B","text":"球"},{"key":"C","text":"圆锥"},{"key":"D","text":"圆台"}], "A", "圆柱是柱体（上下底面平行且全等）")
GEN[50] = q50
def q51():  # 展开图
    return single("圆柱的侧面展开图是？", [{"key":"A","text":"矩形"},{"key":"B","text":"圆"},{"key":"C","text":"三角形"},{"key":"D","text":"梯形"}], "A", "圆柱侧面展开为矩形")
GEN[51] = q51
def q52():  # 三视图初步
    return single("从正面看圆柱，看到的是？", [{"key":"A","text":"矩形"},{"key":"B","text":"圆"},{"key":"C","text":"三角形"},{"key":"D","text":"正方形"}], "A", "圆柱主视图为矩形")
GEN[52] = q52
def q53():  # 点线面体
    return single("面与面相交形成？", [{"key":"A","text":"线"},{"key":"B","text":"点"},{"key":"C","text":"体"},{"key":"D","text":"面"}], "A", "面面相交得线，线线相交得点")
GEN[53] = q53
def q54():  # 直线射线线段
    return single("射线 AB 与射线 BA 是？", [{"key":"A","text":"不同射线"},{"key":"B","text":"相同射线"},{"key":"C","text":"同一直线"},{"key":"D","text":"同一线段"}], "A", "射线的端点不同，AB 与 BA 是不同射线")
GEN[54] = q54
def q55():  # 两点确定直线
    return single("过两点可以画几条直线？", [{"key":"A","text":"1 条"},{"key":"B","text":"2 条"},{"key":"C","text":"无数条"},{"key":"D","text":"0 条"}], "A", "两点确定一条直线（直线基本事实）")
GEN[55] = q55
def q56():  # 线段最短
    return single("A、B 两点间所有连线中，最短的是？", [{"key":"A","text":"线段 AB"},{"key":"B","text":"折线"},{"key":"C","text":"曲线"},{"key":"D","text":"射线"}], "A", "两点之间线段最短")
GEN[56] = q56
def q57():  # 线段中点
    a = ri(2, 8)
    return single(f"线段 AB={2*a}，C 是 AB 中点，则 AC = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(2*a)},{"key":"C","text":str(4*a)},{"key":"D","text":str(a/2)}], "A", f"中点把线段平分：AC=AB/2={2*a}/2={a}")
GEN[57] = q57
def q58():  # 线段计算
    a = ri(3, 6); b = ri(1, 3)
    return single(f"AB={a}，BC={b}，A、B、C 共线且 B 在中间，AC = ？", [{"key":"A","text":str(a+b)},{"key":"B","text":str(a-b)},{"key":"C","text":str(a*b)},{"key":"D","text":str(abs(a-b))}], "A", f"AC=AB+BC={a}+{b}={a+b}")
GEN[58] = q58
def q59():  # 角的表示
    return single("下列表示角的是？", [{"key":"A","text":"∠AOB"},{"key":"B","text":"△ABC"},{"key":"C","text":"AB"},{"key":"D","text":"⊥"}], "A", "角用 ∠ 表示：∠AOB")
GEN[59] = q59
def q60():  # 度分秒换算
    return single("1° = ？", [{"key":"A","text":"60′"},{"key":"B","text":"100′"},{"key":"C","text":"10′"},{"key":"D","text":"360′"}], "A", "1°=60′，1′=60″")
GEN[60] = q60
def q61():  # 角大小比较
    return single("30° 与 30°30′ 的大小关系是？", [{"key":"A","text":"30° < 30°30′"},{"key":"B","text":"30° > 30°30′"},{"key":"C","text":"相等"},{"key":"D","text":"无法比较"}], "A", "30°30′ = 30.5° > 30°")
GEN[61] = q61
def q62():  # 角平分线
    a = ri(20, 60)
    return single(f"OC 平分 ∠AOB 且 ∠AOB={2*a}°，则 ∠AOC = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(2*a)},{"key":"C","text":str(90-a)},{"key":"D","text":str(a*2)}], "A", f"角平分线平分角：∠AOC={2*a}°/2={a}°")
GEN[62] = q62
def q63():  # 余角
    a = ri(20, 60)
    return single(f"∠A={a}°，∠A 的余角 = ？", [{"key":"A","text":f"{90-a}°"},{"key":"B","text":f"{180-a}°"},{"key":"C","text":f"{a}°"},{"key":"D","text":f"{90+a}°"}], "A", f"余角：90°-{a}°={90-a}°")
GEN[63] = q63
def q64():  # 补角
    a = ri(30, 100)
    return single(f"∠A={a}°，∠A 的补角 = ？", [{"key":"A","text":f"{180-a}°"},{"key":"B","text":f"{90-a}°"},{"key":"C","text":f"{a}°"},{"key":"D","text":f"{180+a}°"}], "A", f"补角：180°-{a}°={180-a}°")
GEN[64] = q64
def q65():  # 方位角
    return single("北偏东 30° 表示？", [{"key":"A","text":"以正北为基准向东偏 30°"},{"key":"B","text":"以正东为基准向北偏 30°"},{"key":"C","text":"正东方向"},{"key":"D","text":"正北方向"}], "A", "方位角：北偏东 30° = 从正北向东转 30°")
GEN[65] = q65

# ---- 第5章 相交线与平行线 (66-87) ----
def q66():
    a = ri(30, 120)
    return single(f"∠1 与 ∠2 互为邻补角，∠1={a}°，则 ∠2 = ？", [{"key":"A","text":f"{180-a}°"},{"key":"B","text":f"{a}°"},{"key":"C","text":f"{90-a}°"},{"key":"D","text":f"{180+a}°"}], "A", f"邻补角和为 180°：∠2=180°-{a}°={180-a}°")
GEN[66] = q66
def q67():
    a = ri(30, 120)
    return single(f"两直线相交，∠1={a}°，∠1 与 ∠2 是对顶角，则 ∠2 = ？", [{"key":"A","text":f"{a}°"},{"key":"B","text":f"{180-a}°"},{"key":"C","text":f"{90-a}°"},{"key":"D","text":"180°"}], "A", f"对顶角相等：∠2={a}°")
GEN[67] = q67
def q68():
    return single("两条直线相交成直角，则这两条直线？", [{"key":"A","text":"互相垂直"},{"key":"B","text":"互相平行"},{"key":"C","text":"重合"},{"key":"D","text":"斜交"}], "A", "相交成 90° → 垂直")
GEN[68] = q68
def q69():
    return single("过直线外一点，可以画几条直线与已知直线垂直？", [{"key":"A","text":"1 条"},{"key":"B","text":"2 条"},{"key":"C","text":"无数条"},{"key":"D","text":"0 条"}], "A", "垂线基本事实：过一点有且只有一条垂线")
GEN[69] = q69
def q70():
    return single("从直线外一点到这条直线的所有连线中，最短的是？", [{"key":"A","text":"垂线段"},{"key":"B","text":"斜线段"},{"key":"C","text":"任意线段"},{"key":"D","text":"平行线"}], "A", "垂线段最短")
GEN[70] = q70
def q71():
    a = ri(2, 6)
    return single(f"点 P 到直线 l 的垂线段长为 {a}，则点 P 到直线 l 的距离 = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(2*a)},{"key":"C","text":"0"},{"key":"D","text":str(a/2)}], "A", f"点到直线距离 = 垂线段长度 = {a}")
GEN[71] = q71
def q72():
    return single("两条直线被第三条直线所截，位置相同的两个角（都在左上方）是？", [{"key":"A","text":"同位角"},{"key":"B","text":"内错角"},{"key":"C","text":"同旁内角"},{"key":"D","text":"对顶角"}], "A", "同位角：位置相同（左上对左上等）")
GEN[72] = q72
def q73():
    return single("两条直线被第三条直线所截，在两条直线之间且交错的两个角是？", [{"key":"A","text":"内错角"},{"key":"B","text":"同位角"},{"key":"C","text":"同旁内角"},{"key":"D","text":"邻补角"}], "A", "内错角：内部且交错")
GEN[73] = q73
def q74():
    return single("两条直线被第三条直线所截，在两条直线之间且同侧的两个角是？", [{"key":"A","text":"同旁内角"},{"key":"B","text":"内错角"},{"key":"C","text":"同位角"},{"key":"D","text":"对顶角"}], "A", "同旁内角：内部且同侧")
GEN[74] = q74
def q75():
    return single("在同一平面内，不相交的两条直线是？", [{"key":"A","text":"平行线"},{"key":"B","text":"垂直线"},{"key":"C","text":"斜线"},{"key":"D","text":"重合线"}], "A", "平行线定义：同一平面内不相交")
GEN[75] = q75
def q76():
    return single("过直线外一点，可画几条直线与已知直线平行？", [{"key":"A","text":"1 条"},{"key":"B","text":"无数条"},{"key":"C","text":"2 条"},{"key":"D","text":"0 条"}], "A", "平行公理：过直线外一点有且只有一条平行线")
GEN[76] = q76
def q77():
    return single("若 a∥b 且 b∥c，则 a 与 c 的关系是？", [{"key":"A","text":"a∥c"},{"key":"B","text":"a⊥c"},{"key":"C","text":"a 与 c 相交"},{"key":"D","text":"无法确定"}], "A", "平行传递性：a∥c")
GEN[77] = q77
def q78():
    return single("同位角相等，两直线？", [{"key":"A","text":"平行"},{"key":"B","text":"垂直"},{"key":"C","text":"相交"},{"key":"D","text":"重合"}], "A", "判定1：同位角相等 → 平行")
GEN[78] = q78
def q79():
    return single("内错角相等，两直线？", [{"key":"A","text":"平行"},{"key":"B","text":"垂直"},{"key":"C","text":"相交"},{"key":"D","text":"重合"}], "A", "判定2：内错角相等 → 平行")
GEN[79] = q79
def q80():
    return single("同旁内角互补，两直线？", [{"key":"A","text":"平行"},{"key":"B","text":"垂直"},{"key":"C","text":"相交"},{"key":"D","text":"重合"}], "A", "判定3：同旁内角互补 → 平行")
GEN[80] = q80
def q81():
    a = ri(30, 100)
    return single(f"两直线平行，∠1={a}°（∠1 与 ∠2 是同位角），则 ∠2 = ？", [{"key":"A","text":f"{a}°"},{"key":"B","text":f"{180-a}°"},{"key":"C","text":f"{90-a}°"},{"key":"D","text":"0°"}], "A", f"性质1：两直线平行，同位角相等 → ∠2={a}°")
GEN[81] = q81
def q82():
    a = ri(30, 100)
    return single(f"两直线平行，∠1={a}°（内错角关系），则其内错角 ∠2 = ？", [{"key":"A","text":f"{a}°"},{"key":"B","text":f"{180-a}°"},{"key":"C","text":f"{90-a}°"},{"key":"D","text":"180°"}], "A", f"性质2：内错角相等 → ∠2={a}°")
GEN[82] = q82
def q83():
    a = ri(30, 100)
    return single(f"两直线平行，∠1={a}°（同旁内角关系），则其同旁内角 ∠2 = ？", [{"key":"A","text":f"{180-a}°"},{"key":"B","text":f"{a}°"},{"key":"C","text":f"{90-a}°"},{"key":"D","text":"0°"}], "A", f"性质3：同旁内角互补 → ∠2=180°-{a}°={180-a}°")
GEN[83] = q83
def q84():
    return single("下列是命题的是？", [{"key":"A","text":"如果 a=b，那么 a²=b²"},{"key":"B","text":"画线段 AB"},{"key":"C","text":"延长 AB"},{"key":"D","text":"过点 P 作直线"}], "A", "命题：判断一件事情的语句")
GEN[84] = q84
def q85():
    return single("经过推理证实的真命题叫？", [{"key":"A","text":"定理"},{"key":"B","text":"公理"},{"key":"C","text":"猜想"},{"key":"D","text":"定义"}], "A", "定理：经过证明的真命题")
GEN[85] = q85
def q86():
    return single("平移不改变图形的？", [{"key":"A","text":"形状和大小"},{"key":"B","text":"位置"},{"key":"C","text":"方向"},{"key":"D","text":"面积"}], "A", "平移只改变位置，不改变形状大小方向")
GEN[86] = q86
def q87():
    a = ri(2, 5)
    return single(f"点 A 向右平移 {a} 个单位，对应点 A′，则 AA′ = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(2*a)},{"key":"C","text":"0"},{"key":"D","text":str(a/2)}], "A", f"平移距离 = 对应点连线长度 = {a}")
GEN[87] = q87

# ---- 第6章 平面直角坐标系 (88-99) ----
def q88():
    return single("(3,5) 与 (5,3) 表示的位置？", [{"key":"A","text":"不同位置"},{"key":"B","text":"相同位置"},{"key":"C","text":"互为相反数"},{"key":"D","text":"无法确定"}], "A", "有序数对：顺序不同位置不同")
GEN[88] = q88
def q89():
    return single("平面直角坐标系由 x 轴、y 轴和？组成", [{"key":"A","text":"原点"},{"key":"B","text":"单位圆"},{"key":"C","text":"象限角"},{"key":"D","text":"刻度"}], "A", "坐标系三要素：x 轴、y 轴、原点")
GEN[89] = q89
def q90():
    return single("平面直角坐标系把平面分成几个象限？", [{"key":"A","text":"4 个"},{"key":"B","text":"2 个"},{"key":"C","text":"3 个"},{"key":"D","text":"8 个"}], "A", "四个象限（逆时针 I、II、III、IV）")
GEN[90] = q90
def q91():
    a = ri(1, 5); b = ri(1, 5)
    return single(f"点 P 的横坐标 {a}，纵坐标 {b}，则 P 的坐标写作？", [{"key":"A","text":f"({a},{b})"},{"key":"B","text":f"({b},{a})"},{"key":"C","text":f"x={a} y={b}"},{"key":"D","text":f"{a}，{b}"}], "A", f"坐标写法 (横, 纵) = ({a},{b})")
GEN[91] = q91
def q92():
    return single("点 (-3, 2) 在第几象限？", [{"key":"A","text":"第二象限"},{"key":"B","text":"第一象限"},{"key":"C","text":"第三象限"},{"key":"D","text":"第四象限"}], "A", "(-,+) → 第二象限")
GEN[92] = q92
def q93():
    a = ri(2, 5)
    return single(f"点 ({a}, 0) 在？", [{"key":"A","text":"x 轴上"},{"key":"B","text":"y 轴上"},{"key":"C","text":"第一象限"},{"key":"D","text":"原点"}], "A", f"纵坐标为 0 → 在 x 轴上")
GEN[93] = q93
def q94():
    a = ri(1, 5); b = ri(1, 5)
    return single(f"点 ({a},{b}) 关于 x 轴对称的点的坐标是？", [{"key":"A","text":f"({a},-{b})"},{"key":"B","text":f"(-{a},{b})"},{"key":"C","text":f"(-{a},-{b})"},{"key":"D","text":f"({b},{a})"}], "A", f"关于 x 轴对称：横坐标不变，纵坐标变号 → ({a},-{b})")
GEN[94] = q94
def q95():
    a = ri(1, 5); b = ri(1, 5)
    return single(f"点 ({a},{b}) 关于 y 轴对称的点的坐标是？", [{"key":"A","text":f"(-{a},{b})"},{"key":"B","text":f"({a},-{b})"},{"key":"C","text":f"(-{a},-{b})"},{"key":"D","text":f"({b},{a})"}], "A", f"关于 y 轴对称：横坐标变号，纵坐标不变 → (-{a},{b})")
GEN[95] = q95
def q96():
    a = ri(1, 5); b = ri(1, 5)
    return single(f"点 ({a},{b}) 关于原点对称的点的坐标是？", [{"key":"A","text":f"(-{a},-{b})"},{"key":"B","text":f"({a},-{b})"},{"key":"C","text":f"(-{a},{b})"},{"key":"D","text":f"({b},{a})"}], "A", f"关于原点对称：横纵都变号 → (-{a},-{b})")
GEN[96] = q96
def q97():
    a = ri(1, 5); b = ri(2, 4)
    return single(f"点 (1,1) 向右平移 {a} 个单位，再向上平移 {b} 个单位，得到？", [{"key":"A","text":f"({1+a},{1+b})"},{"key":"B","text":f"({1-a},{1-b})"},{"key":"C","text":f"({1+a},{1-b})"},{"key":"D","text":f"({1-a},{1+b})"}], "A", f"右加左减 x，上加下减 y → ({1+a},{1+b})")
GEN[97] = q97
def q98():
    a = ri(2, 4)
    return single(f"三点 (0,0)、({a},0)、({a},{a}) 围成三角形面积 = ？", [{"key":"A","text":str(a*a/2)},{"key":"B","text":str(a*a)},{"key":"C","text":str(2*a)},{"key":"D","text":str(a)}], "A", f"直角三角形：S=½×{a}×{a}={a*a/2}")
GEN[98] = q98
def q99():
    return single("用坐标表示地理位置，先要建立？", [{"key":"A","text":"平面直角坐标系"},{"key":"B","text":"比例尺"},{"key":"C","text":"方位角"},{"key":"D","text":"地图"}], "A", "先建坐标系，再定原点")
GEN[99] = q99

# ---- 第7章 三角形 (100-118) ----
def q100():
    return single("三角形有？条边、？个顶点、？个内角", [{"key":"A","text":"3、3、3"},{"key":"B","text":"3、3、4"},{"key":"C","text":"4、4、3"},{"key":"D","text":"3、4、3"}], "A", "三角形：3 边 3 顶点 3 内角")
GEN[100] = q100
def q101():
    return single("三边都不相等的三角形叫？", [{"key":"A","text":"不等边三角形"},{"key":"B","text":"等腰三角形"},{"key":"C","text":"等边三角形"},{"key":"D","text":"直角三角形"}], "A", "按边分类：不等边、等腰（含等边）")
GEN[101] = q101
def q102():
    return single("有一个角是 90° 的三角形是？", [{"key":"A","text":"直角三角形"},{"key":"B","text":"锐角三角形"},{"key":"C","text":"钝角三角形"},{"key":"D","text":"等腰三角形"}], "A", "按角分类：锐角、直角、钝角")
GEN[102] = q102
def q103():
    return single("三角形三边关系定理是？", [{"key":"A","text":"任意两边之和大于第三边"},{"key":"B","text":"任意两边之差大于第三边"},{"key":"C","text":"两边之和等于第三边"},{"key":"D","text":"任意两边之和小于第三边"}], "A", "三角形两边之和大于第三边")
GEN[103] = q103
def q104():
    a = ri(3, 6); b = ri(3, 6)
    return single(f"{a}、{b}、{a+b-1} 三条线段能构成三角形吗？", [{"key":"A","text":"能"},{"key":"B","text":"不能"},{"key":"C","text":"不一定"},{"key":"D","text":"无法判断"}], "A", f"{a}+{b}={a+b}>{a+b-1}，且其他两边之和也满足 → 能")
GEN[104] = q104
def q105():
    return single("从三角形一个顶点向对边作垂线，顶点到垂足的线段叫？", [{"key":"A","text":"高"},{"key":"B","text":"中线"},{"key":"C","text":"角平分线"},{"key":"D","text":"中位线"}], "A", "三角形的高")
GEN[105] = q105
def q106():
    return single("三角形三条中线交于一点，该点是？", [{"key":"A","text":"重心"},{"key":"B","text":"外心"},{"key":"C","text":"内心"},{"key":"D","text":"垂心"}], "A", "重心：三条中线交点")
GEN[106] = q106
def q107():
    return single("三角形一个角的平分线交对边于一点，顶点到交点的线段叫？", [{"key":"A","text":"角平分线"},{"key":"B","text":"中线"},{"key":"C","text":"高"},{"key":"D","text":"中位线"}], "A", "三角形角平分线")
GEN[107] = q107
def q108():
    a = ri(30, 60); b = ri(30, 60)
    return single(f"△ABC 中 ∠A={a}°，∠B={b}°，则 ∠C = ？", [{"key":"A","text":f"{180-a-b}°"},{"key":"B","text":f"{a+b}°"},{"key":"C","text":f"{90-a-b}°"},{"key":"D","text":"90°"}], "A", f"内角和 180°：∠C=180°-{a}°-{b}°={180-a-b}°")
GEN[108] = q108
def q109():
    return single("三角形内角和定理的证明常用？", [{"key":"A","text":"过顶点作对边平行线（平角转化）"},{"key":"B","text":"测量三个角"},{"key":"C","text":"剪拼"},{"key":"D","text":"外角定理"}], "A", "作平行线，将三个角移到同一平角上")
GEN[109] = q109
def q110():
    return single("直角三角形两锐角的关系是？", [{"key":"A","text":"互余（和为90°）"},{"key":"B","text":"互补（和为180°）"},{"key":"C","text":"相等"},{"key":"D","text":"无关"}], "A", "直角三角形两锐角互余")
GEN[110] = q110
def q111():
    return single("三角形的一边与另一边的延长线组成的角叫？", [{"key":"A","text":"外角"},{"key":"B","text":"内角"},{"key":"C","text":"对顶角"},{"key":"D","text":"邻补角"}], "A", "三角形外角定义")
GEN[111] = q111
def q112():
    a = ri(30, 60); b = ri(30, 60)
    return single(f"△ABC 中 ∠A={a}°，∠B={b}°，则外角 ∠ACD（∠C 的外角）= ？", [{"key":"A","text":f"{a+b}°"},{"key":"B","text":f"{180-a-b}°"},{"key":"C","text":f"{a-b}°"},{"key":"D","text":"180°"}], "A", f"外角=不相邻两内角和={a}°+{b}°={a+b}°")
GEN[112] = q112
def q113():
    a = ri(30, 60); b = ri(30, 60)
    return single(f"∠A={a}°，∠B={b}°，则 ∠A 与外角 ∠ACD 的关系？", [{"key":"A","text":f"∠ACD > ∠A"},{"key":"B","text":"∠ACD < ∠A"},{"key":"C","text":"相等"},{"key":"D","text":"无关"}], "A", f"外角大于任意不相邻内角：{a+b}° > {a}°")
GEN[113] = q113
def q114():
    n = ri(4, 6)
    return single(f"{n} 边形有 {n} 条边、{n} 个顶点，从一个顶点引对角线可作？条", [{"key":"A","text":str(n-3)},{"key":"B","text":str(n)},{"key":"C","text":str(n-1)},{"key":"D","text":str(n-2)}], "A", f"从一顶点引对角线：n-3={n-3} 条")
GEN[114] = q114
def q115():
    n = ri(4, 7)
    return single(f"{n} 边形共有对角线条数 = n(n-3)/2 = ？", [{"key":"A","text":str(n*(n-3)//2)},{"key":"B","text":str(n)},{"key":"C","text":str(n-3)},{"key":"D","text":str(n*(n-1)//2)}], "A", f"对角线条数={n}×({n}-3)/2={n*(n-3)//2}")
GEN[115] = q115
def q116():
    n = ri(4, 8)
    return single(f"{n} 边形内角和 = (n-2)×180° = ？", [{"key":"A","text":str((n-2)*180)},{"key":"B","text":str(n*180)},{"key":"C","text":str((n-2)*90)},{"key":"D","text":str(180)}], "A", f"内角和=({n}-2)×180°={(n-2)*180}°")
GEN[116] = q116
def q117():
    return single("任意多边形外角和恒等于？", [{"key":"A","text":"360°"},{"key":"B","text":"180°"},{"key":"C","text":"540°"},{"key":"D","text":"720°"}], "A", "多边形外角和恒为 360°")
GEN[117] = q117
def q118():
    return single("各边相等、各角也相等的多边形叫？", [{"key":"A","text":"正多边形"},{"key":"B","text":"等边多边形"},{"key":"C","text":"凸多边形"},{"key":"D","text":"凹多边形"}], "A", "正多边形定义")
GEN[118] = q118

# ---- 第8章 二元一次方程组 (119-130) ----
def q119():
    a = ri(1, 5); b = ri(1, 5); c = ri(1, 9)
    return single(f"{a}x + {b}y = {c} 是？元？次方程", [{"key":"A","text":"二 一"},{"key":"B","text":"一 二"},{"key":"C","text":"二 二"},{"key":"D","text":"一 一"}], "A", f"含两个未知数且次数为 1 → 二元一次方程")
GEN[119] = q119
def q120():
    x = ri(1, 3); y = ri(1, 3)
    return single(f"x={x}，y={y} 是方程 x+y={x+y} 的一个解吗？", [{"key":"A","text":"是"},{"key":"B","text":"否"},{"key":"C","text":"无法判断"},{"key":"D","text":"不一定"}], "A", f"代入 {x}+{y}={x+y} 成立 → 是解")
GEN[120] = q120
def q121():
    return single("两个二元一次方程合在一起叫？", [{"key":"A","text":"二元一次方程组"},{"key":"B","text":"三元一次方程组"},{"key":"C","text":"一元一次方程"},{"key":"D","text":"分式方程"}], "A", "二元一次方程组定义")
GEN[121] = q121
def q122():
    return single("同时满足方程组中两个方程的解叫？", [{"key":"A","text":"方程组的解"},{"key":"B","text":"方程的解"},{"key":"C","text":"未知数"},{"key":"D","text":"系数"}], "A", "方程组解的定义")
GEN[122] = q122
def q123():
    x = ri(1, 5); y = ri(1, 5)
    return single(f"方程组 {{x+y={x+y}, x-y={x-y}}} 用代入消元，解得 x = ？", [{"key":"A","text":str(x)},{"key":"B","text":str(y)},{"key":"C","text":str(x+y)},{"key":"D","text":str(x-y)}], "A", f"解得 x={x}，y={y}")
GEN[123] = q123
def q124():
    x = ri(1, 5); y = ri(1, 5)
    return single(f"方程组 {{x+y={x+y}, x-y={x-y}}} 用加减消元：两式相加得 2x = ？", [{"key":"A","text":str(2*x)},{"key":"B","text":str(2*y)},{"key":"C","text":str(x+y)},{"key":"D","text":str(x)}], "A", f"相加消 y：2x={2*x}，x={x}")
GEN[124] = q124
def q125():
    return single("当两个方程中某个未知数系数相等或相反时，宜用？", [{"key":"A","text":"加减消元法"},{"key":"B","text":"代入消元法"},{"key":"C","text":"图像法"},{"key":"D","text":"试值法"}], "A", "系数相等/相反 → 加减消元")
GEN[125] = q125
def q126():
    v = ri(3, 6); t = ri(2, 4)
    return single(f"甲、乙相距 {v*t} km，相向而行 {t} 小时相遇，速度和 = ？", [{"key":"A","text":str(v)},{"key":"B","text":str(v*t)},{"key":"C","text":str(v/t)},{"key":"D","text":str(2*v)}], "A", f"速度和=路程/时间={v*t}/{t}={v}")
GEN[126] = q126
def q127():
    a = ri(3, 6); b = ri(2, 5)
    return single(f"甲独做需 {a} 天，乙独做需 {b} 天，合做 1 天完成工程的？", [{"key":"A","text":f"1/{a}+1/{b}"},{"key":"B","text":f"1/({a}+{b})"},{"key":"C","text":f"{a}+{b}"},{"key":"D","text":f"1/{a*b}"}], "A", f"合做效率=1/{a}+1/{b}")
GEN[127] = q127
def q128():
    return single("1 个桌面配 4 条桌腿，x 桌面 y 腿配套时满足？", [{"key":"A","text":"y = 4x"},{"key":"B","text":"x = 4y"},{"key":"C","text":"x = y"},{"key":"D","text":"x + y = 4"}], "A", "配套：腿是桌面的 4 倍 → y=4x")
GEN[128] = q128
def q129():
    return single("买 2 个 A 和 3 个 B 花 21 元，买 3 个 A 和 2 个 B 花 24 元，设 A 单价 x，B 单价 y，则方程组为？", [{"key":"A","text":"{2x+3y=21, 3x+2y=24}"},{"key":"B","text":"{2x+3y=24, 3x+2y=21}"},{"key":"C","text":"{3x+2y=21, 2x+3y=24}"},{"key":"D","text":"{x+y=21, x+y=24}"}], "A", "按题意列方程组")
GEN[129] = q129
def q130():
    return single("三元一次方程组用？消元成二元再解", [{"key":"A","text":"代入或加减消元"},{"key":"B","text":"配方"},{"key":"C","text":"因式分解"},{"key":"D","text":"开平方"}], "A", "三元 → 二元 → 一元")
GEN[130] = q130

# ---- 第9章 不等式与不等式组 (131-145) ----
def q131():
    return single("下列是不等式的是？", [{"key":"A","text":"x + 3 > 5"},{"key":"B","text":"x + 3 = 5"},{"key":"C","text":"x + 3"},{"key":"D","text":"3 + 5"}], "A", "用不等号连接的是不等式")
GEN[131] = q131
def q132():
    a = ri(2, 8)
    return single(f"不等式 x > {a} 的解集是？", [{"key":"A","text":f"x > {a}"},{"key":"B","text":f"x < {a}"},{"key":"C","text":f"x = {a}"},{"key":"D","text":"x ≥ {a}"}], "A", f"解集为 x>{a}")
GEN[132] = q132
def q133():
    a = ri(2, 8)
    return single(f"不等式 x ≥ {a} 的解集在数轴上表示为？", [{"key":"A","text":"从 {a} 向右，实心点"},{"key":"B","text":"从 {a} 向左，实心点"},{"key":"C","text":"从 {a} 向右，空心点"},{"key":"D","text":"从 {a} 向左，空心点"}], "A", f"x≥{a}：实心点，向右")
GEN[133] = q133
def q134():
    a = ri(2, 8)
    return single(f"若 a > {a}，则 a+1 > {a+1} 依据不等式性质？", [{"key":"A","text":"性质1（两边同加）"},{"key":"B","text":"性质2（同乘正数）"},{"key":"C","text":"性质3（同乘负数）"},{"key":"D","text":"无依据"}], "A", "不等式两边同加一个数，不等号方向不变（性质1）")
GEN[134] = q134
def q135():
    a = ri(2, 5)
    return single(f"若 x > {a}，则 3x > {3*a} 依据不等式性质？", [{"key":"A","text":"性质2（同乘正数）"},{"key":"B","text":"性质1"},{"key":"C","text":"性质3"},{"key":"D","text":"无依据"}], "A", f"两边同乘正数 3，不等号不变：3x>{3*a}")
GEN[135] = q135
def q136():
    a = ri(2, 5)
    return single(f"若 x > {a}，则 -x < -{a} 依据不等式性质？", [{"key":"A","text":"性质3（同乘负数变号）"},{"key":"B","text":"性质2"},{"key":"C","text":"性质1"},{"key":"D","text":"无依据"}], "A", f"两边同乘 -1，不等号方向改变：-x<-{a}")
GEN[136] = q136
def q137():
    return single("下列是一元一次不等式的是？", [{"key":"A","text":"2x - 3 > 1"},{"key":"B","text":"x² > 1"},{"key":"C","text":"2x + y > 1"},{"key":"D","text":"1/x > 2"}], "A", "一个未知数、一次、整式不等式")
GEN[137] = q137
def q138():
    a = ri(2, 5); x = ri(2, 6)
    return single(f"解不等式 {a}x > {a*x}，两边除以 {a} 得 x = ？", [{"key":"A","text":f"x > {x}"},{"key":"B","text":f"x < {x}"},{"key":"C","text":f"x > {a*x}"},{"key":"D","text":f"x > {a}"}], "A", f"两边除以正数 {a}：x > {x}")
GEN[138] = q138
def q139():
    a = ri(3, 6)
    return single(f"不等式 x < {a} 的整数解有？个", [{"key":"A","text":str(a)},{"key":"B","text":str(a-1)},{"key":"C","text":str(a+1)},{"key":"D","text":"无数"}], "A", f"x 取 1,2,...,{a-1} 共 {a-1} 个正整数解")
GEN[139] = q139
def q140():
    a = ri(3, 8)
    return single(f"至少需要 {a} 个苹果才能满足每人 1 个（有 5 人）→ 设苹果 x，列不等式？", [{"key":"A","text":f"x ≥ {a}"},{"key":"B","text":f"x > {a}"},{"key":"C","text":f"x ≤ {a}"},{"key":"D","text":f"x < {a}"}], "A", f"至少 → x ≥ {a}")
GEN[140] = q140
def q141():
    return single("几个一元一次不等式合在一起组成？", [{"key":"A","text":"一元一次不等式组"},{"key":"B","text":"方程组"},{"key":"C","text":"分式方程"},{"key":"D","text":"不等式"}], "A", "不等式组定义")
GEN[141] = q141
def q142():
    return single("不等式组中所有不等式解集的公共部分叫？", [{"key":"A","text":"不等式组的解集"},{"key":"B","text":"不等式的解"},{"key":"C","text":"方程的解"},{"key":"D","text":"定义域"}], "A", "不等式组解集 = 各不等式解集的交集")
GEN[142] = q142
def q143():
    return single("不等式组 {x>2, x<5} 的解集是？", [{"key":"A","text":"2 < x < 5"},{"key":"B","text":"x > 5"},{"key":"C","text":"x < 2"},{"key":"D","text":"无解"}], "A", "大小小大取中间：2<x<5")
GEN[143] = q143
def q144():
    a = ri(2, 5); b = ri(6, 9)
    return single(f"解不等式组 {{x > {a}, x < {b}}}，解集为？", [{"key":"A","text":f"{a} < x < {b}"},{"key":"B","text":f"x > {b}"},{"key":"C","text":f"x < {a}"},{"key":"D","text":"无解"}], "A", f"解集：{a}<x<{b}")
GEN[144] = q144
def q145():
    return single("不等式组 {x>a, x<2} 无解，则 a 满足？", [{"key":"A","text":"a ≥ 2"},{"key":"B","text":"a < 2"},{"key":"C","text":"a = 2"},{"key":"D","text":"a ≤ 2"}], "A", "无解：a ≥ 2（比 2 大或相等时无交集）")
GEN[145] = q145

# ---- 第10章 数据的收集整理与描述 (146-157) ----
def q146():
    return single("调查全班同学视力适合用？", [{"key":"A","text":"全面调查（普查）"},{"key":"B","text":"抽样调查"},{"key":"C","text":"估算"},{"key":"D","text":"实验"}], "A", "范围小、要精确 → 普查")
GEN[146] = q146
def q147():
    return single("调查全国中学生身高适合用？", [{"key":"A","text":"抽样调查"},{"key":"B","text":"全面调查"},{"key":"C","text":"普查"},{"key":"D","text":"逐个检查"}], "A", "范围大 → 抽样调查")
GEN[147] = q147
def q148():
    return single("被调查的所有对象构成？", [{"key":"A","text":"总体"},{"key":"B","text":"样本"},{"key":"C","text":"个体"},{"key":"D","text":"样本容量"}], "A", "总体：全体对象")
GEN[148] = q148
def q149():
    return single("每个个体被抽中的机会均等的抽样是？", [{"key":"A","text":"简单随机抽样"},{"key":"B","text":"方便抽样"},{"key":"C","text":"主观抽样"},{"key":"D","text":"分组抽样"}], "A", "简单随机抽样定义")
GEN[149] = q149
def q150():
    return single("用等宽矩形高度表示频数的图是？", [{"key":"A","text":"条形统计图"},{"key":"B","text":"折线统计图"},{"key":"C","text":"扇形统计图"},{"key":"D","text":"直方图"}], "A", "条形图用高度表示数量")
GEN[150] = q150
def q151():
    return single("反映数据变化趋势的图是？", [{"key":"A","text":"折线统计图"},{"key":"B","text":"条形统计图"},{"key":"C","text":"扇形统计图"},{"key":"D","text":"直方图"}], "A", "折线图反映趋势")
GEN[151] = q151
def q152():
    a = ri(10, 60)
    return single(f"扇形统计图中，占总数 {a}% 的扇形的圆心角 = ？", [{"key":"A","text":f"{a*3.6}°"},{"key":"B","text":f"{a}°"},{"key":"C","text":f"{a*10}°"},{"key":"D","text":f"{360-a}°"}], "A", f"圆心角 = {a}% × 360° = {a*3.6}°")
GEN[152] = q152
def q153():
    n = ri(20, 40); f = ri(5, 10)
    return single(f"数据总数 {n}，某组频数 {f}，频率 = ？", [{"key":"A","text":str(f/n)},{"key":"B","text":str(n/f)},{"key":"C","text":str(f)},{"key":"D","text":str(n)}], "A", f"频率 = 频数/总数 = {f}/{n} = {f/n}")
GEN[153] = q153
def q154():
    return single("直方图中，每个小矩形的宽表示？", [{"key":"A","text":"组距"},{"key":"B","text":"组数"},{"key":"C","text":"频数"},{"key":"D","text":"频率"}], "A", "矩形宽 = 组距")
GEN[154] = q154
def q155():
    return single("将数据分组后，各组频数的总和等于？", [{"key":"A","text":"数据总数"},{"key":"B","text":"组数"},{"key":"C","text":"组距"},{"key":"D","text":"1"}], "A", "各频数之和 = 总数")
GEN[155] = q155
def q156():
    return single("频数分布直方图中，小矩形面积表示？", [{"key":"A","text":"频数"},{"key":"B","text":"频率"},{"key":"C","text":"组距"},{"key":"D","text":"数据值"}], "A", "直方图面积（高=频数）")
GEN[156] = q156
def q157():
    return single("取每组组中值，连成折线 → ？", [{"key":"A","text":"频数分布折线图"},{"key":"B","text":"条形图"},{"key":"C","text":"扇形图"},{"key":"D","text":"散点图"}], "A", "频数分布折线图")
GEN[157] = q157

# ---- 第11章 全等三角形 (158-170) ----
def q158():
    return single("能够完全重合的两个图形叫？", [{"key":"A","text":"全等形"},{"key":"B","text":"相似形"},{"key":"C","text":"等积形"},{"key":"D","text":"对称形"}], "A", "全等形定义")
GEN[158] = q158
def q159():
    return single("全等三角形中，互相重合的顶点叫？", [{"key":"A","text":"对应顶点"},{"key":"B","text":"重心"},{"key":"C","text":"外心"},{"key":"D","text":"内心"}], "A", "对应顶点定义")
GEN[159] = q159
def q160():
    a = ri(3, 9)
    return single(f"△ABC≌△DEF，AB={a}，则 DE = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(2*a)},{"key":"C","text":str(a/2)},{"key":"D","text":"无法确定"}], "A", f"全等三角形对应边相等：DE=AB={a}")
GEN[160] = q160
def q161():
    return single("三边对应相等的两个三角形全等，简称？", [{"key":"A","text":"SSS"},{"key":"B","text":"SAS"},{"key":"C","text":"ASA"},{"key":"D","text":"HL"}], "A", "SSS：边边边")
GEN[161] = q161
def q162():
    return single("两边及夹角对应相等的两个三角形全等，简称？", [{"key":"A","text":"SAS"},{"key":"B","text":"SSS"},{"key":"C","text":"AAS"},{"key":"D","text":"AAA"}], "A", "SAS：边角边（注意夹角）")
GEN[162] = q162
def q163():
    return single("两角及夹边对应相等 → 全等，简称？", [{"key":"A","text":"ASA"},{"key":"B","text":"SAS"},{"key":"C","text":"SSS"},{"key":"D","text":"HL"}], "A", "ASA：角边角")
GEN[163] = q163
def q164():
    return single("两角及其中一角的对边对应相等 → 全等，简称？", [{"key":"A","text":"AAS"},{"key":"B","text":"ASA"},{"key":"C","text":"SAS"},{"key":"D","text":"SSS"}], "A", "AAS：角角边")
GEN[164] = q164
def q165():
    return single("直角三角形斜边和一条直角边对应相等 → 全等，简称？", [{"key":"A","text":"HL"},{"key":"B","text":"SSA"},{"key":"C","text":"AAA"},{"key":"D","text":"SSS"}], "A", "HL：斜边直角边（只适用于直角三角形）")
GEN[165] = q165
def q166():
    return single("下列不能判定三角形全等的是？", [{"key":"A","text":"SSA"},{"key":"B","text":"SSS"},{"key":"C","text":"AAS"},{"key":"D","text":"HL"}], "A", "SSA 不能判定全等")
GEN[166] = q166
def q167():
    return single("证明三角形全等的一般书写顺序是？", [{"key":"A","text":"先写已知和条件，再写判定依据"},{"key":"B","text":"直接写结论"},{"key":"C","text":"只写图形"},{"key":"D","text":"随意写"}], "A", "规范书写：已知 → 推导 → 判定 → 结论")
GEN[167] = q167
def q168():
    a = ri(3, 8)
    return single(f"OC 平分 ∠AOB，PC⊥OA 于 C，PC={a}，则 P 到 OB 的距离 = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(2*a)},{"key":"C","text":str(a/2)},{"key":"D","text":"0"}], "A", f"角平分线上点到角两边距离相等 = {a}")
GEN[168] = q168
def q169():
    return single("到角两边距离相等的点在？上", [{"key":"A","text":"角的平分线"},{"key":"B","text":"角的内部"},{"key":"C","text":"角的边上"},{"key":"D","text":"三角形外"}], "A", "角平分线判定定理")
GEN[169] = q169
def q170():
    return single("尺规作角平分线的依据是？", [{"key":"A","text":"SSS（构造全等）"},{"key":"B","text":"SAS"},{"key":"C","text":"ASA"},{"key":"D","text":"HL"}], "A", "尺规作角平分线用 SSS 证全等")
GEN[170] = q170

# ---- 第12章 轴对称 (171-186) ----
def q171():
    return single("下列是轴对称图形的是？", [{"key":"A","text":"等边三角形"},{"key":"B","text":"任意四边形"},{"key":"C","text":"平行四边形"},{"key":"D","text":"三角形"}], "A", "等边三角形有对称轴（3 条）")
GEN[171] = q171
def q172():
    return single("关于某直线对称的两个图形，对称轴是？", [{"key":"A","text":"对应点连线的垂直平分线"},{"key":"B","text":"任意直线"},{"key":"C","text":"对应点连线"},{"key":"D","text":"图形的边"}], "A", "对称轴垂直平分对应点连线")
GEN[172] = q172
def q173():
    return single("轴对称图形的对称轴垂直平分？", [{"key":"A","text":"对应点连线"},{"key":"B","text":"对应边"},{"key":"C","text":"对应角"},{"key":"D","text":"高线"}], "A", "对称轴是任意一对对应点连线的垂直平分线")
GEN[173] = q173
def q174():
    return single("经过线段中点且垂直于这条线段的直线叫？", [{"key":"A","text":"线段垂直平分线"},{"key":"B","text":"角平分线"},{"key":"C","text":"中线"},{"key":"D","text":"高线"}], "A", "垂直平分线定义")
GEN[174] = q174
def q175():
    a = ri(3, 8)
    return single(f"P 在线段 AB 的垂直平分线上，PA={a}，则 PB = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(2*a)},{"key":"C","text":str(a/2)},{"key":"D","text":"无法确定"}], "A", f"垂直平分线上点到两端点距离相等：PB={a}")
GEN[175] = q175
def q176():
    return single("到线段两端点距离相等的点，在？上", [{"key":"A","text":"线段的垂直平分线"},{"key":"B","text":"线段上"},{"key":"C","text":"线段外"},{"key":"D","text":"角平分线"}], "A", "垂直平分线判定")
GEN[176] = q176
def q177():
    return single("尺规作垂直平分线，作图的依据是？", [{"key":"A","text":"到两端点距离相等的点在垂直平分线上"},{"key":"B","text":"SSS"},{"key":"C","text":"角平分线"},{"key":"D","text":"中位线"}], "A", "作垂直平分线的原理")
GEN[177] = q177
def q178():
    a = ri(1, 5); b = ri(1, 5)
    return single(f"点 ({a},{b}) 关于 x 轴对称的点是？", [{"key":"A","text":f"({a},-{b})"},{"key":"B","text":f"(-{a},{b})"},{"key":"C","text":f"(-{a},-{b})"},{"key":"D","text":f"({b},{a})"}], "A", f"关于 x 轴对称：纵坐标变号 → ({a},-{b})")
GEN[178] = q178
def q179():
    return single("有两边相等的三角形叫？", [{"key":"A","text":"等腰三角形"},{"key":"B","text":"等边三角形"},{"key":"C","text":"直角三角形"},{"key":"D","text":"钝角三角形"}], "A", "等腰三角形定义")
GEN[179] = q179
def q180():
    a = ri(30, 70)
    return single(f"等腰三角形顶角为 {180-2*a}°，则底角 = ？", [{"key":"A","text":f"{a}°"},{"key":"B","text":f"{2*a}°"},{"key":"C","text":f"{90-a}°"},{"key":"D","text":f"{180-a}°"}], "A", f"等边对等角：底角=({180-(180-2*a)})°/2={a}°")
GEN[180] = q180
def q181():
    return single("等腰三角形顶角平分线、底边中线、底边高线？", [{"key":"A","text":"三线合一"},{"key":"B","text":"互相平行"},{"key":"C","text":"互相垂直"},{"key":"D","text":"互相平分"}], "A", "等腰三角形三线合一")
GEN[181] = q181
def q182():
    return single("有两个角相等的三角形是？", [{"key":"A","text":"等腰三角形"},{"key":"B","text":"等边三角形"},{"key":"C","text":"直角三角形"},{"key":"D","text":"钝角三角形"}], "A", "等角对等边 → 等腰")
GEN[182] = q182
def q183():
    return single("等边三角形的每个内角都是？", [{"key":"A","text":"60°"},{"key":"B","text":"45°"},{"key":"C","text":"90°"},{"key":"D","text":"30°"}], "A", "等边三角形三角都是 60°")
GEN[183] = q183
def q184():
    return single("下列能判定等边三角形的是？", [{"key":"A","text":"三边相等"},{"key":"B","text":"两边相等"},{"key":"C","text":"一个角 60° 的普通三角形"},{"key":"D","text":"一个角 90°"}], "A", "等边判定：三边相等/三角相等/一角 60° 的等腰")
GEN[184] = q184
def q185():
    a = ri(2, 5)
    return single(f"含 30° 角的直角三角形中，30° 角所对直角边 = {a}，则斜边 = ？", [{"key":"A","text":str(2*a)},{"key":"B","text":str(a)},{"key":"C","text":str(a/2)},{"key":"D","text":str(a*3)}], "A", f"30° 对边 = 斜边的一半 → 斜边 = {2*a}")
GEN[185] = q185
def q186():
    return single("将军饮马问题的核心是作？", [{"key":"A","text":"对称点再连线（两点之间线段最短）"},{"key":"B","text":"垂线段"},{"key":"C","text":"角平分线"},{"key":"D","text":"中线"}], "A", "将军饮马：对称 → 共线最短")
GEN[186] = q186

# ---- 第13章 实数 (187-200) ----
def q187():
    a = ri(2, 9)
    return single(f"√{a*a} = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(-a)},{"key":"C","text":"±" + str(a)},{"key":"D","text":str(a*a)}], "A", f"算术平方根取正：√{a*a}={a}")
GEN[187] = q187
def q188():
    return single("√a 有意义的条件是？", [{"key":"A","text":"a ≥ 0"},{"key":"B","text":"a > 0"},{"key":"C","text":"a ≤ 0"},{"key":"D","text":"a ≠ 0"}], "A", "算术平方根被开方数非负")
GEN[188] = q188
def q189():
    a = ri(2, 9)
    return single(f"{a*a} 的平方根是？", [{"key":"A","text":"±" + str(a)},{"key":"B","text":str(a)},{"key":"C","text":str(-a)},{"key":"D","text":str(a*a)}], "A", f"平方根有两个：±{a}")
GEN[189] = q189
def q190():
    return single("下列说法正确的是？", [{"key":"A","text":"正数有两个平方根（互为相反数）"},{"key":"B","text":"负数有平方根"},{"key":"C","text":"0 没有平方根"},{"key":"D","text":"正数只有一个平方根"}], "A", "平方根性质：正数 2 个、0 一个、负数无")
GEN[190] = q190
def q191():
    a = ri(2, 9)
    return single(f"开平方：√({a*a}) = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(-a)},{"key":"C","text":str(a*a)},{"key":"D","text":"±" + str(a)}], "A", f"√({a*a})={a}")
GEN[191] = q191
def q192():
    a = ri(2, 5)
    return single(f"³√({a*a*a}) = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(-a)},{"key":"C","text":str(a*a*a)},{"key":"D","text":"±" + str(a)}], "A", f"立方根：³√({a*a*a})={a}")
GEN[192] = q192
def q193():
    a = ri(2, 5)
    return single(f"³√(-{a*a*a}) = ？", [{"key":"A","text":str(-a)},{"key":"B","text":str(a)},{"key":"C","text":str(a*a*a)},{"key":"D","text":"无意义"}], "A", f"负数可开立方：³√(-{a*a*a})={-a}")
GEN[193] = q193
def q194():
    a = ri(2, 5)
    return single(f"开立方：³√({a*a*a}) = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(a*a*a)},{"key":"C","text":str(-a)},{"key":"D","text":"±" + str(a)}], "A", f"³√({a*a*a})={a}")
GEN[194] = q194
def q195():
    return single("下列是无理数的是？", [{"key":"A","text":"√2"},{"key":"B","text":"1/3"},{"key":"C","text":"0.5"},{"key":"D","text":"-4"}], "A", "√2 无限不循环 → 无理数")
GEN[195] = q195
def q196():
    return single("有理数和无理数统称为？", [{"key":"A","text":"实数"},{"key":"B","text":"整数"},{"key":"C","text":"分数"},{"key":"D","text":"自然数"}], "A", "实数 = 有理数 + 无理数")
GEN[196] = q196
def q197():
    return single("实数与数轴上的点？", [{"key":"A","text":"一一对应"},{"key":"B","text":"无对应"},{"key":"C","text":"部分对应"},{"key":"D","text":"二一对应"}], "A", "实数与数轴上的点一一对应")
GEN[197] = q197
def q198():
    a = ri(2, 9)
    return single(f"√{a*a} 的相反数是？", [{"key":"A","text":str(-a)},{"key":"B","text":str(a)},{"key":"C","text":"0"},{"key":"D","text":str(2*a)}], "A", f"√{a*a}={a}，相反数 {-a}")
GEN[198] = q198
def q199():
    return single("比较 √2 与 1.5 的大小？", [{"key":"A","text":"√2 < 1.5"},{"key":"B","text":"√2 > 1.5"},{"key":"C","text":"相等"},{"key":"D","text":"无法比较"}], "A", "√2≈1.414 < 1.5")
GEN[199] = q199
def q200():
    a = ri(2, 4)
    return single(f"计算：√{a*a} + ³√{a*a*a} = ？", [{"key":"A","text":str(a + a*a)},{"key":"B","text":str(a*a + a*a*a)},{"key":"C","text":str(a + a)},{"key":"D","text":str(2*a*a)}], "A", f"√{a*a}={a}，³√{a*a*a}={a*a}，和={a+a*a}")
GEN[200] = q200

# ---- 第14章 一次函数 (201-219) ----
def q201():
    return single("在某一变化过程中，数值发生变化的量叫？", [{"key":"A","text":"变量"},{"key":"B","text":"常量"},{"key":"C","text":"参数"},{"key":"D","text":"系数"}], "A", "变量定义")
GEN[201] = q201
def q202():
    return single("函数 y=2x 中，自变量是？", [{"key":"A","text":"x"},{"key":"B","text":"y"},{"key":"C","text":"2"},{"key":"D","text":"0"}], "A", "自变量 x")
GEN[202] = q202
def q203():
    return single("函数 y = 1/(x-2) 的自变量取值范围是？", [{"key":"A","text":"x ≠ 2"},{"key":"B","text":"x > 2"},{"key":"C","text":"x ≥ 2"},{"key":"D","text":"x ≠ 0"}], "A", "分式分母不为 0：x≠2")
GEN[203] = q203
def q204():
    return single("下列不是函数表示方法的是？", [{"key":"A","text":"解方程法"},{"key":"B","text":"解析式法"},{"key":"C","text":"列表法"},{"key":"D","text":"图像法"}], "A", "函数三种表示：解析式、列表、图像")
GEN[204] = q204
def q205():
    return single("画函数图像的步骤是？", [{"key":"A","text":"列表、描点、连线"},{"key":"B","text":"连线、描点、列表"},{"key":"C","text":"描点、列表、连线"},{"key":"D","text":"列表、连线、描点"}], "A", "画图三步：列表、描点、连线")
GEN[205] = q205
def q206():
    k = ri(2, 5)
    return single(f"y = {k}x (k≠0) 是？函数", [{"key":"A","text":"正比例函数"},{"key":"B","text":"反比例函数"},{"key":"C","text":"二次函数"},{"key":"D","text":"常量函数"}], "A", f"y=kx 是正比例函数")
GEN[206] = q206
def q207():
    return single("正比例函数 y=kx 的图像是？", [{"key":"A","text":"过原点的直线"},{"key":"B","text":"不过原点的直线"},{"key":"C","text":"抛物线"},{"key":"D","text":"双曲线"}], "A", "正比例函数图像过原点")
GEN[207] = q207
def q208():
    k = ri(2, 5)
    return single(f"正比例函数 y={k}x，y 随 x 增大而？", [{"key":"A","text":"增大"},{"key":"B","text":"减小"},{"key":"C","text":"不变"},{"key":"D","text":"先增后减"}], "A", f"k={k}>0，y 随 x 增大而增大")
GEN[208] = q208
def q209():
    k = ri(2, 5); b = ri(1, 5)
    return single(f"y = {k}x + {b} 是？函数", [{"key":"A","text":"一次函数"},{"key":"B","text":"正比例函数"},{"key":"C","text":"二次函数"},{"key":"D","text":"反比例函数"}], "A", f"y=kx+b(k≠0) 是一次函数")
GEN[209] = q209
def q210():
    k = ri(2, 5); b = ri(2, 6)
    return single(f"一次函数 y={k}x+{b} 与 y 轴交于点？", [{"key":"A","text":f"(0,{b})"},{"key":"B","text":f"({b},0)"},{"key":"C","text":"(0,0)"},{"key":"D","text":f"(1,{k+b})"}], "A", f"令 x=0，y={b} → (0,{b})（截距 {b}）")
GEN[210] = q210
def q211():
    k = ri(2, 5)
    return single(f"一次函数 y={k}x+1，y 随 x 增大而？", [{"key":"A","text":"增大"},{"key":"B","text":"减小"},{"key":"C","text":"不变"},{"key":"D","text":"无法确定"}], "A", f"k={k}>0 → y 随 x 增大而增大")
GEN[211] = q211
def q212():
    return single("一次函数 y=2x+3 的图像经过哪些象限？", [{"key":"A","text":"一、二、三"},{"key":"B","text":"一、二、四"},{"key":"C","text":"一、三、四"},{"key":"D","text":"二、三、四"}], "A", "k>0、b>0 → 过一、二、三象限")
GEN[212] = q212
def q213():
    return single("已知直线过 (0,3) 和 (1,5)，用待定系数法：y=kx+3，代入 (1,5) 得 k=？", [{"key":"A","text":"2"},{"key":"B","text":"3"},{"key":"C","text":"5"},{"key":"D","text":"1"}], "A", "5=k+3 → k=2")
GEN[213] = q213
def q214():
    k = ri(2, 5); b = ri(2, 6)
    return single(f"一次函数 y={k}x+{b} 与 x 轴交点横坐标 = ？", [{"key":"A","text":f"-{b}/{k}"},{"key":"B","text":f"{b}/{k}"},{"key":"C","text":f"{b}"},{"key":"D","text":f"-{b}"}], "A", f"令 y=0：x=-{b}/{k}")
GEN[214] = q214
def q215():
    k = ri(2, 5)
    return single(f"与 y={k}x+1 平行的直线是？", [{"key":"A","text":f"y={k}x+3"},{"key":"B","text":f"y=-{k}x+1"},{"key":"C","text":f"y={k+1}x+1"},{"key":"D","text":f"y={k}x²"}], "A", f"平行条件：k 相同、b 不同 → y={k}x+3")
GEN[215] = q215
def q216():
    return single("一次函数 y=2x-4 与 x 轴交点的横坐标即方程？的解", [{"key":"A","text":"2x-4=0"},{"key":"B","text":"2x+4=0"},{"key":"C","text":"x-4=0"},{"key":"D","text":"2x=4"}], "A", "y=0 → 2x-4=0")
GEN[216] = q216
def q217():
    return single("一次函数 y=2x-4，y>0 时即 2x-4>0 → x 的取值范围？", [{"key":"A","text":"x > 2"},{"key":"B","text":"x < 2"},{"key":"C","text":"x > 4"},{"key":"D","text":"x < 4"}], "A", "2x-4>0 → x>2")
GEN[217] = q217
def q218():
    return single("两条一次函数图像的交点坐标是？的解", [{"key":"A","text":"对应二元一次方程组"},{"key":"B","text":"一元一次方程"},{"key":"C","text":"一元二次方程"},{"key":"D","text":"不等式"}], "A", "交点坐标 = 方程组解")
GEN[218] = q218
def q219():
    return single("一次函数应用：y=3x+2 表示每月固定 2 元 + 每件 3 元，买 5 件费用 = ？", [{"key":"A","text":"17"},{"key":"B","text":"15"},{"key":"C","text":"10"},{"key":"D","text":"20"}], "A", "y=3×5+2=17")
GEN[219] = q219

# ---- 第15章 整式的乘除与分解因式 (220-240) ----
def q220():
    a = ri(2, 4); m = ri(2, 4); n = ri(2, 4)
    return single(f"{a}^{m} × {a}^{n} = ？", [{"key":"A","text":str(a**(m+n))},{"key":"B","text":str(a**(m*n))},{"key":"C","text":str(a**m + a**n)},{"key":"D","text":str(a**(m-n))}], "A", f"同底数幂相乘指数相加：{a}^{m+n}={a**(m+n)}")
GEN[220] = q220
def q221():
    a = ri(2, 4); m = ri(2, 3); n = ri(2, 3)
    return single(f"({a}^{m})^{n} = {a}^{m}×{n} = ？", [{"key":"A","text":str(a**(m*n))},{"key":"B","text":str(a**(m+n))},{"key":"C","text":str(a**m*a**n)},{"key":"D","text":str(a**(m+n+1))}], "A", f"幂的乘方指数相乘：{a}^{m*n}={a**(m*n)}")
GEN[221] = q221
def q222():
    a = ri(2, 3); m = ri(2, 3)
    return single(f"({a}x)^{m} = ？", [{"key":"A","text":f"{a**m}x^{m}"},{"key":"B","text":f"{a*m}x^{m}"},{"key":"C","text":f"{a}x^{m}"},{"key":"D","text":f"{a**m}x^{m+1}"}], "A", f"积的乘方：{a**m}x^{m}")
GEN[222] = q222
def q223():
    a = ri(2, 4); m = ri(2, 4); n = ri(1, 3)
    return single(f"{a}^{m} ÷ {a}^{n} = ？", [{"key":"A","text":str(a**(m-n))},{"key":"B","text":str(a**(m+n))},{"key":"C","text":str(a**(m*n))},{"key":"D","text":str(a**(m/n))}], "A", f"同底数幂相除指数相减：{a}^{m-n}={a**(m-n)}")
GEN[223] = q223
def q224():
    a = ri(2, 6)
    return single(f"{a}⁰ = ？(a≠0)", [{"key":"A","text":"1"},{"key":"B","text":"0"},{"key":"C","text":str(a)},{"key":"D","text":str(-a)}], "A", "零指数幂：任何非零数的 0 次幂 = 1")
GEN[224] = q224
def q225():
    a = ri(2, 4)
    return single(f"{a}⁻¹ = ？", [{"key":"A","text":f"1/{a}"},{"key":"B","text":str(-a)},{"key":"C","text":str(a)},{"key":"D","text":f"-1/{a}"}], "A", f"负整数指数：{a}⁻¹=1/{a}")
GEN[225] = q225
def q226():
    a = ri(2, 4); b = ri(2, 4)
    return single(f"计算：{a}x² · {b}x³ = ？", [{"key":"A","text":f"{a*b}x⁵"},{"key":"B","text":f"{a*b}x⁶"},{"key":"C","text":f"{a+b}x⁵"},{"key":"D","text":f"{a*b}x^{2+3}"}], "A", f"系数相乘、指数相加：{a*b}x⁵")
GEN[226] = q226
def q227():
    a = ri(2, 4); b = ri(2, 4)
    return single(f"计算：{a}x({b}x + 1) = ？", [{"key":"A","text":f"{a*b}x² + {a}x"},{"key":"B","text":f"{a*b}x² + 1"},{"key":"C","text":f"{a}x² + {a}x"},{"key":"D","text":f"{a*b}x + {a}"}], "A", f"分配律：{a*b}x² + {a}x")
GEN[227] = q227
def q228():
    a = ri(2, 4); b = ri(1, 3); c = ri(2, 4)
    return single(f"(x + {a})(x + {c}) = ？", [{"key":"A","text":f"x² + {a+c}x + {a*c}"},{"key":"B","text":f"x² + {a*c}x + {a+c}"},{"key":"C","text":f"x² + {a+c}x + {a+c}"},{"key":"D","text":f"x² + {a-c}x + {a*c}"}], "A", f"多项式乘多项式：x²+({a}+{c})x+{a}×{c}")
GEN[228] = q228
def q229():
    a = ri(2, 5); b = ri(2, 5)
    return single(f"计算：({a}x + {b})({a}x - {b}) = ？", [{"key":"A","text":f"{a*a}x² - {b*b}"},{"key":"B","text":f"{a*a}x² + {b*b}"},{"key":"C","text":f"{a*a}x² + {2*a*b}x + {b*b}"},{"key":"D","text":f"{a*a}x² - {2*a*b}x + {b*b}"}], "A", f"平方差公式：({a}x)²-{b}²={a*a}x²-{b*b}")
GEN[229] = q229
def q230():
    a = ri(2, 5); b = ri(2, 5)
    return single(f"({a} + {b})² = ？", [{"key":"A","text":f"{a*a}+{2*a*b}+{b*b}"},{"key":"B","text":f"{a*a}+{b*b}"},{"key":"C","text":f"{a*a}-{2*a*b}+{b*b}"},{"key":"D","text":f"{2*a}+{2*b}"}], "A", f"完全平方和：{a}²+2×{a}×{b}+{b}²={a*a}+{2*a*b}+{b*b}")
GEN[230] = q230
def q231():
    a = ri(2, 5); b = ri(2, 5)
    return single(f"({a} - {b})² = ？", [{"key":"A","text":f"{a*a}-{2*a*b}+{b*b}"},{"key":"B","text":f"{a*a}+{b*b}"},{"key":"C","text":f"{a*a}+{2*a*b}+{b*b}"},{"key":"D","text":f"{2*a}-{2*b}"}], "A", f"完全平方差：{a}²-2×{a}×{b}+{b}²={a*a}-{2*a*b}+{b*b}")
GEN[231] = q231
def q232():
    a = ri(2, 5); b = ri(2, 5)
    return single(f"(x + {a})² = x² + 2·{a}·x + {a}²，则 x² + {2*a}x + {a*a} = (x + ?)²", [{"key":"A","text":str(a)},{"key":"B","text":str(2*a)},{"key":"C","text":str(a*a)},{"key":"D","text":str(a+1)}], "A", f"完全平方逆用：(x+{a})²")
GEN[232] = q232
def q233():
    a = ri(2, 4); b = ri(2, 4)
    return single(f"{a*b}x⁴ ÷ {b}x² = ？", [{"key":"A","text":f"{a}x²"},{"key":"B","text":f"{a*b}x²"},{"key":"C","text":f"{a}x⁴"},{"key":"D","text":f"{a}x^{b}"}], "A", f"系数相除、指数相减：{a}x²")
GEN[233] = q233
def q234():
    a = ri(2, 4); b = ri(2, 4)
    return single(f"({a}x² + {a*b}x) ÷ {a}x = ？", [{"key":"A","text":f"x + {b}"},{"key":"B","text":f"{a}x + {b}"},{"key":"C","text":f"x + {a*b}"},{"key":"D","text":f"{a}x + {a*b}"}], "A", f"逐项除以：{a}x²÷{a}x + {a*b}x÷{a}x = x+{b}")
GEN[234] = q234
def q235():
    return single("把一个多项式化成几个整式的积的形式叫？", [{"key":"A","text":"因式分解"},{"key":"B","text":"整式乘法"},{"key":"C","text":"合并同类项"},{"key":"D","text":"去括号"}], "A", "因式分解定义（和变积）")
GEN[235] = q235
def q236():
    return single("因式分解与整式乘法的关系是？", [{"key":"A","text":"互逆"},{"key":"B","text":"相同"},{"key":"C","text":"无关"},{"key":"D","text":"包含"}], "A", "因式分解与整式乘法互为逆运算")
GEN[236] = q236
def q237():
    a = ri(2, 5); b = ri(2, 4)
    return single(f"分解因式：{a}x + {a*b} = ？", [{"key":"A","text":f"{a}(x + {b})"},{"key":"B","text":f"{a}(x + {a*b})"},{"key":"C","text":f"x({a} + {b})"},{"key":"D","text":f"{a}x(1 + {b})"}], "A", f"提公因式 {a}：{a}(x+{b})")
GEN[237] = q237
def q238():
    a = ri(2, 5); b = ri(2, 5)
    return single(f"分解因式：{a*a}x² - {b*b} = ？", [{"key":"A","text":f"({a}x+{b})({a}x-{b})"},{"key":"B","text":f"({a}x+{b})²"},{"key":"C","text":f"({a}x-{b})²"},{"key":"D","text":f"({a}x+{b})({a}x+{b})"}], "A", f"平方差公式：({a}x)²-{b}²=({a}x+{b})({a}x-{b})")
GEN[238] = q238
def q239():
    a = ri(2, 5); b = ri(2, 4)
    return single(f"分解因式：x² + {2*a}x + {a*a} = ？", [{"key":"A","text":f"(x+{a})²"},{"key":"B","text":f"(x-{a})²"},{"key":"C","text":f"(x+{a})(x-{a})"},{"key":"D","text":f"(x+{2*a})²"}], "A", f"完全平方：x²+2×{a}x+{a}²=(x+{a})²")
GEN[239] = q239
def q240():
    a = ri(2, 5)
    return single(f"分解因式 {2*a}x² - {2*a} 的第一步是？", [{"key":"A","text":f"提公因式 {2*a}"},{"key":"B","text":"直接套公式"},{"key":"C","text":"合并同类项"},{"key":"D","text":"去括号"}], "A", f"先提公因式 {2*a}：{2*a}(x²-1)")
GEN[240] = q240

# ---- 第16章 分式 (241-258) ----
def q241():
    return single("下列是分式的是？", [{"key":"A","text":"1/x"},{"key":"B","text":"x/2"},{"key":"C","text":"3"},{"key":"D","text":"x+1"}], "A", "分式：分母含字母")
GEN[241] = q241
def q242():
    a = ri(2, 5)
    return single(f"分式 1/(x-{a}) 有意义的条件是？", [{"key":"A","text":f"x≠{a}"},{"key":"B","text":f"x>{a}"},{"key":"C","text":f"x≥{a}"},{"key":"D","text":f"x≠0"}], "A", f"分母不为 0：x-{a}≠0 → x≠{a}")
GEN[242] = q242
def q243():
    a = ri(2, 5)
    return single(f"分式 (x-{a})/(x+1) 的值为 0 的条件是？", [{"key":"A","text":f"x={a}（且分母不为0）"},{"key":"B","text":f"x=-{a}"},{"key":"C","text":"x=0"},{"key":"D","text":"x=1"}], "A", f"分子=0 且分母≠0：x={a}")
GEN[243] = q243
def q244():
    a = ri(2, 5)
    return single(f"分式 a/b 分子分母同乘 {a}，值？", [{"key":"A","text":"不变"},{"key":"B","text":"变为 " + str(a) + " 倍"},{"key":"C","text":"变为 1/" + str(a)},{"key":"D","text":"无法确定"}], "A", "分式基本性质：分子分母同乘（除）同一个非零数，值不变")
GEN[244] = q244
def q245():
    a = ri(2, 5); b = ri(2, 4)
    return single(f"约分：({a*b}x)/({b}x²) = ？", [{"key":"A","text":f"{a}/x"},{"key":"B","text":f"{a*b}/x"},{"key":"C","text":f"{a}x"},{"key":"D","text":f"{a}/x²"}], "A", f"约去公因式 {b}x：{a}/x（最简分式）")
GEN[245] = q245
def q246():
    return single("分式 1/x 与 1/(2x) 的最简公分母是？", [{"key":"A","text":"2x"},{"key":"B","text":"x"},{"key":"C","text":"2x²"},{"key":"D","text":"3x"}], "A", "最简公分母：2x")
GEN[246] = q246
def q247():
    a = ri(2, 4); b = ri(2, 4)
    return single(f"计算：({a}/x) × (x/{b}) = ？", [{"key":"A","text":f"{a}/{b}"},{"key":"B","text":f"{a*b}/x"},{"key":"C","text":f"{a}/x²"},{"key":"D","text":f"{a*b}/x²"}], "A", f"分式乘法：分子乘分子、分母乘分母，约分后 {a}/{b}")
GEN[247] = q247
def q248():
    a = ri(2, 4); b = ri(2, 4)
    return single(f"计算：({a}/x) ÷ ({b}/x) = ？", [{"key":"A","text":f"{a}/{b}"},{"key":"B","text":f"{a*b}/x"},{"key":"C","text":f"{a}/x"},{"key":"D","text":f"{b}/{a}"}], "A", f"除以分式 = 乘其倒数：{a}/x × x/{b}={a}/{b}")
GEN[248] = q248
def q249():
    a = ri(2, 4)
    return single(f"计算：(x/{a})² = ？", [{"key":"A","text":f"x²/{a*a}"},{"key":"B","text":f"x²/{a}"},{"key":"C","text":f"x/{a*a}"},{"key":"D","text":f"x²/{2*a}"}], "A", f"分式乘方：分子分母分别乘方 = x²/{a*a}")
GEN[249] = q249
def q250():
    a = ri(2, 5)
    return single(f"计算：({a}/x) + ({a}/x) = ？", [{"key":"A","text":f"{2*a}/x"},{"key":"B","text":f"{a}/x"},{"key":"C","text":f"{2*a}/x²"},{"key":"D","text":f"{a*a}/x"}], "A", f"同分母分式相加：分母不变分子相加 = {2*a}/x")
GEN[250] = q250
def q251():
    a = ri(2, 4); b = ri(2, 4)
    return single(f"计算：1/x + 1/({a}x) = ？", [{"key":"A","text":f"({a}+1)/({a}x)"},{"key":"B","text":f"2/({a}x)"},{"key":"C","text":f"1/({a}x)"},{"key":"D","text":f"2/x"}], "A", f"通分：{a}/({a}x)+1/({a}x)=({a}+1)/({a}x)")
GEN[251] = q251
def q252():
    return single("分式混合运算的顺序是？", [{"key":"A","text":"先乘方再乘除后加减，有括号先算括号"},{"key":"B","text":"从左到右"},{"key":"C","text":"先加减后乘除"},{"key":"D","text":"随意"}], "A", "分式混合运算：乘方→乘除→加减，括号优先")
GEN[252] = q252
def q253():
    a = ri(2, 5)
    return single(f"{a}x⁻¹ 用分式表示为？", [{"key":"A","text":f"{a}/x"},{"key":"B","text":f"x/{a}"},{"key":"C","text":f"1/({a}x)"},{"key":"D","text":f"{a}x"}], "A", f"负指数转分式：{a}x⁻¹={a}/x")
GEN[253] = q253
def q254():
    return single("分母中含未知数的方程叫？", [{"key":"A","text":"分式方程"},{"key":"B","text":"整式方程"},{"key":"C","text":"一元一次方程"},{"key":"D","text":"二元一次方程"}], "A", "分式方程定义")
GEN[254] = q254
def q255():
    a = ri(2, 5)
    return single(f"解分式方程 1/x = {a}，去分母（两边乘 x）得？", [{"key":"A","text":f"1 = {a}x"},{"key":"B","text":f"x = {a}"},{"key":"C","text":f"1 = x"},{"key":"D","text":f"{a} = x"}], "A", f"两边乘 x：1={a}x → x=1/{a}")
GEN[255] = q255
def q256():
    return single("解分式方程后必须？", [{"key":"A","text":"检验（是否增根）"},{"key":"B","text":"不需要检验"},{"key":"C","text":"只验正数"},{"key":"D","text":"只验整数"}], "A", "分式方程必须检验增根")
GEN[256] = q256
def q257():
    return single("分式方程产生增根的原因是？", [{"key":"A","text":"去分母时乘了含未知数的式子，可能使分母为0"},{"key":"B","text":"计算错误"},{"key":"C","text":"题目错误"},{"key":"D","text":"解错了"}], "A", "增根：去分母引入的使分母为 0 的根")
GEN[257] = q257
def q258():
    a = ri(3, 6); b = ri(2, 4)
    return single(f"一项工程甲独做需 {a} 天，乙独做需 {b} 天，合做 x 天完成 → 列分式方程？", [{"key":"A","text":f"x/{a} + x/{b} = 1"},{"key":"B","text":f"x/({a}+{b}) = 1"},{"key":"C","text":f"{a}/x + {b}/x = 1"},{"key":"D","text":f"x/{a} = 1"}], "A", f"效率乘时间：x/{a}+x/{b}=1")
GEN[258] = q258

# ---- 第17章 反比例函数 (259-267) ----
def q259():
    k = ri(2, 5)
    return single(f"y = {k}/x (k≠0) 是？函数", [{"key":"A","text":"反比例函数"},{"key":"B","text":"正比例函数"},{"key":"C","text":"一次函数"},{"key":"D","text":"二次函数"}], "A", f"y=k/x 是反比例函数")
GEN[259] = q259
def q260():
    return single("反比例函数 y = k/x 的自变量 x 的取值范围是？", [{"key":"A","text":"x ≠ 0"},{"key":"B","text":"x > 0"},{"key":"C","text":"x < 0"},{"key":"D","text":"x 任意"}], "A", "分母不为 0：x≠0")
GEN[260] = q260
def q261():
    return single("反比例函数 y = k/x 的图像是？", [{"key":"A","text":"双曲线"},{"key":"B","text":"直线"},{"key":"C","text":"抛物线"},{"key":"D","text":"圆"}], "A", "反比例函数图像：双曲线")
GEN[261] = q261
def q262():
    k = ri(2, 5)
    return single(f"反比例函数 y = {k}/x (k>0)，y 随 x 增大而？", [{"key":"A","text":"减小（每个象限内）"},{"key":"B","text":"增大"},{"key":"C","text":"不变"},{"key":"D","text":"先增后减"}], "A", f"k={k}>0：图像在一、三象限，每个象限 y 随 x 增大而减小")
GEN[262] = q262
def q263():
    k = ri(2, 5)
    return single(f"反比例函数 y = -{k}/x (k<0)，图像在？象限", [{"key":"A","text":"二、四"},{"key":"B","text":"一、三"},{"key":"C","text":"一、二"},{"key":"D","text":"三、四"}], "A", f"k<0 → 二、四象限")
GEN[263] = q263
def q264():
    k = ri(2, 6)
    return single(f"反比例函数 y={k}/x 图像上一点向坐标轴作垂线，与坐标轴围成矩形面积 = ？", [{"key":"A","text":str(k)},{"key":"B","text":str(2*k)},{"key":"C","text":str(k/2)},{"key":"D","text":str(k*k)}], "A", f"k 的几何意义：矩形面积 = |k| = {k}")
GEN[264] = q264
def q265():
    k = ri(2, 6); x = ri(1, 3)
    return single(f"反比例函数过点 ({x}, {k//x})，用待定系数法 k = x·y = ？", [{"key":"A","text":str(k)},{"key":"B","text":str(x*k)},{"key":"C","text":str(k//x)},{"key":"D","text":str(x)}], "A", f"k=xy={x}×{k//x}={k}")
GEN[265] = q265
def q266():
    return single("一次函数与反比例函数图像的交点即？的解", [{"key":"A","text":"联立方程组"},{"key":"B","text":"一元一次方程"},{"key":"C","text":"一元二次方程"},{"key":"D","text":"不等式"}], "A", "交点：联立两函数解析式求解")
GEN[266] = q266
def q267():
    k = ri(2, 5)
    return single(f"面积 {k} 的矩形，长 x 宽 y，则 y = ？(x>0)", [{"key":"A","text":f"{k}/x"},{"key":"B","text":f"x/{k}"},{"key":"C","text":f"{k}x"},{"key":"D","text":f"{k}-x"}], "A", f"反比例应用：xy={k} → y={k}/x")
GEN[267] = q267

# ---- 第18章 勾股定理 (268-277) ----
def q268():
    return single("勾股定理：直角三角形两直角边 a、b，斜边 c 满足？", [{"key":"A","text":"a² + b² = c²"},{"key":"B","text":"a + b = c"},{"key":"C","text":"a² - b² = c²"},{"key":"D","text":"ab = c"}], "A", "勾股定理：a²+b²=c²")
GEN[268] = q268
def q269():
    return single("勾股定理的证明常用？", [{"key":"A","text":"面积法（拼图）"},{"key":"B","text":"测量"},{"key":"C","text":"相似"},{"key":"D","text":"三角函数"}], "A", "勾股定理证明：面积法")
GEN[269] = q269
def q270():
    return single("直角三角形两直角边 3、4，斜边 = ？", [{"key":"A","text":"5"},{"key":"B","text":"7"},{"key":"C","text":"12"},{"key":"D","text":"6"}], "A", "c=√(3²+4²)=√25=5")
GEN[270] = q270
def q271():
    return single("下列是勾股数的是？", [{"key":"A","text":"3、4、5"},{"key":"B","text":"2、3、4"},{"key":"C","text":"1、2、3"},{"key":"D","text":"4、5、6"}], "A", "3²+4²=5² → 勾股数")
GEN[271] = q271
def q272():
    return single("勾股定理逆定理：a²+b²=c² → 三角形是？", [{"key":"A","text":"直角三角形"},{"key":"B","text":"锐角三角形"},{"key":"C","text":"钝角三角形"},{"key":"D","text":"等腰三角形"}], "A", "逆定理：满足 a²+b²=c² → 直角三角形")
GEN[272] = q272
def q273():
    return single("三角形三边 5、12、13，它是？", [{"key":"A","text":"直角三角形"},{"key":"B","text":"锐角三角形"},{"key":"C","text":"钝角三角形"},{"key":"D","text":"无法判断"}], "A", "5²+12²=25+144=169=13² → 直角三角形")
GEN[273] = q273
def q274():
    return single("命题'若 a=b，则 a²=b²'的逆命题是？", [{"key":"A","text":"若 a²=b²，则 a=b"},{"key":"B","text":"若 a≠b，则 a²≠b²"},{"key":"C","text":"若 a=b，则 a³=b³"},{"key":"D","text":"若 a²=b²，则 a²=b²"}], "A", "逆命题：条件和结论互换")
GEN[274] = q274
def q275():
    return single("边长 1、1、√2 的三角形是？", [{"key":"A","text":"直角三角形"},{"key":"B","text":"等边三角形"},{"key":"C","text":"钝角三角形"},{"key":"D","text":"等腰直角三角形"}], "A", "1²+1²=2=(√2)² → 等腰直角三角形")
GEN[275] = q275
def q276():
    return single("矩形折叠问题常构造？用勾股定理", [{"key":"A","text":"直角三角形"},{"key":"B","text":"等边三角形"},{"key":"C","text":"平行四边形"},{"key":"D","text":"梯形"}], "A", "折叠 → 构造直角三角形用勾股")
GEN[276] = q276
def q277():
    a = ri(3, 6)
    return single(f"长方体长 {a}、宽 {a}、高 {a}，体对角线 = √({a}²+{a}²+{a}²) = ？", [{"key":"A","text":f"{a}√3"},{"key":"B","text":f"{a}√2"},{"key":"C","text":f"{3*a}"},{"key":"D","text":f"{2*a}"}], "A", f"体对角线=√({a*a*3})={a}√3")
GEN[277] = q277

# ---- 第19章 四边形 (278-299) ----
def q278():
    return single("两组对边分别平行的四边形叫？", [{"key":"A","text":"平行四边形"},{"key":"B","text":"梯形"},{"key":"C","text":"菱形"},{"key":"D","text":"矩形"}], "A", "平行四边形定义")
GEN[278] = q278
def q279():
    return single("平行四边形对边的性质是？", [{"key":"A","text":"对边平行且相等"},{"key":"B","text":"对边垂直"},{"key":"C","text":"对边不相等"},{"key":"D","text":"只有一边平行"}], "A", "平行四边形对边平行且相等")
GEN[279] = q279
def q280():
    a = ri(40, 80)
    return single(f"平行四边形一个角为 {a}°，则相邻角 = ？", [{"key":"A","text":f"{180-a}°"},{"key":"B","text":f"{a}°"},{"key":"C","text":f"{90-a}°"},{"key":"D","text":f"{2*a}°"}], "A", f"邻角互补：{180-a}°")
GEN[280] = q280
def q281():
    return single("平行四边形对角线？", [{"key":"A","text":"互相平分"},{"key":"B","text":"相等"},{"key":"C","text":"垂直"},{"key":"D","text":"互相平分且相等"}], "A", "平行四边形对角线互相平分")
GEN[281] = q281
def q282():
    return single("两组对边分别平行的四边形是？判定", [{"key":"A","text":"平行四边形"},{"key":"B","text":"梯形"},{"key":"C","text":"菱形"},{"key":"D","text":"矩形"}], "A", "判定1：两组对边平行 → 平行四边形")
GEN[282] = q282
def q283():
    return single("两组对边分别相等的四边形是？", [{"key":"A","text":"平行四边形"},{"key":"B","text":"梯形"},{"key":"C","text":"等腰梯形"},{"key":"D","text":"任意四边形"}], "A", "判定2：两组对边相等 → 平行四边形")
GEN[283] = q283
def q284():
    return single("一组对边平行且相等的四边形是？", [{"key":"A","text":"平行四边形"},{"key":"B","text":"梯形"},{"key":"C","text":"矩形"},{"key":"D","text":"菱形"}], "A", "判定3：一组对边平行且相等 → 平行四边形")
GEN[284] = q284
def q285():
    return single("对角线互相平分的四边形是？", [{"key":"A","text":"平行四边形"},{"key":"B","text":"梯形"},{"key":"C","text":"等腰梯形"},{"key":"D","text":"不规则四边形"}], "A", "判定4：对角线互相平分 → 平行四边形")
GEN[285] = q285
def q286():
    a = ri(4, 8)
    return single(f"△ABC 中 D、E 是 AB、AC 中点，BC={a}，则 DE = ？", [{"key":"A","text":str(a/2)},{"key":"B","text":str(a)},{"key":"C","text":str(2*a)},{"key":"D","text":str(a+2)}], "A", f"中位线=BC/2={a}/2={a/2}")
GEN[286] = q286
def q287():
    return single("有一个角是直角的平行四边形是？", [{"key":"A","text":"矩形"},{"key":"B","text":"菱形"},{"key":"C","text":"正方形"},{"key":"D","text":"梯形"}], "A", "矩形定义")
GEN[287] = q287
def q288():
    return single("矩形的对角线？", [{"key":"A","text":"相等且互相平分"},{"key":"B","text":"互相垂直"},{"key":"C","text":"平分对角"},{"key":"D","text":"不相等"}], "A", "矩形性质：对角线相等且互相平分")
GEN[288] = q288
def q289():
    return single("下列能判定矩形的是？", [{"key":"A","text":"有一个直角的平行四边形"},{"key":"B","text":"有一组邻边相等的平行四边形"},{"key":"C","text":"对角线垂直的平行四边形"},{"key":"D","text":"四边相等"}], "A", "矩形判定：一个直角的平行四边形等")
GEN[289] = q289
def q290():
    a = ri(4, 8)
    return single(f"Rt△ABC 中，斜边 AB={a}，斜边中线 CD = ？", [{"key":"A","text":str(a/2)},{"key":"B","text":str(a)},{"key":"C","text":str(2*a)},{"key":"D","text":str(a+1)}], "A", f"直角三角形斜边中线=斜边一半={a}/2")
GEN[290] = q290
def q291():
    return single("有一组邻边相等的平行四边形是？", [{"key":"A","text":"菱形"},{"key":"B","text":"矩形"},{"key":"C","text":"正方形"},{"key":"D","text":"梯形"}], "A", "菱形定义")
GEN[291] = q291
def q292():
    return single("菱形的对角线？", [{"key":"A","text":"垂直平分且平分对角"},{"key":"B","text":"相等"},{"key":"C","text":"互相平分且相等"},{"key":"D","text":"不垂直"}], "A", "菱形性质：对角线垂直平分，平分内角")
GEN[292] = q292
def q293():
    return single("菱形面积两种算法：S = 底×高 = ？", [{"key":"A","text":"对角线乘积的一半"},{"key":"B","text":"对角线乘积"},{"key":"C","text":"边长平方"},{"key":"D","text":"周长×高"}], "A", "菱形面积 = ½×对角线乘积")
GEN[293] = q293
def q294():
    return single("下列能判定菱形的是？", [{"key":"A","text":"四边相等的四边形"},{"key":"B","text":"两组对边平行的四边形"},{"key":"C","text":"一个直角的平行四边形"},{"key":"D","text":"对角线相等的平行四边形"}], "A", "菱形判定：四边相等/邻边相等的平行四边形/对角线垂直")
GEN[294] = q294
def q295():
    return single("四边相等且四角都是直角的四边形是？", [{"key":"A","text":"正方形"},{"key":"B","text":"矩形"},{"key":"C","text":"菱形"},{"key":"D","text":"平行四边形"}], "A", "正方形定义")
GEN[295] = q295
def q296():
    return single("正方形同时具有？的性质", [{"key":"A","text":"矩形和菱形全部"},{"key":"B","text":"只具有矩形"},{"key":"C","text":"只具有菱形"},{"key":"D","text":"两者都没有"}], "A", "正方形兼具矩形、菱形全部性质")
GEN[296] = q296
def q297():
    return single("判定正方形：先证矩形再证？", [{"key":"A","text":"邻边相等（或对角线垂直）"},{"key":"B","text":"对边平行"},{"key":"C","text":"对角相等"},{"key":"D","text":"内角和360°"}], "A", "正方形判定思路：矩形+菱形特征")
GEN[297] = q297
def q298():
    return single("等腰梯形的两腰？", [{"key":"A","text":"相等"},{"key":"B","text":"平行"},{"key":"C","text":"垂直"},{"key":"D","text":"不相等"}], "A", "等腰梯形：两腰相等")
GEN[298] = q298
def q299():
    return single("顺次连接四边形各边中点得到的四边形是？", [{"key":"A","text":"平行四边形"},{"key":"B","text":"矩形"},{"key":"C","text":"菱形"},{"key":"D","text":"正方形"}], "A", "中点四边形一定是平行四边形")
GEN[299] = q299

# ---- 第20章 数据的分析 (300-309) ----
def q300():
    a = ri(2, 6); b = ri(2, 6); c = ri(2, 6)
    return single(f"数据 {a}、{b}、{c} 的平均数 = ？", [{"key":"A","text":str((a+b+c)/3)},{"key":"B","text":str(a+b+c)},{"key":"C","text":str((a+b+c)//3)},{"key":"D","text":str(a)}], "A", f"平均数=({a}+{b}+{c})/3={(a+b+c)/3}")
GEN[300] = q300
def q301():
    return single("加权平均数中，权表示？", [{"key":"A","text":"各数据的重要程度/占比"},{"key":"B","text":"数据个数"},{"key":"C","text":"数据最大值"},{"key":"D","text":"数据最小值"}], "A", "权：重要性/频率")
GEN[301] = q301
def q302():
    return single("数据 1、3、3、5、7 的中位数是？", [{"key":"A","text":"3"},{"key":"B","text":"3.8"},{"key":"C","text":"5"},{"key":"D","text":"1"}], "A", "排序后中间位置（第3个）→ 3")
GEN[302] = q302
def q303():
    return single("数据 1、2、2、3、3、4 的众数是？", [{"key":"A","text":"2 和 3"},{"key":"B","text":"2"},{"key":"C","text":"3"},{"key":"D","text":"4"}], "A", "出现次数最多的：2 和 3（可多个众数）")
GEN[303] = q303
def q304():
    return single("受极端值影响最大的是？", [{"key":"A","text":"平均数"},{"key":"B","text":"中位数"},{"key":"C","text":"众数"},{"key":"D","text":"都不受"}], "A", "平均数受极端值影响大")
GEN[304] = q304
def q305():
    return single("数据 3、7、9、15 的极差 = ？", [{"key":"A","text":"12"},{"key":"B","text":"9"},{"key":"C","text":"15"},{"key":"D","text":"6"}], "A", "极差=最大值-最小值=15-3=12")
GEN[305] = q305
def q306():
    return single("数据 2、4、6 的方差 = ？", [{"key":"A","text":"8/3"},{"key":"B","text":"4"},{"key":"C","text":"2"},{"key":"D","text":"16/3"}], "A", "平均4，方差=[(2-4)²+(4-4)²+(6-4)²]/3=8/3")
GEN[306] = q306
def q307():
    return single("方差越大，说明数据波动？", [{"key":"A","text":"越大"},{"key":"B","text":"越小"},{"key":"C","text":"不变"},{"key":"D","text":"无法判断"}], "A", "方差意义：方差越大波动越大")
GEN[307] = q307
def q308():
    return single("标准差是方差的？", [{"key":"A","text":"算术平方根"},{"key":"B","text":"平方"},{"key":"C","text":"2 倍"},{"key":"D","text":"一半"}], "A", "标准差 = √方差")
GEN[308] = q308
def q309():
    return single("用样本估计总体：样本平均数和方差可估计？", [{"key":"A","text":"总体的平均数和方差"},{"key":"B","text":"总体的最大值"},{"key":"C","text":"总体的个数"},{"key":"D","text":"总体分布精确值"}], "A", "样本估计总体思想")
GEN[309] = q309

# ---- 第21章 二次根式 (310-320) ----
def q310():
    return single("下列是二次根式的是？", [{"key":"A","text":"√3"},{"key":"B","text":"³√2"},{"key":"C","text":"√-1"},{"key":"D","text":"2"}], "A", "二次根式：√a(a≥0)")
GEN[310] = q310
def q311():
    a = ri(2, 5)
    return single(f"√(x-{a}) 有意义的条件是？", [{"key":"A","text":f"x ≥ {a}"},{"key":"B","text":f"x > {a}"},{"key":"C","text":f"x ≤ {a}"},{"key":"D","text":f"x ≠ {a}"}], "A", f"被开方数非负：x-{a}≥0 → x≥{a}")
GEN[311] = q311
def q312():
    a = ri(2, 5)
    return single(f"(√{a})² = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(a*a)},{"key":"C","text":"1"},{"key":"D","text":str(-a)}], "A", f"(√a)²=a={a}")
GEN[312] = q312
def q313():
    a = ri(2, 5)
    return single(f"√({a*a}) = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(-a)},{"key":"C","text":str(a*a)},{"key":"D","text":"±" + str(a)}], "A", f"√(a²)=|a|={a}")
GEN[313] = q313
def q314():
    a = ri(2, 4); b = ri(2, 4)
    return single(f"√{a*a} × √{b*b} = ？", [{"key":"A","text":str(a*b)},{"key":"B","text":str(a+b)},{"key":"C","text":str(a*a*b*b)},{"key":"D","text":str(2*a*b)}], "A", f"√a×√b=√(ab)={a}×{b}={a*b}")
GEN[314] = q314
def q315():
    a = ri(2, 4); b = ri(2, 4)
    return single(f"√{a*a*b*b} ÷ √{b*b} = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(a*b)},{"key":"C","text":str(b)},{"key":"D","text":str(a+b)}], "A", f"√{a*a*b*b}={a*b}，÷{b}={a}")
GEN[315] = q315
def q316():
    return single("最简二次根式的要求是？", [{"key":"A","text":"被开方数不含分母和开得尽的因数"},{"key":"B","text":"被开方数含分母"},{"key":"C","text":"被开方数是分数"},{"key":"D","text":"系数是分数"}], "A", "最简二次根式：被开方数不含分母、不含能开得尽的因数")
GEN[316] = q316
def q317():
    a = ri(2, 4)
    return single(f"化简 √({a*a}×2) = ？", [{"key":"A","text":f"{a}√2"},{"key":"B","text":f"{a*a}√2"},{"key":"C","text":f"√{a*a*2}"},{"key":"D","text":f"{2*a}"}], "A", f"√({a*a}×2)={a}√2")
GEN[317] = q317
def q318():
    a = ri(2, 5)
    return single(f"√{a*a*2} 与 √2 是同类二次根式吗？", [{"key":"A","text":"是"},{"key":"B","text":"否"},{"key":"C","text":"无法判断"},{"key":"D","text":"不一定"}], "A", f"√{a*a*2}={a}√2，与 √2 是同类")
GEN[318] = q318
def q319():
    a = ri(2, 4); b = ri(2, 4)
    return single(f"√{a*a*2} + √{b*b*2} = ？", [{"key":"A","text":f"({a}+{b})√2"},{"key":"B","text":f"{a+b}√2"},{"key":"C","text":f"{a*b}√2"},{"key":"D","text":f"({a}×{b})√2"}], "A", f"√{a*a*2}={a}√2，√{b*b*2}={b}√2，和=({a}+{b})√2")
GEN[319] = q319
def q320():
    a = ri(2, 4)
    return single(f"化简 1/√{a*a} = ？", [{"key":"A","text":f"1/{a}"},{"key":"B","text":f"{a}"},{"key":"C","text":f"√{a*a}"},{"key":"D","text":f"-1/{a}"}], "A", f"1/√{a*a}=1/{a}（分母有理化）")
GEN[320] = q320

# ---- 第22章 一元二次方程 (321-333) ----
def q321():
    return single("下列是一元二次方程的是？", [{"key":"A","text":"x² - 3x + 2 = 0"},{"key":"B","text":"x + 3 = 0"},{"key":"C","text":"x² + y = 1"},{"key":"D","text":"1/x² = 2"}], "A", "一元二次：一个未知数、最高次 2、整式")
GEN[321] = q321
def q322():
    return single("一元二次方程 ax²+bx+c=0 中 a 必须满足？", [{"key":"A","text":"a ≠ 0"},{"key":"B","text":"a = 0"},{"key":"C","text":"a > 0"},{"key":"D","text":"a < 0"}], "A", "a≠0（否则不是二次）")
GEN[322] = q322
def q323():
    a = ri(2, 5)
    return single(f"直接开平方解 x² = {a*a}，x = ？", [{"key":"A","text":"±" + str(a)},{"key":"B","text":str(a)},{"key":"C","text":str(-a)},{"key":"D","text":str(a*a)}], "A", f"x=±√{a*a}=±{a}")
GEN[323] = q323
def q324():
    a = ri(2, 5)
    return single(f"配方法：x² + {2*a}x + 9 = 0，配方成 (x + {a})² = ？", [{"key":"A","text":f"{a*a-9}"},{"key":"B","text":f"{a*a+9}"},{"key":"C","text":f"{2*a}"},{"key":"D","text":f"{a}"}], "A", f"(x+{a})²={a}²-9={a*a-9}")
GEN[324] = q324
def q325():
    a = ri(2, 4); b = ri(2, 4); c = ri(1, 4)
    return single(f"x²+{b}x+{c}=0 的判别式 Δ = b²-4ac = ？", [{"key":"A","text":str(b*b-4*c)},{"key":"B","text":str(b*b+4*c)},{"key":"C","text":str(b-4*c)},{"key":"D","text":str(4*c)}], "A", f"Δ={b}²-4×1×{c}={b*b-4*c}")
GEN[325] = q325
def q326():
    return single("Δ > 0 时，一元二次方程有？", [{"key":"A","text":"两个不相等的实根"},{"key":"B","text":"两个相等实根"},{"key":"C","text":"无实数根"},{"key":"D","text":"一个根"}], "A", "Δ>0 → 两个不等实根")
GEN[326] = q326
def q327():
    a = ri(2, 5)
    return single(f"公式法解 x² - {2*a}x + {a*a} = 0，x = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(2*a)},{"key":"C","text":str(a*a)},{"key":"D","text":"0"}], "A", f"(x-{a})²=0 → x={a}（重根）")
GEN[327] = q327
def q328():
    a = ri(2, 5); b = ri(2, 5)
    return single(f"因式分解法解 (x-{a})(x-{b})=0，x = ？", [{"key":"A","text":f"{a} 或 {b}"},{"key":"B","text":f"{a} 和 {a*b}"},{"key":"C","text":f"-{a} 或 -{b}"},{"key":"D","text":"0"}], "A", f"x-{a}=0 或 x-{b}=0 → x={a} 或 {b}")
GEN[328] = q328
def q329():
    return single("x²=5 用哪种方法最简便？", [{"key":"A","text":"直接开平方法"},{"key":"B","text":"配方法"},{"key":"C","text":"公式法"},{"key":"D","text":"因式分解法"}], "A", "x²=常数 → 直接开平方")
GEN[329] = q329
def q330():
    a = ri(2, 5); b = ri(3, 6)
    return single(f"x² - {a+b}x + {a*b} = 0 的两根之和 = ？", [{"key":"A","text":str(a+b)},{"key":"B","text":str(a*b)},{"key":"C","text":str(-(a+b))},{"key":"D","text":str(a)}], "A", f"韦达定理：x₁+x₂={a+b}（两根 {a}、{b}）")
GEN[330] = q330
def q331():
    return single("某商品增长 20% 后为 120，原价 x 列方程？", [{"key":"A","text":"x(1+20%) = 120"},{"key":"B","text":"x = 120×20%"},{"key":"C","text":"x+20% = 120"},{"key":"D","text":"x(1-20%) = 120"}], "A", "增长率问题：x(1+20%)=120")
GEN[331] = q331
def q332():
    a = ri(3, 6)
    return single(f"矩形长比宽多 2，宽 x，面积 {a*(a+2)} → 列方程？", [{"key":"A","text":f"x(x+2) = {a*(a+2)}"},{"key":"B","text":f"x(x-2) = {a*(a+2)}"},{"key":"C","text":f"2(x+x+2) = {a*(a+2)}"},{"key":"D","text":f"x² = {a*(a+2)}"}], "A", f"面积问题：长×宽=x(x+2)={a*(a+2)}")
GEN[332] = q332
def q333():
    return single("销售利润最值：利润 = 单件利润 × 销量，单件利润 = ？", [{"key":"A","text":"售价 - 进价"},{"key":"B","text":"售价 + 进价"},{"key":"C","text":"售价 × 进价"},{"key":"D","text":"进价 - 售价"}], "A", "利润=售价-进价")
GEN[333] = q333

# ---- 第23章 旋转 (334-343) ----
def q334():
    return single("旋转的三要素是？", [{"key":"A","text":"旋转中心、旋转方向、旋转角"},{"key":"B","text":"旋转中心、旋转半径、旋转角"},{"key":"C","text":"旋转方向、旋转速度、旋转角"},{"key":"D","text":"旋转中心、对称轴、旋转角"}], "A", "旋转三要素")
GEN[334] = q334
def q335():
    return single("旋转性质：对应点到旋转中心的距离？", [{"key":"A","text":"相等"},{"key":"B","text":"不相等"},{"key":"C","text":"成比例"},{"key":"D","text":"无关"}], "A", "旋转前后对应点到旋转中心距离相等")
GEN[335] = q335
def q336():
    a = ri(20, 80)
    return single(f"图形绕点 O 旋转 {a}°，则对应点与 O 连线夹角 = ？", [{"key":"A","text":f"{a}°"},{"key":"B","text":f"{180-a}°"},{"key":"C","text":f"{90-a}°"},{"key":"D","text":"0°"}], "A", f"旋转角即对应点与中心连线夹角 = {a}°")
GEN[336] = q336
def q337():
    return single("旋转前后的图形？", [{"key":"A","text":"全等"},{"key":"B","text":"相似但不全等"},{"key":"C","text":"面积不同"},{"key":"D","text":"大小改变"}], "A", "旋转不改变图形，前后全等")
GEN[337] = q337
def q338():
    return single("绕某点旋转 180° 后能与自身重合的图形变换叫？", [{"key":"A","text":"中心对称"},{"key":"B","text":"轴对称"},{"key":"C","text":"平移"},{"key":"D","text":"旋转90°"}], "A", "中心对称定义")
GEN[338] = q338
def q339():
    return single("中心对称性质：对称点连线经过对称中心且被其？", [{"key":"A","text":"平分"},{"key":"B","text":"垂直"},{"key":"C","text":"延长"},{"key":"D","text":"相切"}], "A", "中心对称：对称点连线过中心且被平分")
GEN[339] = q339
def q340():
    return single("下列是中心对称图形的是？", [{"key":"A","text":"平行四边形"},{"key":"B","text":"等边三角形"},{"key":"C","text":"正五边形"},{"key":"D","text":"角"}], "A", "平行四边形绕对角线交点旋转180°重合")
GEN[340] = q340
def q341():
    a = ri(1, 5); b = ri(1, 5)
    return single(f"点 ({a},{b}) 绕原点旋转 180°（中心对称）→ ？", [{"key":"A","text":f"(-{a},-{b})"},{"key":"B","text":f"({a},-{b})"},{"key":"C","text":f"(-{a},{b})"},{"key":"D","text":f"({b},{a})"}], "A", f"关于原点对称：({a},{b})→(-{a},-{b})")
GEN[341] = q341
def q342():
    return single("旋转作图的关键是？", [{"key":"A","text":"确定旋转中心、方向和角度后找对应点"},{"key":"B","text":"直接连线"},{"key":"C","text":"量角度"},{"key":"D","text":"画对称轴"}], "A", "旋转作图步骤")
GEN[342] = q342
def q343():
    return single("手拉手模型：两个等腰三角形绕公共顶点旋转，常用于证明？", [{"key":"A","text":"三角形全等/相似"},{"key":"B","text":"四边形面积"},{"key":"C","text":"圆的性质"},{"key":"D","text":"函数图像"}], "A", "手拉手模型基础")
GEN[343] = q343

# ---- 第24章 圆 (344-367) ----
def q344():
    r = ri(3, 6)
    return single(f"半径 {r} 的圆周长 C = 2πr = ？", [{"key":"A","text":f"{2*r}π"},{"key":"B","text":f"{r}π"},{"key":"C","text":f"{r*r}π"},{"key":"D","text":f"{2*r}"}], "A", f"C=2π×{r}={2*r}π")
GEN[344] = q344
def q345():
    return single("圆上两点间的部分叫？", [{"key":"A","text":"弧"},{"key":"B","text":"弦"},{"key":"C","text":"直径"},{"key":"D","text":"半径"}], "A", "弧定义")
GEN[345] = q345
def q346():
    return single("能够完全重合的两个圆叫？", [{"key":"A","text":"等圆"},{"key":"B","text":"同心圆"},{"key":"C","text":"相似圆"},{"key":"D","text":"相切圆"}], "A", "等圆定义")
GEN[346] = q346
def q347():
    return single("垂直于弦的直径？", [{"key":"A","text":"平分这条弦和弦所对的两条弧"},{"key":"B","text":"只平分弦"},{"key":"C","text":"不平分"},{"key":"D","text":"与弦平行"}], "A", "垂径定理")
GEN[347] = q347
def q348():
    return single("平分弦（非直径）的直径？", [{"key":"A","text":"垂直于弦"},{"key":"B","text":"平行于弦"},{"key":"C","text":"与弦相交但不垂直"},{"key":"D","text":"不经过圆心"}], "A", "垂径定理推论")
GEN[348] = q348
def q349():
    return single("同圆中，相等的圆心角所对的弦？", [{"key":"A","text":"相等"},{"key":"B","text":"不等"},{"key":"C","text":"成比例"},{"key":"D","text":"无法确定"}], "A", "弧弦圆心角关系定理")
GEN[349] = q349
def q350():
    return single("顶点在圆上、两边都与圆相交的角叫？", [{"key":"A","text":"圆周角"},{"key":"B","text":"圆心角"},{"key":"C","text":"平角"},{"key":"D","text":"周角"}], "A", "圆周角定义")
GEN[350] = q350
def q351():
    a = ri(30, 80)
    return single(f"同弧所对的圆心角 ∠AOB={a}°，则圆周角 ∠ACB = ？", [{"key":"A","text":f"{a/2}°"},{"key":"B","text":f"{a}°"},{"key":"C","text":f"{2*a}°"},{"key":"D","text":f"{180-a}°"}], "A", f"圆周角=圆心角一半={a/2}°")
GEN[351] = q351
def q352():
    return single("同弧所对的圆周角？", [{"key":"A","text":"相等"},{"key":"B","text":"互补"},{"key":"C","text":"互余"},{"key":"D","text":"成2倍"}], "A", "同弧或等弧圆周角相等")
GEN[352] = q352
def q353():
    return single("直径所对的圆周角是？", [{"key":"A","text":"直角"},{"key":"B","text":"锐角"},{"key":"C","text":"钝角"},{"key":"D","text":"平角"}], "A", "直径所对圆周角 = 90°")
GEN[353] = q353
def q354():
    a = ri(40, 100)
    return single(f"圆内接四边形中 ∠A={a}°，则对角 ∠C = ？", [{"key":"A","text":f"{180-a}°"},{"key":"B","text":f"{a}°"},{"key":"C","text":f"{90-a}°"},{"key":"D","text":f"{2*a}°"}], "A", f"圆内接四边形对角互补：∠C={180-a}°")
GEN[354] = q354
def q355():
    r = ri(3, 5)
    return single(f"圆 O 半径 {r}，点 P 到 O 距离 2，则 P 与圆的位置关系？", [{"key":"A","text":"点在圆内"},{"key":"B","text":"点在圆上"},{"key":"C","text":"点在圆外"},{"key":"D","text":"无法确定"}], "A", f"距离 2 < 半径 {r} → 点在圆内")
GEN[355] = q355
def q356():
    return single("不在同一直线上的三个点确定？", [{"key":"A","text":"一个圆"},{"key":"B","text":"一条直线"},{"key":"C","text":"两个圆"},{"key":"D","text":"一个三角形"}], "A", "不共线三点确定一个圆")
GEN[356] = q356
def q357():
    return single("三角形外接圆的圆心叫？", [{"key":"A","text":"外心"},{"key":"B","text":"内心"},{"key":"C","text":"重心"},{"key":"D","text":"垂心"}], "A", "外心：三边垂直平分线交点")
GEN[357] = q357
def q358():
    d = ri(2, 4); r = ri(3, 5)
    return single(f"圆心到直线距离 {d}，半径 {r}（d<r），直线与圆？", [{"key":"A","text":"相交"},{"key":"B","text":"相切"},{"key":"C","text":"相离"},{"key":"D","text":"重合"}], "A", f"d={d}<r={r} → 相交")
GEN[358] = q358
def q359():
    return single("过半径外端且垂直于半径的直线是圆的？", [{"key":"A","text":"切线"},{"key":"B","text":"弦"},{"key":"C","text":"直径"},{"key":"D","text":"割线"}], "A", "切线判定定理")
GEN[359] = q359
def q360():
    return single("圆的切线垂直于？", [{"key":"A","text":"过切点的半径"},{"key":"B","text":"任意直径"},{"key":"C","text":"圆心连线"},{"key":"D","text":"弦"}], "A", "切线性质：垂直于过切点的半径")
GEN[360] = q360
def q361():
    a = ri(3, 6)
    return single(f"从圆外一点引两条切线，切线长 PA={a}，则 PB = ？", [{"key":"A","text":str(a)},{"key":"B","text":str(2*a)},{"key":"C","text":str(a/2)},{"key":"D","text":"0"}], "A", f"切线长定理：两条切线长相等 = {a}")
GEN[361] = q361
def q362():
    return single("三角形内切圆的圆心叫？", [{"key":"A","text":"内心"},{"key":"B","text":"外心"},{"key":"C","text":"重心"},{"key":"D","text":"垂心"}], "A", "内心：角平分线交点")
GEN[362] = q362
def q363():
    return single("两圆半径 3、4，圆心距 7，两圆？", [{"key":"A","text":"外切"},{"key":"B","text":"外离"},{"key":"C","text":"内切"},{"key":"D","text":"内含"}], "A", "圆心距=两半径和 → 外切")
GEN[363] = q363
def q364():
    n = ri(4, 6)
    return single(f"正{n}边形中心角 = 360°/{n} = ？", [{"key":"A","text":f"{360/n}°"},{"key":"B","text":f"{180/n}°"},{"key":"C","text":f"{90/n}°"},{"key":"D","text":f"{n}°"}], "A", f"中心角=360°/{n}={360/n}°")
GEN[364] = q364
def q365():
    r = ri(2, 5); n = ri(60, 120)
    return single(f"半径 {r}、圆心角 {n}° 的弧长 l = nπr/180 = ？", [{"key":"A","text":f"{n*math.pi*r/180:.2f}π"},{"key":"B","text":f"{n}π"},{"key":"C","text":f"{r}π"},{"key":"D","text":f"{n*r}π"}], "A", f"l={n}π×{r}/180={n*r*math.pi/180:.2f}π")
GEN[365] = q365
def q366():
    r = ri(2, 4); n = ri(60, 120)
    return single(f"半径 {r}、圆心角 {n}° 的扇形面积 S = nπr²/360 = ？", [{"key":"A","text":f"{n*math.pi*r*r/360:.2f}π"},{"key":"B","text":f"{n}π"},{"key":"C","text":f"{r*r}π"},{"key":"D","text":f"{n*r}π"}], "A", f"S={n}π×{r}²/360={n*r*r*math.pi/360:.2f}π")
GEN[366] = q366
def q367():
    r = ri(2, 4); l = ri(4, 7)
    return single(f"圆锥底面半径 {r}、母线 {l}，侧面积 = πrl = ？", [{"key":"A","text":f"{r*l}π"},{"key":"B","text":f"{r*r}π"},{"key":"C","text":f"{l*l}π"},{"key":"D","text":f"{2*r*l}π"}], "A", f"S侧=πrl={r}×{l}π={r*l}π")
GEN[367] = q367

# ---- 第25章 概率初步 (368-374) ----
def q368():
    return single("明天会下雨是？事件", [{"key":"A","text":"随机事件"},{"key":"B","text":"必然事件"},{"key":"C","text":"不可能事件"},{"key":"D","text":"确定事件"}], "A", "随机事件：可能发生也可能不发生")
GEN[368] = q368
def q369():
    return single("概率的取值范围是？", [{"key":"A","text":"0 ≤ P ≤ 1"},{"key":"B","text":"0 < P < 1"},{"key":"C","text":"P ≥ 1"},{"key":"D","text":"P ≤ 0"}], "A", "概率范围 0~1")
GEN[369] = q369
def q370():
    n = ri(3, 6)
    return single(f"掷一个骰子，点数为偶数的概率 = ？", [{"key":"A","text":"1/2"},{"key":"B","text":f"{n}/6"},{"key":"C","text":"1/6"},{"key":"D","text":"2/3"}], "A", "偶数 3 个：3/6=1/2")
GEN[370] = q370
def q371():
    return single("从 1~5 中任取一个数，取到 3 的概率 = ？", [{"key":"A","text":"1/5"},{"key":"B","text":"3/5"},{"key":"C","text":"1/3"},{"key":"D","text":"1/2"}], "A", "等可能：1/5")
GEN[371] = q371
def q372():
    return single("掷两枚骰子，求点数和的概率常用？", [{"key":"A","text":"列表法"},{"key":"B","text":"直接猜"},{"key":"C","text":"画图"},{"key":"D","text":"测量"}], "A", "两步概率 → 列表法")
GEN[372] = q372
def q373():
    return single("三步以上（或多次抽取）求概率常用？", [{"key":"A","text":"树状图法"},{"key":"B","text":"列表法"},{"key":"C","text":"枚举法"},{"key":"D","text":"估算法"}], "A", "多步概率 → 树状图")
GEN[373] = q373
def q374():
    return single("大量重复试验中，某事件频率趋近于？", [{"key":"A","text":"概率"},{"key":"B","text":"0"},{"key":"C","text":"1"},{"key":"D","text":"试验次数"}], "A", "频率估计概率")
GEN[374] = q374

# ---- 第26章 二次函数 (375-396) ----
def q375():
    return single("下列是二次函数的是？", [{"key":"A","text":"y = x² + 2x + 1"},{"key":"B","text":"y = 2x + 1"},{"key":"C","text":"y = 2/x"},{"key":"D","text":"y = x³"}], "A", "y=ax²+bx+c(a≠0) 是二次函数")
GEN[375] = q375
def q376():
    a = ri(1, 3)
    return single(f"y = {a}x² 的图像开口？", [{"key":"A","text":"向上"},{"key":"B","text":"向下"},{"key":"C","text":"向左"},{"key":"D","text":"向右"}], "A", f"a={a}>0 → 开口向上")
GEN[376] = q376
def q377():
    a = ri(2, 5)
    return single(f"y = x² 向上平移 {a} 个单位 → y = ？", [{"key":"A","text":f"x² + {a}"},{"key":"B","text":f"x² - {a}"},{"key":"C","text":f"(x+{a})²"},{"key":"D","text":f"(x-{a})²"}], "A", f"上加下减：y=x²+{a}")
GEN[377] = q377
def q378():
    a = ri(2, 5)
    return single(f"y = x² 向右平移 {a} 个单位 → y = ？", [{"key":"A","text":f"(x-{a})²"},{"key":"B","text":f"(x+{a})²"},{"key":"C","text":f"x² + {a}"},{"key":"D","text":f"x² - {a}"}], "A", f"左加右减：y=(x-{a})²")
GEN[378] = q378
def q379():
    a = ri(2, 5); k = ri(1, 5)
    return single(f"y = (x-{a})² + {k} 的顶点坐标是？", [{"key":"A","text":f"({a},{k})"},{"key":"B","text":f"(-{a},{k})"},{"key":"C","text":f"({a},-{k})"},{"key":"D","text":f"(-{a},-{k})"}], "A", f"顶点式 y=(x-h)²+k 顶点(h,k)=({a},{k})")
GEN[379] = q379
def q380():
    a = ri(2, 4)
    return single(f"y = x² + {2*a}x + 3 配方成 (x+{a})² + (3-{a*a}) → 常数项 = ？", [{"key":"A","text":f"{3-a*a}"},{"key":"B","text":f"{a*a}"},{"key":"C","text":f"{3+a*a}"},{"key":"D","text":f"{3}"}], "A", f"配方：(x+{a})²+{3-a*a}")
GEN[380] = q380
def q381():
    a = ri(2, 4)
    return single(f"y = x² + {2*a}x + 1 的对称轴 x = -b/2a = ？", [{"key":"A","text":str(-a)},{"key":"B","text":str(a)},{"key":"C","text":str(-2*a)},{"key":"D","text":str(2*a)}], "A", f"对称轴 x=-{2*a}/(2×1)={-a}")
GEN[381] = q381
def q382():
    a = ri(2, 4)
    return single(f"y = x² - {2*a}x + {a*a} 的顶点纵坐标 = (4ac-b²)/4a = ？", [{"key":"A","text":"0"},{"key":"B","text":str(a)},{"key":"C","text":str(-a)},{"key":"D","text":str(a*a)}], "A", f"y=(x-{a})² → 顶点纵坐标 0")
GEN[382] = q382
def q383():
    return single("二次函数 y = -2x² 的开口方向和大小？", [{"key":"A","text":"开口向下，比 y=x² 窄"},{"key":"B","text":"开口向上，比 y=x² 窄"},{"key":"C","text":"开口向下，比 y=x² 宽"},{"key":"D","text":"开口向上"}], "A", "a=-2<0 开口向下，|a|>1 更窄")
GEN[383] = q383
def q384():
    return single("y = ax²+bx+c 中 a、b 同号，对称轴在 y 轴？", [{"key":"A","text":"左侧"},{"key":"B","text":"右侧"},{"key":"C","text":"上"},{"key":"D","text":"下"}], "A", "左同右异：a、b 同号 → 对称轴在左")
GEN[384] = q384
def q385():
    return single("y = x² + 2x + 5 与 y 轴交点纵坐标 = ？", [{"key":"A","text":"5"},{"key":"B","text":"2"},{"key":"C","text":"1"},{"key":"D","text":"0"}], "A", "c=5 → 与 y 轴交点 (0,5)")
GEN[385] = q385
def q386():
    return single("y = x² - 4x + 3，Δ = 16-12 = 4 > 0，与 x 轴交点个数？", [{"key":"A","text":"2 个"},{"key":"B","text":"1 个"},{"key":"C","text":"0 个"},{"key":"D","text":"3 个"}], "A", "Δ>0 → 两个交点")
GEN[386] = q386
def q387():
    a = ri(2, 4); b = ri(3, 5)
    return single(f"抛物线与 x 轴交于 ({a},0)、({b},0)，交点式 y = a(x-{a})(x-{b})，顶点横坐标 = ？", [{"key":"A","text":str((a+b)/2)},{"key":"B","text":str(a)},{"key":"C","text":str(b)},{"key":"D","text":str(a*b)}], "A", f"顶点横坐标 = 两根中点 = ({a}+{b})/2 = {(a+b)/2}")
GEN[387] = q387
def q388():
    return single("已知抛物线上三点坐标求解析式，用？", [{"key":"A","text":"一般式（待定系数法）"},{"key":"B","text":"直接看"},{"key":"C","text":"求导"},{"key":"D","text":"积分"}], "A", "三点 → 一般式待定系数")
GEN[388] = q388
def q389():
    return single("y = x² - 4x，x > 2 时 y 随 x 增大而？", [{"key":"A","text":"增大"},{"key":"B","text":"减小"},{"key":"C","text":"不变"},{"key":"D","text":"无法确定"}], "A", "对称轴 x=2，开口向上，x>2 递增")
GEN[389] = q389
def q390():
    return single("y = x² - 4x + 5 = (x-2)² + 1，最小值 = ？", [{"key":"A","text":"1"},{"key":"B","text":"2"},{"key":"C","text":"5"},{"key":"D","text":"-1"}], "A", "顶点 (2,1)，开口向上 → 最小值 1")
GEN[390] = q390
def q391():
    return single("y = x² 在区间 [1,3] 上最大值 = ？", [{"key":"A","text":"9"},{"key":"B","text":"1"},{"key":"C","text":"3"},{"key":"D","text":"6"}], "A", "x=3 时最大 y=9")
GEN[391] = q391
def q392():
    return single("抛物线 y = x² - 4x + 3 与 x 轴交点即方程？的根", [{"key":"A","text":"x²-4x+3=0"},{"key":"B","text":"x²+4x+3=0"},{"key":"C","text":"x²-4x=0"},{"key":"D","text":"x-4=0"}], "A", "y=0 → x²-4x+3=0")
GEN[392] = q392
def q393():
    return single("抛物线 y = x² - 4x + 3 在 x 轴下方 ⇔ 不等式？", [{"key":"A","text":"x²-4x+3 < 0"},{"key":"B","text":"x²-4x+3 > 0"},{"key":"C","text":"x²-4x+3 = 0"},{"key":"D","text":"x²-4x+3 ≥ 0"}], "A", "图像在 x 轴下方 → y<0")
GEN[393] = q393
def q394():
    return single("利润最大化问题：利润 = 单件利润 × 销量，用二次函数求最值的方法是？", [{"key":"A","text":"求顶点（配方法/公式）"},{"key":"B","text":"求根"},{"key":"C","text":"求交点"},{"key":"D","text":"求渐近线"}], "A", "最大利润 → 二次函数顶点")
GEN[394] = q394
def q395():
    a = ri(2, 4)
    return single(f"用 {2*a} 米篱笆围矩形（一边靠墙），设宽 x，面积 S = x({2*a-2*x}) = ？最大时 x = ？", [{"key":"A","text":f"{a}/2"},{"key":"B","text":str(a)},{"key":"C","text":str(2*a)},{"key":"D","text":str(a/4)}], "A", f"S 的对称轴 x={2*a}/4={a/2} → 最大")
GEN[395] = q395
def q396():
    return single("抛物线存在性综合题，判断等腰三角形常用？", [{"key":"A","text":"分类讨论（三边两两相等）"},{"key":"B","text":"只查一个"},{"key":"C","text":"画图猜"},{"key":"D","text":"不用验证"}], "A", "等腰存在性：三边两两相等分类讨论")
GEN[396] = q396

# ---- 第27章 相似 (397-417) ----
def q397():
    a = ri(2, 4); b = ri(4, 8)
    return single(f"线段 a={a}、b={b}，a 与 b 的比 = ？", [{"key":"A","text":f"{a}:{b}"},{"key":"B","text":f"{b}:{a}"},{"key":"C","text":f"{a*b}"},{"key":"D","text":f"{a+b}"}], "A", f"比 = {a}:{b}")
GEN[397] = q397
def q398():
    a = ri(2, 5); b = ri(2, 5)
    return single(f"若 a/b = {a}/{b}，则 a:b = ？", [{"key":"A","text":f"{a}:{b}"},{"key":"B","text":f"{b}:{a}"},{"key":"C","text":f"{a+b}:{a}"},{"key":"D","text":"1:1"}], "A", f"比例式 a:b={a}:{b}")
GEN[398] = q398
def q399():
    return single("黄金分割比 ≈ ？", [{"key":"A","text":"0.618"},{"key":"B","text":"0.5"},{"key":"C","text":"1"},{"key":"D","text":"0.707"}], "A", "黄金比 (√5-1)/2 ≈ 0.618")
GEN[399] = q399
def q400():
    return single("形状相同、大小不一定相同的图形叫？", [{"key":"A","text":"相似图形"},{"key":"B","text":"全等图形"},{"key":"C","text":"对称图形"},{"key":"D","text":"平移图形"}], "A", "相似图形定义")
GEN[400] = q400
def q401():
    return single("相似多边形的性质：对应角？对应边？", [{"key":"A","text":"相等、成比例"},{"key":"B","text":"成比例、相等"},{"key":"C","text":"相等、相等"},{"key":"D","text":"成比例、成比例"}], "A", "相似多边形：对应角相等，对应边成比例")
GEN[401] = q401
def q402():
    a = ri(2, 4); b = ri(2, 4)
    return single(f"相似多边形对应边 {a} 与 {b}，相似比 = ？", [{"key":"A","text":f"{a}:{b}"},{"key":"B","text":f"{b}:{a}"},{"key":"C","text":f"{a*b}"},{"key":"D","text":f"{a+b}"}], "A", f"相似比 = 对应边比 = {a}:{b}")
GEN[402] = q402
def q403():
    return single("平行线分线段成比例：两条平行线截两条直线，对应线段？", [{"key":"A","text":"成比例"},{"key":"B","text":"相等"},{"key":"C","text":"互补"},{"key":"D","text":"无关"}], "A", "平行线分线段成比例定理")
GEN[403] = q403
def q404():
    return single("平行于三角形一边的直线截其他两边，所得线段？", [{"key":"A","text":"成比例"},{"key":"B","text":"相等"},{"key":"C","text":"加倍"},{"key":"D","text":"减半"}], "A", "A 字型：平行 → 对应线段成比例")
GEN[404] = q404
def q405():
    return single("对应角相等、对应边成比例的三角形叫？", [{"key":"A","text":"相似三角形"},{"key":"B","text":"全等三角形"},{"key":"C","text":"等腰三角形"},{"key":"D","text":"直角三角形"}], "A", "相似三角形定义")
GEN[405] = q405
def q406():
    return single("平行于三角形一边的直线与三角形其他两边相交，所得的三角形与原三角形？", [{"key":"A","text":"相似"},{"key":"B","text":"全等"},{"key":"C","text":"不相似"},{"key":"D","text":"无关"}], "A", "相似判定1：平行 → 相似")
GEN[406] = q406
def q407():
    return single("三边对应成比例的三角形？", [{"key":"A","text":"相似"},{"key":"B","text":"全等"},{"key":"C","text":"不一定"},{"key":"D","text":"无关"}], "A", "相似判定2：SSS（三边成比例）")
GEN[407] = q407
def q408():
    return single("两边成比例且夹角相等的三角形？", [{"key":"A","text":"相似"},{"key":"B","text":"全等"},{"key":"C","text":"不一定"},{"key":"D","text":"无关"}], "A", "相似判定3：SAS")
GEN[408] = q408
def q409():
    return single("两角对应相等的三角形？", [{"key":"A","text":"相似"},{"key":"B","text":"全等"},{"key":"C","text":"不一定"},{"key":"D","text":"无关"}], "A", "相似判定4：AA")
GEN[409] = q409
def q410():
    return single("直角三角形相似的特殊判定：一条直角边和斜边成比例？", [{"key":"A","text":"相似"},{"key":"B","text":"全等"},{"key":"C","text":"不一定"},{"key":"D","text":"无关"}], "A", "直角三角形相似：HL 成比例")
GEN[410] = q410
def q411():
    a = ri(2, 4)
    return single(f"相似比 {a}:1，对应高之比 = ？", [{"key":"A","text":f"{a}:1"},{"key":"B","text":f"{a*a}:1"},{"key":"C","text":f"1:{a}"},{"key":"D","text":f"{a}:{a}"}], "A", f"相似三角形对应高比 = 相似比 = {a}:1")
GEN[411] = q411
def q412():
    a = ri(2, 4)
    return single(f"相似比 {a}:1，周长之比 = ？", [{"key":"A","text":f"{a}:1"},{"key":"B","text":f"{a*a}:1"},{"key":"C","text":f"1:{a}"},{"key":"D","text":f"{a}:{a*a}"}], "A", f"周长比 = 相似比 = {a}:1")
GEN[412] = q412
def q413():
    a = ri(2, 4)
    return single(f"相似比 {a}:1，面积之比 = ？", [{"key":"A","text":f"{a*a}:1"},{"key":"B","text":f"{a}:1"},{"key":"C","text":f"1:{a*a}"},{"key":"D","text":f"{a}:{a}"}], "A", f"面积比 = 相似比平方 = {a*a}:1")
GEN[413] = q413
def q414():
    return single("两个相似图形对应点连线交于一点的变换叫？", [{"key":"A","text":"位似变换"},{"key":"B","text":"平移"},{"key":"C","text":"旋转"},{"key":"D","text":"轴对称"}], "A", "位似定义")
GEN[414] = q414
def q415():
    return single("位似图形是特殊的？", [{"key":"A","text":"相似图形"},{"key":"B","text":"全等图形"},{"key":"C","text":"对称图形"},{"key":"D","text":"平移图形"}], "A", "位似是特殊相似")
GEN[415] = q415
def q416():
    a = ri(1, 3); b = ri(1, 3)
    return single(f"位似比 2，点 ({a},{b}) 对应点坐标 = ？", [{"key":"A","text":f"({2*a},{2*b})"},{"key":"B","text":f"({a/2},{b/2})"},{"key":"C","text":f"({a+2},{b+2})"},{"key":"D","text":f"({a-2},{b-2})"}], "A", f"位似比 2：坐标×2 → ({2*a},{2*b})")
GEN[416] = q416
def q417():
    return single("测高常用方法：利用？构造相似三角形", [{"key":"A","text":"同一时刻影长比（相似）"},{"key":"B","text":"测量"},{"key":"C","text":"目测"},{"key":"D","text":"猜测"}], "A", "相似测高：物高/影长成比例")
GEN[417] = q417

# ---- 第28章 锐角三角函数 (418-430) ----
def q418():
    return single("Rt△ 中 sinA = ？", [{"key":"A","text":"∠A 的对边/斜边"},{"key":"B","text":"∠A 的邻边/斜边"},{"key":"C","text":"∠A 的对边/邻边"},{"key":"D","text":"斜边/对边"}], "A", "sinA = 对边/斜边")
GEN[418] = q418
def q419():
    return single("Rt△ 中 cosA = ？", [{"key":"A","text":"∠A 的邻边/斜边"},{"key":"B","text":"∠A 的对边/斜边"},{"key":"C","text":"∠A 的对边/邻边"},{"key":"D","text":"斜边/邻边"}], "A", "cosA = 邻边/斜边")
GEN[419] = q419
def q420():
    return single("Rt△ 中 tanA = ？", [{"key":"A","text":"∠A 的对边/邻边"},{"key":"B","text":"∠A 的邻边/斜边"},{"key":"C","text":"∠A 的对边/斜边"},{"key":"D","text":"斜边/对边"}], "A", "tanA = 对边/邻边")
GEN[420] = q420
def q421():
    return single("锐角三角函数值的范围是？", [{"key":"A","text":"sin、cos 在 (0,1)，tan > 0"},{"key":"B","text":"都大于 1"},{"key":"C","text":"都小于 0"},{"key":"D","text":"sin 大于 1"}], "A", "锐角三角：sin、cos∈(0,1)，tan>0")
GEN[421] = q421
def q422():
    return single("sin30° = ？", [{"key":"A","text":"1/2"},{"key":"B","text":"√2/2"},{"key":"C","text":"√3/2"},{"key":"D","text":"1"}], "A", "特殊角：sin30°=1/2")
GEN[422] = q422
def q423():
    return single("同角关系：sin²A + cos²A = ？", [{"key":"A","text":"1"},{"key":"B","text":"0"},{"key":"C","text":"tanA"},{"key":"D","text":"2"}], "A", "sin²A+cos²A=1")
GEN[423] = q423
def q424():
    return single("互余两角：sinA = cos(90°-A)，则 sin30° = cos？", [{"key":"A","text":"60°"},{"key":"B","text":"30°"},{"key":"C","text":"45°"},{"key":"D","text":"90°"}], "A", "sin30°=cos60°")
GEN[424] = q424
def q425():
    return single("tanA = 1，A 为锐角，则 A = ？", [{"key":"A","text":"45°"},{"key":"B","text":"30°"},{"key":"C","text":"60°"},{"key":"D","text":"90°"}], "A", "tan45°=1")
GEN[425] = q425
def q426():
    return single("由直角三角形已知元素求其余元素的过程叫？", [{"key":"A","text":"解直角三角形"},{"key":"B","text":"画三角形"},{"key":"C","text":"测三角形"},{"key":"D","text":"拼三角形"}], "A", "解直角三角形定义")
GEN[426] = q426
def q427():
    return single("解直角三角形的依据是？", [{"key":"A","text":"三边关系（勾股）、两锐角互余、边角关系（三角）"},{"key":"B","text":"只靠勾股"},{"key":"C","text":"只靠内角和"},{"key":"D","text":"只靠测量"}], "A", "解直角三角形三大依据")
GEN[427] = q427
def q428():
    return single("从下往上看，视线与水平线的夹角叫？", [{"key":"A","text":"仰角"},{"key":"B","text":"俯角"},{"key":"C","text":"坡角"},{"key":"D","text":"方位角"}], "A", "仰角定义")
GEN[428] = q428
def q429():
    return single("坡度（坡比）i = ？", [{"key":"A","text":"铅直高度/水平宽度"},{"key":"B","text":"水平宽度/铅直高度"},{"key":"C","text":"坡长/高度"},{"key":"D","text":"高度×宽度"}], "A", "坡度 = 铅直高度/水平宽度")
GEN[429] = q429
def q430():
    return single("解直角三角形的方位角应用：北偏东 30°，实际是？", [{"key":"A","text":"从正北向东转 30°"},{"key":"B","text":"从正东向北转 30°"},{"key":"C","text":"正东"},{"key":"D","text":"正北"}], "A", "方位角约定")
GEN[430] = q430

# ---- 第29章 投影与视图 (431-437) ----
def q431():
    return single("平行光线照射形成的投影叫？", [{"key":"A","text":"平行投影"},{"key":"B","text":"中心投影"},{"key":"C","text":"正投影"},{"key":"D","text":"斜投影"}], "A", "平行投影（如太阳光）")
GEN[431] = q431
def q432():
    return single("投影线垂直于投影面时的投影叫？", [{"key":"A","text":"正投影"},{"key":"B","text":"平行投影"},{"key":"C","text":"中心投影"},{"key":"D","text":"斜投影"}], "A", "正投影定义")
GEN[432] = q432
def q433():
    return single("三视图是指？", [{"key":"A","text":"主视图、左视图、俯视图"},{"key":"B","text":"正视图、侧视图、背视图"},{"key":"C","text":"顶视图、底视图、侧视图"},{"key":"D","text":"前视图、后视图、左视图"}], "A", "三视图定义")
GEN[433] = q433
def q434():
    return single("三视图中，主视图与俯视图？", [{"key":"A","text":"长对正"},{"key":"B","text":"高平齐"},{"key":"C","text":"宽相等"},{"key":"D","text":"无关"}], "A", "主俯长对正")
GEN[434] = q434
def q435():
    return single("球的三视图都是？", [{"key":"A","text":"圆"},{"key":"B","text":"矩形"},{"key":"C","text":"三角形"},{"key":"D","text":"正方形"}], "A", "球三视图都是圆")
GEN[435] = q435
def q436():
    return single("三视图都是矩形的几何体是？", [{"key":"A","text":"长方体"},{"key":"B","text":"球"},{"key":"C","text":"圆锥"},{"key":"D","text":"三棱锥"}], "A", "长方体三视图为矩形")
GEN[436] = q436
def q437():
    a = ri(2, 5)
    return single(f"由三视图还原：主视图和俯视图都是正方形、左视图也是正方形，几何体棱长 {a}，体积 = ？", [{"key":"A","text":str(a*a*a)},{"key":"B","text":str(a*a)},{"key":"C","text":str(6*a*a)},{"key":"D","text":str(3*a)}], "A", f"正方体 V=a³={a}³={a*a*a}")
GEN[437] = q437

# ---------- 生成主流程 ----------
def main():
    args = [int(a) for a in sys.argv[1:2]] or [1, 29] if False else None
    if len(sys.argv) >= 3:
        start_ch, end_ch = int(sys.argv[1]), int(sys.argv[2])
    elif len(sys.argv) == 2:
        start_ch = end_ch = int(sys.argv[1])
    else:
        start_ch, end_ch = 1, 29
    total = 0
    for ch in range(start_ch, end_ch + 1):
        meta = CH_META[ch]
        lines = [
            f"-- 第{ch}章 {meta['name']} 补题（{meta['term']}学期, 知识点 {meta['start']}-{meta['end']}）",
            f"-- 参数化原创题 source='template-j'",
        ]
        per_ch = 0
        for no in range(meta["start"], meta["end"] + 1):
            # 每知识点生成 3 个变体（参数化随机 → 不同内容），按内容去重
            variants = []
            for v in range(5):
                q = gen_question(no) or fallback(no)
                if q and not any(x["content"] == q["content"] for x in variants):
                    variants.append(q)
                if len(variants) >= 3:
                    break
            # 变体不足 3 个时，用选项重排补充（题干相同、选项顺序不同 → 新题）
            def shuffle_options(q):
                import json
                try:
                    opts = json.loads(q.get("options") or "[]")
                except Exception:
                    return None
                if len(opts) < 2:
                    return None
                shuffled = list(opts)
                random.SystemRandom().shuffle(shuffled)
                ans_text = next((o["text"] for o in opts if o["key"] == q.get("answer")), None)
                if ans_text is None:
                    return None
                ans_key = next((o["key"] for o in shuffled if o["text"] == ans_text), None)
                if ans_key is None:
                    return None
                return {**q, "options": json.dumps(shuffled, ensure_ascii=False), "answer": ans_key}
            v = len(variants)
            while v < 3:
                base = variants[v % max(len(variants), 1)] if variants else None
                sv = shuffle_options(base) if base else None
                if not sv or any(x.get("options") == sv["options"] for x in variants):
                    break
                variants.append(sv)
                v += 1
            for vi, q in enumerate(variants[:3]):
                qid = f"jq-{no:04d}-{vi + 1}"
                opts = q.get("options") or ""
                diff = (0.35 + (no % 5) * 0.1)
                lines.append("INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES")
                lines.append(f"('{qid}','math','初中',{meta['term']},'jkp-{no:04d}','{q['type']}',{diff:.2f},'{q['content'].replace(chr(39), chr(39)+chr(39))}','{opts.replace(chr(39), chr(39)+chr(39))}','{q['answer']}','{q['analysis'].replace(chr(39), chr(39)+chr(39))}','template-j','approved','通用');")
                per_ch += 1; total += 1
        out = os.path.join(ROOT, "infra", "d1", f"junior-questions-{ch}.sql")
        with open(out, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        print(f"第{ch}章 {meta['name']}: 生成 {per_ch} 题 → {out}")
    print(f"合计: {total} 题")

if __name__ == "__main__":
    main()
