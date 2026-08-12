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
