# 追加第 11-15 章模板（全等三角形、轴对称、实数、一次函数、整式乘除）到 gen-junior-questions.py
import os

p = r"C:\Users\Richard chen\Desktop\ai-teacher-platform\scripts\gen-junior-questions.py"
content = open(p, encoding="utf-8").read()

add = '''# ---- 第11章 全等三角形 (158-170) ----
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
'''

marker = "# ---------- 生成主流程 ----------"
assert marker in content, "marker not found"
content = content.replace(marker, add + "\n" + marker)
open(p, "w", encoding="utf-8").write(content)
print("第11-15章模板已追加")
