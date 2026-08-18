# 追加第 5-10 章模板到 gen-junior-questions.py
import os

p = r"C:\Users\Richard chen\Desktop\ai-teacher-platform\scripts\gen-junior-questions.py"
content = open(p, encoding="utf-8").read()

add = '''# ---- 第5章 相交线与平行线 (66-87) ----
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
'''

marker = "# ---------- 生成主流程 ----------"
assert marker in content, "marker not found"
content = content.replace(marker, add + "\n" + marker)
open(p, "w", encoding="utf-8").write(content)
print("第5-10章模板已追加")
