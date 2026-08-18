-- ============================================================
-- 第16章 计数原理 补题（16学期, 知识点 213-224）
-- 参数化原创题 source='template-hs'
-- ============================================================
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0213-1','math','高中',16,'hs-kp-0213','single_choice',0.65,'A 到 B 有 2 条路，B 到 C 有 2 条路，A 经 B 到 C 有？种','[{"key":"A","text":"4"},{"key":"B","text":"4"},{"key":"C","text":"2"},{"key":"D","text":"0"}]','A','分步乘法：2×2=4','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0214-1','math','高中',16,'hs-kp-0214','single_choice',0.75,'A 到 B 有 3 条路，A 到 C 有 2 条路（互斥），A 到 B 或 C 有？种','[{"key":"A","text":"5"},{"key":"B","text":"6"},{"key":"C","text":"3"},{"key":"D","text":"1"}]','A','分类加法：3+2=5','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0215-1','math','高中',16,'hs-kp-0215','single_choice',0.35,'P(4,2) = 4×(4-1) = ？','[{"key":"A","text":"12"},{"key":"B","text":"4"},{"key":"C","text":"6"},{"key":"D","text":"6"}]','A','P(n,2)=n(n-1)=12','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0216-1','math','高中',16,'hs-kp-0216','single_choice',0.45,'C(4,2) = 4(4-1)/2 = ？','[{"key":"A","text":"6"},{"key":"B","text":"4"},{"key":"C","text":"12"},{"key":"D","text":"2"}]','A','C(n,2)=n(n-1)/2=6','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0217-1','math','高中',16,'hs-kp-0217','single_choice',0.55,'C(n,0) = ？','[{"key":"A","text":"1"},{"key":"B","text":"8"},{"key":"C","text":"0"},{"key":"D","text":"4"}]','A','组合数性质：C(n,0)=1','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0218-1','math','高中',16,'hs-kp-0218','single_choice',0.65,'5 人排成一排，甲必须排首位，排法 = ？','[{"key":"A","text":"4!"},{"key":"B","text":"5!"},{"key":"C","text":"4"},{"key":"D","text":"20"}]','A','甲固定首位，其余 4 人全排列 = 4!','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0219-1','math','高中',16,'hs-kp-0219','single_choice',0.75,'从 6 人中选 3 人（甲不在内）→ 从 5 人选：C(5,2) = ？','[{"key":"A","text":"10"},{"key":"B","text":"15"},{"key":"C","text":"5"},{"key":"D","text":"6"}]','A','C(5,2)=(5)(4)/2=10','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0220-1','math','高中',16,'hs-kp-0220','single_choice',0.35,'5 人站一排，甲乙捆绑：先绑后排，方法数 = 2×4! 的关键是？','[{"key":"A","text":"捆绑法"},{"key":"B","text":"插空法"},{"key":"C","text":"隔板法"},{"key":"D","text":"直接排"}]','A','相邻问题用捆绑法','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0221-1','math','高中',16,'hs-kp-0221','single_choice',0.45,'(1+x)^4 展开式共有？项','[{"key":"A","text":"5"},{"key":"B","text":"4"},{"key":"C","text":"8"},{"key":"D","text":"3"}]','A','二项式展开共 n+1 = 5 项','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0222-1','math','高中',16,'hs-kp-0222','single_choice',0.55,'(1+x)^4 的通项 T_{k+1} = C(4,k)x^k，k=2 时系数 = ？','[{"key":"A","text":"C(4,2)"},{"key":"B","text":"4"},{"key":"C","text":"2"},{"key":"D","text":"6"}]','A','T_{k+1}=C(n,k)x^k，系数 C(4,2)','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0223-1','math','高中',16,'hs-kp-0223','single_choice',0.65,'(a+b)^6 展开式二项式系数之和 = ？','[{"key":"A","text":"64"},{"key":"B","text":"6"},{"key":"C","text":"36"},{"key":"D","text":"12"}]','A','二项式系数和 = 2ⁿ = 64','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0224-1','math','高中',16,'hs-kp-0224','single_choice',0.75,'(1+x)^5 各项系数之和 = f(1) = ？','[{"key":"A","text":"32"},{"key":"B","text":"1"},{"key":"C","text":"5"},{"key":"D","text":"0"}]','A','令 x=1：各项系数和 = (1+1)^5 = 32','template-hs','approved','通用');