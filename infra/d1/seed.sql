-- ============================================================
-- 知识点图谱种子数据（初中数学 + 高中数学，学期粒度）
-- 依据：教育部 2022 年版义务教育课程标准 + 2017 年版普通高中课程标准
-- 学期编码：7=初一上 8=初一下 9=初二上 10=初二下 11=初三上 12=初三下
--           13=高一上 14=高一下 15=高二上 16=高二下 17=高三上 18=高三下
-- 幂等：既有行 UPDATE 重映射学期，新行 INSERT OR IGNORE
-- ============================================================

-- 原有知识点：学年粒度 → 学期粒度重映射
UPDATE knowledge_points SET grade_level = 9  WHERE id = 'kp-math-func'      AND grade_level = 8;
UPDATE knowledge_points SET grade_level = 11 WHERE id = 'kp-math-quadratic' AND grade_level = 9;
UPDATE knowledge_points SET grade_level = 13 WHERE stage = '高中' AND grade_level = 10;
UPDATE knowledge_points SET grade_level = 15 WHERE stage = '高中' AND grade_level = 11;
UPDATE knowledge_points SET grade_level = 17 WHERE stage = '高中' AND grade_level = 12;

-- ---------- 初中数学（初一上~初三下） ----------
INSERT OR IGNORE INTO knowledge_points (id, subject, stage, grade_level, name, code, parent_id, depth, curriculum_ref, difficulty_base, order_index) VALUES
  ('kp-math-intro',      'math', '初中', 7, '数与代数', '数与代数', NULL, 0, '2022义教课标·数与代数', 0.4, 1),
  ('kp-math-rational',   'math', '初中', 7, '有理数',   '数与代数-有理数', 'kp-math-intro', 1, '2022义教课标·初一上', 0.4, 10),
  ('kp-math-rational-op','math', '初中', 7, '有理数的运算', '数与代数-有理数-运算', 'kp-math-rational', 2, '2022义教课标·初一上', 0.5, 11),
  ('kp-math-rational-num','math', '初中', 7, '数轴与相反数', '数与代数-有理数-数轴', 'kp-math-rational', 2, '2022义教课标·初一上', 0.35, 12),
  ('kp-math-rational-abs','math', '初中', 7, '绝对值',  '数与代数-有理数-绝对值', 'kp-math-rational', 2, '2022义教课标·初一上', 0.45, 13),
  ('kp-math-exp',        'math', '初中', 7, '整式的加减', '数与代数-整式', 'kp-math-intro', 1, '2022义教课标·初一上', 0.5, 20),
  ('kp-math-equation',   'math', '初中', 7, '一元一次方程', '数与代数-方程', 'kp-math-intro', 1, '2022义教课标·初一上', 0.55, 30),
  ('kp-math-ineq',       'math', '初中', 7, '不等式与不等式组', '数与代数-不等式', 'kp-math-intro', 1, '2022义教课标·初一上', 0.55, 40),
  -- 初一下（8）：二元一次方程组 / 整式乘除与因式分解
  ('kp-math-system',     'math', '初中', 8, '二元一次方程组', '数与代数-方程组', 'kp-math-intro', 1, '2022义教课标·初一下', 0.55, 41),
  ('kp-math-multiply',   'math', '初中', 8, '整式乘除与因式分解', '数与代数-整式-乘除', 'kp-math-intro', 1, '2022义教课标·初一下', 0.55, 42),
  -- 初二上（9）：一次函数 / 全等三角形
  ('kp-math-func',       'math', '初中', 9, '一次函数', '数与代数-函数', 'kp-math-intro', 1, '2022义教课标·初二上', 0.6, 50),
  ('kp-math-congruent',  'math', '初中', 9, '全等三角形', '图形与几何-三角形', 'kp-math-intro', 1, '2022义教课标·初二上', 0.6, 51),
  -- 初二下（10）：勾股定理 / 平行四边形
  ('kp-math-pythagoras', 'math', '初中', 10, '勾股定理', '图形与几何-勾股定理', 'kp-math-intro', 1, '2022义教课标·初二下', 0.6, 52),
  ('kp-math-parallelogram','math', '初中', 10, '平行四边形', '图形与几何-四边形', 'kp-math-intro', 1, '2022义教课标·初二下', 0.6, 53),
  -- 初三上（11）：二次函数 / 一元二次方程
  ('kp-math-quadratic',  'math', '初中', 11, '二次函数', '数与代数-函数', 'kp-math-intro', 1, '2022义教课标·初三上', 0.7, 60),
  ('kp-math-quadeq',     'math', '初中', 11, '一元二次方程', '数与代数-方程', 'kp-math-intro', 1, '2022义教课标·初三上', 0.6, 61),
  -- 初三下（12）：圆 / 锐角三角函数
  ('kp-math-circle',     'math', '初中', 12, '圆', '图形与几何-圆', 'kp-math-intro', 1, '2022义教课标·初三下', 0.7, 62),
  ('kp-math-trigacute',  'math', '初中', 12, '锐角三角函数', '图形与几何-三角函数', 'kp-math-intro', 1, '2022义教课标·初三下', 0.65, 63);

-- ---------- 高中数学（高一上~高三下） ----------
INSERT OR IGNORE INTO knowledge_points (id, subject, stage, grade_level, name, code, parent_id, depth, curriculum_ref, difficulty_base, order_index) VALUES
  ('kp-math-hs-intro',    'math', '高中', 13, '高中数学总纲', '高中数学', NULL, 0, '2017版高中课标', 0.5, 100),
  -- 高一上（13）：集合 / 函数 / 指数对数
  ('kp-math-sets',        'math', '高中', 13, '集合与常用逻辑用语', '高中数学-集合', 'kp-math-hs-intro', 1, '2017版高中课标·必修一', 0.4, 110),
  ('kp-math-func-basic',  'math', '高中', 13, '函数概念与性质', '高中数学-函数', 'kp-math-hs-intro', 1, '2017版高中课标·必修一', 0.5, 120),
  ('kp-math-explog',      'math', '高中', 13, '指数与对数函数', '高中数学-指数对数', 'kp-math-hs-intro', 1, '2017版高中课标·必修一', 0.55, 130),
  -- 高一下（14）：平面向量 / 复数
  ('kp-math-vector2d',    'math', '高中', 14, '平面向量', '高中数学-平面向量', 'kp-math-hs-intro', 1, '2017版高中课标·必修二', 0.55, 131),
  ('kp-math-complex',     'math', '高中', 14, '复数', '高中数学-复数', 'kp-math-hs-intro', 1, '2017版高中课标·必修二', 0.5, 132),
  -- 高二上（15）：三角函数 / 数列
  ('kp-math-trig',        'math', '高中', 15, '三角函数', '高中数学-三角函数', 'kp-math-hs-intro', 1, '2017版高中课标·必修一', 0.6, 140),
  ('kp-math-seq',         'math', '高中', 15, '数列', '高中数学-数列', 'kp-math-hs-intro', 1, '2017版高中课标·选择性必修二', 0.6, 150),
  -- 高二下（16）：计数原理 / 随机变量
  ('kp-math-count',       'math', '高中', 16, '计数原理', '高中数学-计数原理', 'kp-math-hs-intro', 1, '2017版高中课标·选择性必修三', 0.6, 151),
  ('kp-math-randomvar',   'math', '高中', 16, '随机变量及其分布', '高中数学-随机变量', 'kp-math-hs-intro', 1, '2017版高中课标·选择性必修三', 0.65, 152),
  -- 高三上（17）：导数 / 空间向量 / 圆锥曲线 / 概率统计
  ('kp-math-derivative',  'math', '高中', 17, '导数及其应用', '高中数学-导数', 'kp-math-hs-intro', 1, '2017版高中课标·选择性必修二', 0.7, 160),
  ('kp-math-vector',      'math', '高中', 17, '空间向量与立体几何', '高中数学-空间向量', 'kp-math-hs-intro', 1, '2017版高中课标·选择性必修一', 0.7, 170),
  ('kp-math-conic',       'math', '高中', 17, '圆锥曲线', '高中数学-圆锥曲线', 'kp-math-hs-intro', 1, '2017版高中课标·选择性必修一', 0.75, 180),
  ('kp-math-probstat',    'math', '高中', 17, '概率与统计', '高中数学-概率统计', 'kp-math-hs-intro', 1, '2017版高中课标·必修二', 0.6, 190),
  -- 高三下（18）：综合复习
  ('kp-math-review',      'math', '高中', 18, '高考综合复习', '高中数学-综合复习', 'kp-math-hs-intro', 1, '2017版高中课标·总复习', 0.75, 200);
