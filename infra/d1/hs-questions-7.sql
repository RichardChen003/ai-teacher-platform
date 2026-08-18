-- ============================================================
-- 第7章 复数 补题（14学期, 知识点 88-96）
-- 参数化原创题 source='template-hs'
-- ============================================================
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0088-1','math','高中',14,'hs-kp-0088','single_choice',0.65,'i^4 = ？','[{"key":"A","text":1},{"key":"B","text":"1"},{"key":"C","text":"-1"},{"key":"D","text":"i"}]','A','i 的幂以 4 为周期：i^4=1','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0089-1','math','高中',14,'hs-kp-0089','single_choice',0.75,'z=4+2i，|z| = ？','[{"key":"A","text":"4.47213595499958"},{"key":"B","text":"6"},{"key":"C","text":"8"},{"key":"D","text":"-2"}]','A','|z|=√(4²+2²)=4.47213595499958','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0090-1','math','高中',14,'hs-kp-0090','single_choice',0.35,'z=1+3i，则 z̄ = ？','[{"key":"A","text":"1-3i"},{"key":"B","text":"-1-3i"},{"key":"C","text":"-1+3i"},{"key":"D","text":"1+3i"}]','A','共轭复数：虚部变号，z̄=1-3i','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0091-1','math','高中',14,'hs-kp-0091','single_choice',0.45,'z=4+5i，z·z̄ = ？','[{"key":"A","text":"41"},{"key":"B","text":"16"},{"key":"C","text":"25"},{"key":"D","text":"9"}]','A','z·z̄=a²+b²=4²+5²=41','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0092-1','math','高中',14,'hs-kp-0092','single_choice',0.55,'(1+2i)+(1+3i) = ？','[{"key":"A","text":"2+5i"},{"key":"B","text":"2-5i"},{"key":"C","text":"0+-1i"},{"key":"D","text":"1+6i"}]','A','复数加法：实部加实部，虚部加虚部 = 2+5i','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0093-1','math','高中',14,'hs-kp-0093','single_choice',0.65,'复数 z=3+1i 在复平面内对应的点？','[{"key":"A","text":"(3,1)"},{"key":"B","text":"(1,3)"},{"key":"C","text":"(3,-1)"},{"key":"D","text":"(-3,1)"}]','A','z=a+bi 对应点 (a,b) = (3,1)','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0094-1','math','高中',14,'hs-kp-0094','single_choice',0.75,'若 2+2i = x+yi，则 x、y = ？','[{"key":"A","text":"x=2，y=2"},{"key":"B","text":"x=2，y=2"},{"key":"C","text":"x=2，y=-2"},{"key":"D","text":"x=-2，y=2"}]','A','复数相等：实部实部、虚部虚部相等','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0095-1','math','高中',14,'hs-kp-0095','single_choice',0.35,'复数 z 为实数的条件是？','[{"key":"A","text":"虚部=0"},{"key":"B","text":"实部=0"},{"key":"C","text":"实部=虚部"},{"key":"D","text":"模=1"}]','A','z=a+bi 为实数 ⇔ b=0','template-hs','approved','通用');
INSERT OR IGNORE INTO questions (id, subject, stage, grade_level, knowledge_point_id, type, difficulty, content, options, answer, analysis, source, review_status, textbook_version) VALUES
('hq-0096-1','math','高中',14,'hs-kp-0096','single_choice',0.45,'|3+2i| 与 |2+3i| 的关系？','[{"key":"A","text":"相等"},{"key":"B","text":"前者大"},{"key":"C","text":"后者大"},{"key":"D","text":"无法比较"}]','A','两者模均为 √13，相等','template-hs','approved','通用');