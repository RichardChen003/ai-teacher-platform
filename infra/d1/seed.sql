-- ============================================================
-- 知识点图谱种子数据（初中数学 + 高中数学示例）
-- 依据：教育部 2022 年版义务教育课程标准 + 2017 年版普通高中课程标准
-- 初中：数与代数-有理数分支示例；高中：核心模块（高三总复习诊断用）
-- ============================================================

INSERT OR IGNORE INTO knowledge_points (id, subject, stage, grade_level, name, code, parent_id, depth, curriculum_ref, difficulty_base, order_index) VALUES
  ('kp-math-intro',      'math', '初中', 7, '数与代数', '数与代数', NULL, 0, '2022义教课标·数与代数', 0.4, 1),
  ('kp-math-rational',   'math', '初中', 7, '有理数',   '数与代数-有理数', 'kp-math-intro', 1, '2022义教课标·7年级', 0.4, 10),
  ('kp-math-rational-op','math', '初中', 7, '有理数的运算', '数与代数-有理数-运算', 'kp-math-rational', 2, '2022义教课标·7年级', 0.5, 11),
  ('kp-math-rational-num','math', '初中', 7, '数轴与相反数', '数与代数-有理数-数轴', 'kp-math-rational', 2, '2022义教课标·7年级', 0.35, 12),
  ('kp-math-rational-abs','math', '初中', 7, '绝对值',  '数与代数-有理数-绝对值', 'kp-math-rational', 2, '2022义教课标·7年级', 0.45, 13),
  ('kp-math-exp',        'math', '初中', 7, '整式的加减', '数与代数-整式', 'kp-math-intro', 1, '2022义教课标·7年级', 0.5, 20),
  ('kp-math-equation',   'math', '初中', 7, '一元一次方程', '数与代数-方程', 'kp-math-intro', 1, '2022义教课标·7年级', 0.55, 30),
  ('kp-math-ineq',       'math', '初中', 7, '不等式与不等式组', '数与代数-不等式', 'kp-math-intro', 1, '2022义教课标·7年级', 0.55, 40),
  ('kp-math-func',       'math', '初中', 8, '一次函数', '数与代数-函数', 'kp-math-intro', 1, '2022义教课标·8年级', 0.6, 50),
  ('kp-math-quadratic',  'math', '初中', 9, '二次函数', '数与代数-函数', 'kp-math-intro', 1, '2022义教课标·9年级', 0.7, 60);

-- ---------- 高中数学核心模块（高三总复习诊断使用） ----------
INSERT OR IGNORE INTO knowledge_points (id, subject, stage, grade_level, name, code, parent_id, depth, curriculum_ref, difficulty_base, order_index) VALUES
  ('kp-math-hs-intro',    'math', '高中', 10, '高中数学总纲', '高中数学', NULL, 0, '2017版高中课标', 0.5, 100),
  ('kp-math-sets',        'math', '高中', 10, '集合与常用逻辑用语', '高中数学-集合', 'kp-math-hs-intro', 1, '2017版高中课标·必修一', 0.4, 110),
  ('kp-math-func-basic',  'math', '高中', 10, '函数概念与性质', '高中数学-函数', 'kp-math-hs-intro', 1, '2017版高中课标·必修一', 0.5, 120),
  ('kp-math-explog',      'math', '高中', 10, '指数与对数函数', '高中数学-指数对数', 'kp-math-hs-intro', 1, '2017版高中课标·必修一', 0.55, 130),
  ('kp-math-trig',        'math', '高中', 11, '三角函数', '高中数学-三角函数', 'kp-math-hs-intro', 1, '2017版高中课标·必修一', 0.6, 140),
  ('kp-math-seq',         'math', '高中', 11, '数列', '高中数学-数列', 'kp-math-hs-intro', 1, '2017版高中课标·选择性必修二', 0.6, 150),
  ('kp-math-derivative',  'math', '高中', 12, '导数及其应用', '高中数学-导数', 'kp-math-hs-intro', 1, '2017版高中课标·选择性必修二', 0.7, 160),
  ('kp-math-vector',      'math', '高中', 12, '空间向量与立体几何', '高中数学-空间向量', 'kp-math-hs-intro', 1, '2017版高中课标·选择性必修一', 0.7, 170),
  ('kp-math-conic',       'math', '高中', 12, '圆锥曲线', '高中数学-圆锥曲线', 'kp-math-hs-intro', 1, '2017版高中课标·选择性必修一', 0.75, 180),
  ('kp-math-probstat',    'math', '高中', 12, '概率与统计', '高中数学-概率统计', 'kp-math-hs-intro', 1, '2017版高中课标·必修二', 0.6, 190);
