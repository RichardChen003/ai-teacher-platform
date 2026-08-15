-- ============================================================
-- 初中数学题库种子（自建原创题，生产可用）
-- 覆盖：有理数运算/数轴相反数/绝对值/整式加减/一元一次方程/不等式/一次函数
-- 应用: wrangler d1 execute ai-teacher-db --local --file=infra/d1/questions-seed.sql
-- ============================================================

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
('q-math-014','math','初中',8,'kp-math-func','single_choice',0.6,'一次函数 y = 2x + 1 的图像经过点？','[{"key":"A","text":"(0,1)"},{"key":"B","text":"(0,0)"},{"key":"C","text":"(1,0)"},{"key":"D","text":"(-1,0)"}]','A','当 x=0 时 y=1，故过 (0,1)，即与 y 轴交点为 (0,1)','teacher','approved'),
('q-math-015','math','初中',7,'kp-math-rational-op','short_answer',0.6,'计算：-2 + 6 ÷ (-3) × 2','','-6','先乘除后加减：6÷(-3)=-2，(-2)×2=-4，-2+(-4)=-6','teacher','approved');

-- ---------- 高中数学题目（高三总复习诊断使用，原创题） ----------
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status) VALUES
('q-hs-001','math','高中',10,'kp-math-sets','single_choice',0.4,'已知集合 A={1,2,3}，B={2,3,4}，则 A∩B = ？','[{"key":"A","text":"{1,2,3}"},{"key":"B","text":"{2,3}"},{"key":"C","text":"{1,4}"},{"key":"D","text":"{1,2,3,4}"}]','B','交集取两集合的公共元素：2 和 3','teacher','approved'),
('q-hs-002','math','高中',10,'kp-math-sets','single_choice',0.5,'命题"若 x>1，则 x>0"的否命题是？','[{"key":"A","text":"若 x≤1，则 x≤0"},{"key":"B","text":"若 x>0，则 x>1"},{"key":"C","text":"若 x≤1，则 x>0"},{"key":"D","text":"若 x>1，则 x≤0"}]','A','否命题：条件与结论都否定，即"若 x≤1，则 x≤0"','teacher','approved'),
('q-hs-003','math','高中',10,'kp-math-func-basic','single_choice',0.45,'函数 f(x) = 1/(x-2) 的定义域是？','[{"key":"A","text":"x≠2"},{"key":"B","text":"x>2"},{"key":"C","text":"x≥2"},{"key":"D","text":"x≠0"}]','A','分母不能为 0，故 x-2≠0，即 x≠2','teacher','approved'),
('q-hs-004','math','高中',10,'kp-math-func-basic','single_choice',0.5,'下列函数中，既是奇函数又在 (0,+∞) 单调递增的是？','[{"key":"A","text":"y=x"},{"key":"B","text":"y=x²"},{"key":"C","text":"y=1/x"},{"key":"D","text":"y=|x|"}]','A','y=x 为奇函数且在 (0,+∞) 单调递增；y=x²、y=|x| 为偶函数','teacher','approved'),
('q-hs-005','math','高中',10,'kp-math-explog','single_choice',0.5,'计算：log₂8 + log₂4 = ？','[{"key":"A","text":"4"},{"key":"B","text":"5"},{"key":"C","text":"6"},{"key":"D","text":"3"}]','B','log₂8=3，log₂4=2，和为 5；或 log₂(8×4)=log₂32=5','teacher','approved'),
('q-hs-006','math','高中',10,'kp-math-explog','single_choice',0.55,'若 2^x = 8，则 x = ？','[{"key":"A","text":"2"},{"key":"B","text":"3"},{"key":"C","text":"4"},{"key":"D","text":"-3"}]','B','2³=8，故 x=3','teacher','approved'),
('q-hs-007','math','高中',11,'kp-math-trig','single_choice',0.5,'sin30° + cos60° = ？','[{"key":"A","text":"1"},{"key":"B","text":"1/2"},{"key":"C","text":"√3/2"},{"key":"D","text":"2"}]','A','sin30°=1/2，cos60°=1/2，和为 1','teacher','approved'),
('q-hs-008','math','高中',11,'kp-math-trig','single_choice',0.6,'函数 y = sin(2x) 的最小正周期是？','[{"key":"A","text":"π"},{"key":"B","text":"2π"},{"key":"C","text":"π/2"},{"key":"D","text":"4π"}]','A','sin(ωx) 周期 T=2π/ω，ω=2，故 T=π','teacher','approved'),
('q-hs-009','math','高中',11,'kp-math-seq','single_choice',0.5,'等差数列 {aₙ}：a₁=2，公差 d=3，则 a₅ = ？','[{"key":"A","text":"14"},{"key":"B","text":"15"},{"key":"C","text":"17"},{"key":"D","text":"11"}]','A','aₙ=a₁+(n-1)d，a₅=2+4×3=14','teacher','approved'),
('q-hs-010','math','高中',11,'kp-math-seq','short_answer',0.65,'等比数列 {bₙ}：b₁=3，公比 q=2，求前 4 项和 S₄','','45','Sₙ=b₁(1-qⁿ)/(1-q)，S₄=3(1-16)/(1-2)=3×15=45','teacher','approved'),
('q-hs-011','math','高中',12,'kp-math-derivative','single_choice',0.6,'函数 f(x)=x² 的导函数 f''(x) = ？','[{"key":"A","text":"2x"},{"key":"B","text":"x²"},{"key":"C","text":"2"},{"key":"D","text":"x"}]','A','幂函数求导：(xⁿ)''=nxⁿ⁻¹，故 (x²)''=2x','teacher','approved'),
('q-hs-012','math','高中',12,'kp-math-derivative','short_answer',0.7,'求曲线 y=x³ 在 x=1 处的切线斜率','','3','y''=3x²，在 x=1 处斜率 y''(1)=3','teacher','approved'),
('q-hs-013','math','高中',12,'kp-math-vector','single_choice',0.6,'向量 a=(1,2)，b=(3,4)，则 a·b = ？','[{"key":"A","text":"11"},{"key":"B","text":"10"},{"key":"C","text":"14"},{"key":"D","text":"12"}]','A','点积：1×3+2×4=3+8=11','teacher','approved'),
('q-hs-014','math','高中',12,'kp-math-conic','single_choice',0.65,'椭圆 x²/4 + y²/9 = 1 的长轴长是？','[{"key":"A","text":"6"},{"key":"B","text":"4"},{"key":"C","text":"9"},{"key":"D","text":"3"}]','A','a²=9，a=3，长轴长 2a=6','teacher','approved'),
('q-hs-015','math','高中',12,'kp-math-probstat','single_choice',0.55,'从 1~5 五个数中随机取一个，取到偶数的概率是？','[{"key":"A","text":"2/5"},{"key":"B","text":"1/2"},{"key":"C","text":"3/5"},{"key":"D","text":"1/5"}]','A','偶数有 2、4 两个，共 5 个数，P=2/5','teacher','approved');
