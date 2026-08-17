-- ============================================================
-- 数学题库种子（自建原创题，生产可用）
-- 学期粒度：7=初一上 8=初一下 9=初二上 10=初二下 11=初三上 12=初三下
--           13=高一上 14=高一下 15=高二上 16=高二下 17=高三上 18=高三下
-- 覆盖：初中全 6 学期 + 高中全 6 学期，保证任一学期都能组卷
-- 注意：wrangler 对含中文字符的多语句文件解析有兼容问题，
--       本文件建议用「逐条执行 INSERT」或手动拆分执行
-- ============================================================

-- ============ 第一段：既有题（初一上 / 初二上 / 初三上 / 高一上 / 高二上 / 高三上） ============
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status) VALUES
('q-math-001','math','初中',7,'kp-math-rational-op','single_choice',0.3,'计算：(-3) + 5 = ？','[{"key":"A","text":"-2"},{"key":"B","text":"2"},{"key":"C","text":"8"},{"key":"D","text":"-8"}]','B','异号两数相加，取绝对值较大的符号，并用较大绝对值减较小绝对值：5-3=2','teacher','approved'),
('q-math-002','math','初中',7,'kp-math-rational-op','single_choice',0.4,'计算：(-2) × (-3) = ？','[{"key":"A","text":"-6"},{"key":"B","text":"6"},{"key":"C","text":"5"},{"key":"D","text":"-5"}]','B','同号两数相乘得正，绝对值相乘：2×3=6','teacher','approved'),
('q-math-003','math','初中',7,'kp-math-rational-op','single_choice',0.5,'计算：(-12) ÷ 4 = ？','[{"key":"A","text":"-3"},{"key":"B","text":"3"},{"key":"C","text":"-8"},{"key":"D","text":"8"}]','A','异号两数相除得负，绝对值相除：12÷4=3','teacher','approved'),
('q-math-004','math','初中',7,'kp-math-rational-op','blank',0.5,'计算：(-1)^2026 + (-1)^2025 = ____','','0','(-1)的偶次幂为1，奇次幂为-1，故 1 + (-1) = 0','teacher','approved'),
('q-math-005','math','初中',7,'kp-math-rational-num','single_choice',0.35,'在数轴上，表示 -3 的点到原点的距离是？','[{"key":"A","text":"-3"},{"key":"B","text":"3"},{"key":"C","text":"0"},{"key":"D","text":"6"}]','B','数轴上点到原点的距离即该数的绝对值，|-3|=3','teacher','approved'),
('q-math-006','math','初中',7,'kp-math-rational-num','single_choice',0.4,'-2 的相反数是？','[{"key":"A","text":"2"},{"key":"B","text":"-2"},{"key":"C","text":"1/2"},{"key":"D","text":"-1/2"}]','A','只有符号不同的两个数互为相反数','teacher','approved'),
('q-math-007','math','初中',7,'kp-math-rational-abs','single_choice',0.45,'若 |x| = 5，则 x = ？','[{"key":"A","text":"5"},{"key":"B","text":"-5"},{"key":"C","text":"5 或 -5"},{"key":"D","text":"0"}]','C','绝对值为正数 a 的数有两个：a 和 -a','teacher','approved'),
('q-math-008','math','初中',7,'kp-math-rational-abs','blank',0.5,'|−7| + |3| = ____','','10','绝对值均为非负数：7+3=10','teacher','approved'),
('q-math-009','math','初中',7,'kp-math-exp','single_choice',0.5,'化简：3a + 2b - a + 4b = ？','[{"key":"A","text":"2a+6b"},{"key":"B","text":"4a+6b"},{"key":"C","text":"2a+2b"},{"key":"D","text":"4a+2b"}]','A','合并同类项：3a-a=2a，2b+4b=6b','teacher','approved'),
('q-math-010','math','初中',7,'kp-math-exp','single_choice',0.45,'计算：5 - (2x - 3) = ？','[{"key":"A","text":"8-2x"},{"key":"B","text":"2-2x"},{"key":"C","text":"8+2x"},{"key":"D","text":"2+2x"}]','A','去括号变号：5-2x+3=8-2x','teacher','approved'),
('q-math-011','math','初中',7,'kp-math-equation','single_choice',0.55,'解方程 3x + 5 = 14，x = ？','[{"key":"A","text":"3"},{"key":"B","text":"19/3"},{"key":"C","text":"-3"},{"key":"D","text":"9"}]','A','移项得 3x=9，系数化一得 x=3','teacher','approved'),
('q-math-012','math','初中',7,'kp-math-equation','short_answer',0.7,'解方程：2(x - 1) + 3 = 7','','x = 3','去括号：2x-2+3=7，合并：2x+1=7，移项：2x=6，x=3','teacher','approved'),
('q-math-013','math','初中',7,'kp-math-ineq','single_choice',0.55,'不等式 2x - 3 > 1 的解集是？','[{"key":"A","text":"x > 2"},{"key":"B","text":"x < 2"},{"key":"C","text":"x > 4"},{"key":"D","text":"x > 1"}]','A','移项 2x>4，除以正数 2 不等号方向不变，x>2','teacher','approved'),
('q-math-014','math','初中',9,'kp-math-func','single_choice',0.6,'一次函数 y = 2x + 1 的图像经过点？','[{"key":"A","text":"(0,1)"},{"key":"B","text":"(0,0)"},{"key":"C","text":"(1,0)"},{"key":"D","text":"(-1,0)"}]','A','当 x=0 时 y=1，故过 (0,1)，即与 y 轴交点为 (0,1)','teacher','approved'),
('q-math-015','math','初中',7,'kp-math-rational-op','short_answer',0.6,'计算：-2 + 6 ÷ (-3) × 2','','-6','先乘除后加减：6÷(-3)=-2，(-2)×2=-4，-2+(-4)=-6','teacher','approved');

-- ============ 第二段：高中数学题（高一上13 / 高二上15 / 高三上17） ============
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status) VALUES
('q-hs-001','math','高中',13,'kp-math-sets','single_choice',0.4,'已知集合 A={1,2,3}，B={2,3,4}，则 A∩B = ？','[{"key":"A","text":"{1,2,3}"},{"key":"B","text":"{2,3}"},{"key":"C","text":"{1,4}"},{"key":"D","text":"{1,2,3,4}"}]','B','交集取两集合的公共元素：2 和 3','teacher','approved'),
('q-hs-002','math','高中',13,'kp-math-sets','single_choice',0.5,'命题"若 x>1，则 x>0"的否命题是？','[{"key":"A","text":"若 x≤1，则 x≤0"},{"key":"B","text":"若 x>0，则 x>1"},{"key":"C","text":"若 x≤1，则 x>0"},{"key":"D","text":"若 x>1，则 x≤0"}]','A','否命题：条件与结论都否定，即"若 x≤1，则 x≤0"','teacher','approved'),
('q-hs-003','math','高中',13,'kp-math-func-basic','single_choice',0.45,'函数 f(x) = 1/(x-2) 的定义域是？','[{"key":"A","text":"x≠2"},{"key":"B","text":"x>2"},{"key":"C","text":"x≥2"},{"key":"D","text":"x≠0"}]','A','分母不能为 0，故 x-2≠0，即 x≠2','teacher','approved'),
('q-hs-004','math','高中',13,'kp-math-func-basic','single_choice',0.5,'下列函数中，既是奇函数又在 (0,+∞) 单调递增的是？','[{"key":"A","text":"y=x"},{"key":"B","text":"y=x²"},{"key":"C","text":"y=1/x"},{"key":"D","text":"y=|x|"}]','A','y=x 为奇函数且在 (0,+∞) 单调递增；y=x²、y=|x| 为偶函数','teacher','approved'),
('q-hs-005','math','高中',13,'kp-math-explog','single_choice',0.5,'计算：log₂8 + log₂4 = ？','[{"key":"A","text":"4"},{"key":"B","text":"5"},{"key":"C","text":"6"},{"key":"D","text":"3"}]','B','log₂8=3，log₂4=2，和为 5；或 log₂(8×4)=log₂32=5','teacher','approved'),
('q-hs-006','math','高中',13,'kp-math-explog','single_choice',0.55,'若 2^x = 8，则 x = ？','[{"key":"A","text":"2"},{"key":"B","text":"3"},{"key":"C","text":"4"},{"key":"D","text":"-3"}]','B','2³=8，故 x=3','teacher','approved'),
('q-hs-007','math','高中',15,'kp-math-trig','single_choice',0.5,'sin30° + cos60° = ？','[{"key":"A","text":"1"},{"key":"B","text":"1/2"},{"key":"C","text":"√3/2"},{"key":"D","text":"2"}]','A','sin30°=1/2，cos60°=1/2，和为 1','teacher','approved'),
('q-hs-008','math','高中',15,'kp-math-trig','single_choice',0.6,'函数 y = sin(2x) 的最小正周期是？','[{"key":"A","text":"π"},{"key":"B","text":"2π"},{"key":"C","text":"π/2"},{"key":"D","text":"4π"}]','A','sin(ωx) 周期 T=2π/ω，ω=2，故 T=π','teacher','approved'),
('q-hs-009','math','高中',15,'kp-math-seq','single_choice',0.5,'等差数列 {aₙ}：a₁=2，公差 d=3，则 a₅ = ？','[{"key":"A","text":"14"},{"key":"B","text":"15"},{"key":"C","text":"17"},{"key":"D","text":"11"}]','A','aₙ=a₁+(n-1)d，a₅=2+4×3=14','teacher','approved'),
('q-hs-010','math','高中',15,'kp-math-seq','short_answer',0.65,'等比数列 {bₙ}：b₁=3，公比 q=2，求前 4 项和 S₄','','45','Sₙ=b₁(1-qⁿ)/(1-q)，S₄=3(1-16)/(1-2)=3×15=45','teacher','approved'),
('q-hs-011','math','高中',17,'kp-math-derivative','single_choice',0.6,'函数 f(x)=x² 的导函数 f''(x) = ？','[{"key":"A","text":"2x"},{"key":"B","text":"x²"},{"key":"C","text":"2"},{"key":"D","text":"x"}]','A','幂函数求导：(xⁿ)''=nxⁿ⁻¹，故 (x²)''=2x','teacher','approved'),
('q-hs-012','math','高中',17,'kp-math-derivative','short_answer',0.7,'求曲线 y=x³ 在 x=1 处的切线斜率','','3','y''=3x²，在 x=1 处斜率 y''(1)=3','teacher','approved'),
('q-hs-013','math','高中',17,'kp-math-vector','single_choice',0.6,'向量 a=(1,2)，b=(3,4)，则 a·b = ？','[{"key":"A","text":"11"},{"key":"B","text":"10"},{"key":"C","text":"14"},{"key":"D","text":"12"}]','A','点积：1×3+2×4=3+8=11','teacher','approved'),
('q-hs-014','math','高中',17,'kp-math-conic','single_choice',0.65,'椭圆 x²/4 + y²/9 = 1 的长轴长是？','[{"key":"A","text":"6"},{"key":"B","text":"4"},{"key":"C","text":"9"},{"key":"D","text":"3"}]','A','a²=9，a=3，长轴长 2a=6','teacher','approved'),
('q-hs-015','math','高中',17,'kp-math-probstat','single_choice',0.55,'从 1~5 五个数中随机取一个，取到偶数的概率是？','[{"key":"A","text":"2/5"},{"key":"B","text":"1/2"},{"key":"C","text":"3/5"},{"key":"D","text":"1/5"}]','A','偶数有 2、4 两个，共 5 个数，P=2/5','teacher','approved');

-- ============ 第三段：初一下（8）/ 初二上补（9）/ 初二下（10） ============
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status) VALUES
('q-math-101','math','初中',8,'kp-math-system','single_choice',0.55,'方程组 {x+y=5, x-y=1} 的解是？','[{"key":"A","text":"x=3,y=2"},{"key":"B","text":"x=2,y=3"},{"key":"C","text":"x=4,y=1"},{"key":"D","text":"x=1,y=4"}]','A','两式相加得 2x=6，x=3；代入 x-y=1 得 y=2','teacher','approved'),
('q-math-102','math','初中',8,'kp-math-system','short_answer',0.65,'用代入法解方程组：{y=2x, x+y=9}','','x=3, y=6','把 y=2x 代入 x+y=9：x+2x=9，3x=9，x=3，y=6','teacher','approved'),
('q-math-103','math','初中',8,'kp-math-multiply','single_choice',0.55,'计算：(a+3)(a-3) = ？','[{"key":"A","text":"a²-9"},{"key":"B","text":"a²+9"},{"key":"C","text":"a²-6a+9"},{"key":"D","text":"a²+6a+9"}]','A','平方差公式：(a+b)(a-b)=a²-b²，故 a²-9','teacher','approved'),
('q-math-104','math','初中',8,'kp-math-multiply','single_choice',0.6,'因式分解：x² - 4 = ？','[{"key":"A","text":"(x+2)(x-2)"},{"key":"B","text":"(x-2)²"},{"key":"C","text":"(x+2)²"},{"key":"D","text":"x(x-4)"}]','A','平方差公式逆用：x²-4=x²-2²=(x+2)(x-2)','teacher','approved'),
('q-math-201','math','初中',9,'kp-math-congruent','single_choice',0.6,'两个三角形全等的判定方法中，下列哪个正确？','[{"key":"A","text":"SSS（三边对应相等）"},{"key":"B","text":"SSA（两边及一角）"},{"key":"C","text":"AAA（三角对应相等）"},{"key":"D","text":"三个角相等即可"}]','A','SSS/SAS/ASA/AAS/HL 是全等判定，SSA 与 AAA 不能判定','teacher','approved'),
('q-math-202','math','初中',9,'kp-math-congruent','single_choice',0.65,'若△ABC≌△DEF，且 AB=5，则 DE = ？','[{"key":"A","text":"5"},{"key":"B","text":"10"},{"key":"C","text":"2.5"},{"key":"D","text":"无法确定"}]','A','全等三角形对应边相等，AB 对应 DE，故 DE=5','teacher','approved'),
('q-math-301','math','初中',10,'kp-math-pythagoras','single_choice',0.55,'直角三角形的两直角边分别为 3 和 4，斜边为？','[{"key":"A","text":"5"},{"key":"B","text":"7"},{"key":"C","text":"12"},{"key":"D","text":"6"}]','A','勾股定理：√(3²+4²)=√25=5','teacher','approved'),
('q-math-302','math','初中',10,'kp-math-pythagoras','short_answer',0.6,'直角三角形一条直角边为 6，斜边为 10，求另一条直角边','','8','勾股定理：√(10²-6²)=√(100-36)=√64=8','teacher','approved'),
('q-math-303','math','初中',10,'kp-math-parallelogram','single_choice',0.6,'平行四边形 ABCD 中，∠A=60°，则 ∠C = ？','[{"key":"A","text":"60°"},{"key":"B","text":"120°"},{"key":"C","text":"30°"},{"key":"D","text":"90°"}]','A','平行四边形对角相等，∠A=∠C=60°','teacher','approved');

-- ============ 第四段：初三上（11）/ 初三下（12） ============
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status) VALUES
('q-math-401','math','初中',11,'kp-math-quadeq','single_choice',0.55,'解方程 x² - 4 = 0，x = ？','[{"key":"A","text":"±2"},{"key":"B","text":"2"},{"key":"C","text":"±4"},{"key":"D","text":"-2"}]','A','x²=4，两边开方得 x=±2','teacher','approved'),
('q-math-402','math','初中',11,'kp-math-quadeq','single_choice',0.6,'一元二次方程 x² - 5x + 6 = 0 的两个根是？','[{"key":"A","text":"2 和 3"},{"key":"B","text":"-2 和 -3"},{"key":"C","text":"1 和 6"},{"key":"D","text":"-1 和 -6"}]','A','因式分解：(x-2)(x-3)=0，故 x=2 或 x=3','teacher','approved'),
('q-math-501','math','初中',12,'kp-math-circle','single_choice',0.6,'圆 O 的半径为 5，则其直径是？','[{"key":"A","text":"10"},{"key":"B","text":"5"},{"key":"C","text":"25"},{"key":"D","text":"2.5"}]','A','直径=2×半径=10','teacher','approved'),
('q-math-502','math','初中',12,'kp-math-trigacute','single_choice',0.55,'在直角三角形中，∠A=30°，则 sinA = ？','[{"key":"A","text":"1/2"},{"key":"B","text":"√3/2"},{"key":"C","text":"√2/2"},{"key":"D","text":"1"}]','A','sin30°=1/2','teacher','approved'),
('q-math-503','math','初中',12,'kp-math-trigacute','single_choice',0.6,'若 tanθ = 1，且 θ 为锐角，则 θ = ？','[{"key":"A","text":"45°"},{"key":"B","text":"30°"},{"key":"C","text":"60°"},{"key":"D","text":"90°"}]','A','tan45°=1','teacher','approved');

-- ============ 第五段：高一下（14） ============
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status) VALUES
('q-hs-101','math','高中',14,'kp-math-vector2d','single_choice',0.55,'已知 a=(1,2)，b=(2,1)，则 a+b = ？','[{"key":"A","text":"(3,3)"},{"key":"B","text":"(3,1)"},{"key":"C","text":"(1,3)"},{"key":"D","text":"(2,2)"}]','A','向量加法对应坐标相加：(1+2, 2+1)=(3,3)','teacher','approved'),
('q-hs-102','math','高中',14,'kp-math-vector2d','single_choice',0.6,'|a|=3，|b|=4，a⊥b，则 |a+b| = ？','[{"key":"A","text":"5"},{"key":"B","text":"7"},{"key":"C","text":"12"},{"key":"D","text":"1"}]','A','垂直向量正交：|a+b|²=|a|²+|b|²=9+16=25，故 |a+b|=5','teacher','approved'),
('q-hs-103','math','高中',14,'kp-math-complex','single_choice',0.5,'复数 z = 1 + 2i，则 z 的虚部是？','[{"key":"A","text":"2"},{"key":"B","text":"1"},{"key":"C","text":"2i"},{"key":"D","text":"-2"}]','A','z=a+bi 的虚部为 b=2（不含虚数单位 i）','teacher','approved');

-- ============ 第六段：高二下（16） ============
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status) VALUES
('q-hs-201','math','高中',16,'kp-math-count','single_choice',0.55,'从 4 名同学中选出 2 名参加比赛，共有多少种选法？','[{"key":"A","text":"6"},{"key":"B","text":"12"},{"key":"C","text":"8"},{"key":"D","text":"4"}]','A','组合数 C(4,2)=4×3/2=6','teacher','approved'),
('q-hs-202','math','高中',16,'kp-math-count','single_choice',0.6,'从 5 本不同的书中选 3 本排列在书架上，有多少种排列？','[{"key":"A","text":"60"},{"key":"B","text":"10"},{"key":"C","text":"120"},{"key":"D","text":"15"}]','A','排列数 P(5,3)=5×4×3=60','teacher','approved'),
('q-hs-203','math','高中',16,'kp-math-randomvar','single_choice',0.6,'随机变量 X 的分布列为 P(X=0)=0.3，P(X=1)=0.7，则 E(X) = ？','[{"key":"A","text":"0.7"},{"key":"B","text":"0.3"},{"key":"C","text":"1"},{"key":"D","text":"0.5"}]','A','数学期望 E(X)=0×0.3+1×0.7=0.7','teacher','approved');

-- ============ 第七段：高三下（18）综合复习 ============
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status) VALUES
('q-hs-301','math','高中',18,'kp-math-review','single_choice',0.7,'函数 f(x)=x³-3x 在 x=1 处的切线斜率是？','[{"key":"A","text":"0"},{"key":"B","text":"3"},{"key":"C","text":"-3"},{"key":"D","text":"6"}]','A','f''(x)=3x²-3，f''(1)=3-3=0','teacher','approved'),
('q-hs-302','math','高中',18,'kp-math-review','single_choice',0.7,'已知等比数列首项 2，公比 3，则第 4 项是？','[{"key":"A","text":"54"},{"key":"B","text":"18"},{"key":"C","text":"162"},{"key":"D","text":"12"}]','A','a₄=2×3³=2×27=54','teacher','approved'),
('q-hs-303','math','高中',18,'kp-math-review','short_answer',0.75,'设集合 A={x|x²-3x+2=0}，求 A 中元素之和','','3','x²-3x+2=0 两根为 1 和 2，和 = 1+2 = 3','teacher','approved');
