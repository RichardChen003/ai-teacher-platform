# 追加第 21-29 章模板（二次根式、一元二次方程、旋转、圆、概率、二次函数、相似、锐角三角、投影视图）
import os

p = r"C:\Users\Richard chen\Desktop\ai-teacher-platform\scripts\gen-junior-questions.py"
content = open(p, encoding="utf-8").read()

add = '''# ---- 第21章 二次根式 (310-320) ----
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
'''

marker = "# ---------- 生成主流程 ----------"
assert marker in content, "marker not found"
content = content.replace(marker, add + "\n" + marker)
open(p, "w", encoding="utf-8").write(content)
print("第21-25章模板已追加")
