# 追加第 26-29 章模板（二次函数、相似、锐角三角函数、投影与视图）
import os

p = r"C:\Users\Richard chen\Desktop\ai-teacher-platform\scripts\gen-junior-questions.py"
content = open(p, encoding="utf-8").read()

add = '''# ---- 第26章 二次函数 (375-396) ----
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
'''

marker = "# ---------- 生成主流程 ----------"
assert marker in content, "marker not found"
content = content.replace(marker, add + "\n" + marker)
open(p, "w", encoding="utf-8").write(content)
print("第26-29章模板已追加")
