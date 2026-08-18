# 追加第 16-29 章模板（分式、反比例、勾股、四边形、数据分析、二次根式、一元二次方程、旋转、圆、概率、二次函数、相似、锐角三角、投影视图）
import os

p = r"C:\Users\Richard chen\Desktop\ai-teacher-platform\scripts\gen-junior-questions.py"
content = open(p, encoding="utf-8").read()

add = '''# ---- 第16章 分式 (241-258) ----
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
'''

marker = "# ---------- 生成主流程 ----------"
assert marker in content, "marker not found"
content = content.replace(marker, add + "\n" + marker)
open(p, "w", encoding="utf-8").write(content)
print("第16-20章模板已追加")
