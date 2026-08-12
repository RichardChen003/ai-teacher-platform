-- ============================================================
-- 知识点图谱种子数据（初中数学 · 示例子集）
-- 依据：教育部 2022 年版义务教育课程标准（数学）
-- 仅含"数与代数-有理数"分支示例，W3 阶段补全全学科
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
