-- ============================================================
-- AI 老师平台 · Cloudflare D1 (SQLite) 主 Schema
-- 应用: wrangler d1 execute ai-teacher-db --local --file=infra/d1/schema.sql
-- ============================================================

-- ---------- 用户与认证 ----------
-- Better Auth 核心表（d1Native 模式 + Kysely D1 dialect）
-- 注意：字段必须为 camelCase（Better Auth 1.6+ 默认字段名），表名用 auth_ 前缀并在代码中映射 modelName
CREATE TABLE IF NOT EXISTS auth_user (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image         TEXT,
  createdAt     INTEGER NOT NULL,
  updatedAt     INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS auth_session (
  id          TEXT PRIMARY KEY,
  expiresAt   INTEGER NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  createdAt   INTEGER NOT NULL,
  updatedAt   INTEGER NOT NULL,
  ipAddress   TEXT,
  userAgent   TEXT,
  userId      TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS auth_account (
  id                     TEXT PRIMARY KEY,
  accountId              TEXT NOT NULL,
  providerId             TEXT NOT NULL,
  userId                 TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  accessToken            TEXT,
  refreshToken           TEXT,
  idToken                TEXT,
  accessTokenExpiresAt   INTEGER,
  refreshTokenExpiresAt  INTEGER,
  scope                  TEXT,
  password               TEXT,
  createdAt              INTEGER NOT NULL,
  updatedAt              INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS auth_verification (
  id          TEXT PRIMARY KEY,
  identifier  TEXT NOT NULL,
  value       TEXT NOT NULL,
  expiresAt   INTEGER NOT NULL,
  createdAt   INTEGER NOT NULL,
  updatedAt   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_account_user ON auth_account(userId);
CREATE INDEX IF NOT EXISTS idx_auth_session_user ON auth_session(userId);

-- 业务档案（认证成功后自动建档）
CREATE TABLE IF NOT EXISTS users (
  id               TEXT PRIMARY KEY,
  email            TEXT UNIQUE,
  name             TEXT NOT NULL DEFAULT '',
  role             TEXT NOT NULL DEFAULT 'student',   -- student | parent | admin
  grade            INTEGER,                            -- 7..12（初一=7）
  subject          TEXT,                               -- 主学科: math / physics / ...
  textbook_version TEXT,                               -- 教材版本: 人教版 / 北师大版 / ...
  goal_date        TEXT,                               -- 目标日期(中考/期末/高考)
  weekly_hours     REAL DEFAULT 4,                     -- 每周可投入课时
  avatar_url       TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Better Auth 需要以下表（用 better-auth-cloudflare d1Native 时自动创建，或见其文档）：
-- auth_user / auth_session / auth_account / auth_verification ...

-- ---------- 知识点图谱（树） ----------
CREATE TABLE IF NOT EXISTS knowledge_points (
  id              TEXT PRIMARY KEY,
  subject         TEXT NOT NULL,           -- math / physics / chemistry ...
  stage           TEXT NOT NULL,           -- 初中 | 高中
  grade_level     INTEGER,                 -- 7..12
  name            TEXT NOT NULL,
  code            TEXT,                    -- 课标编号，如 数与代数-有理数-01
  parent_id       TEXT REFERENCES knowledge_points(id),
  depth           INTEGER NOT NULL DEFAULT 0,
  curriculum_ref  TEXT,                    -- 课标出处
  difficulty_base REAL NOT NULL DEFAULT 0.5,
  order_index     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_kp_parent ON knowledge_points(parent_id);
CREATE INDEX IF NOT EXISTS idx_kp_subject ON knowledge_points(subject, stage);

-- ---------- 题库 ----------
CREATE TABLE IF NOT EXISTS questions (
  id                 TEXT PRIMARY KEY,
  subject            TEXT NOT NULL,
  stage              TEXT NOT NULL,
  grade_level        INTEGER,
  knowledge_point_id TEXT REFERENCES knowledge_points(id),
  type               TEXT NOT NULL,        -- single_choice / multi_choice / blank / short_answer
  difficulty         REAL NOT NULL DEFAULT 0.5,  -- 0~1
  content            TEXT NOT NULL,        -- 题干（支持 LaTeX）
  options            TEXT,                 -- JSON: [{"key":"A","text":"..."}]
  answer             TEXT NOT NULL,        -- 标准答案
  analysis           TEXT,                 -- 解析/评分标准
  source             TEXT NOT NULL DEFAULT 'llm',  -- dataset | llm | teacher | template
  review_status      TEXT NOT NULL DEFAULT 'approved',  -- pending | approved | rejected
  tags               TEXT,                 -- JSON 数组
  textbook_version   TEXT NOT NULL DEFAULT '人教版',  -- 教材版本：人教版 / 北师大版 / 苏教版 / 华师大版 / 湘教版 / 沪教版 / 浙教版 / 通用
  level              TEXT NOT NULL DEFAULT '基础',  -- 难度档次：基础 / 中档 / 压轴
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_q_kp   ON questions(knowledge_point_id);
CREATE INDEX IF NOT EXISTS idx_q_draw ON questions(subject, grade_level, difficulty, review_status);
CREATE INDEX IF NOT EXISTS idx_q_tb   ON questions(subject, grade_level, textbook_version, review_status);
CREATE INDEX IF NOT EXISTS idx_q_lv   ON questions(subject, grade_level, level, review_status);

-- ---------- 测评（入测 / 课后小测） ----------
CREATE TABLE IF NOT EXISTS assessments (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  kind          TEXT NOT NULL,             -- diagnosis | quiz | midterm
  subject       TEXT NOT NULL,
  stage         TEXT,
  grade_level   INTEGER,
  status        TEXT NOT NULL DEFAULT 'in_progress',  -- in_progress | completed | scored
  question_ids  TEXT NOT NULL,             -- JSON 组卷快照（题目列表 + 顺序）
  score         REAL,
  max_score     REAL,
  meta          TEXT,                      -- JSON（组卷参数、自适应轨迹等）
  started_at    TEXT,
  completed_at  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_assess_user ON assessments(user_id, created_at);

CREATE TABLE IF NOT EXISTS assessment_answers (
  id             TEXT PRIMARY KEY,
  assessment_id  TEXT NOT NULL REFERENCES assessments(id),
  question_id    TEXT NOT NULL REFERENCES questions(id),
  user_answer    TEXT,
  is_correct     INTEGER,
  score          REAL,                     -- 主观题得分
  max_score      REAL,
  time_spent_sec INTEGER,
  answered_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_ans_assess ON assessment_answers(assessment_id);

-- ---------- 掌握度（user × knowledge_point，Beta-binomial） ----------
CREATE TABLE IF NOT EXISTS mastery (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL,
  knowledge_point_id  TEXT NOT NULL,
  alpha               REAL NOT NULL DEFAULT 2,   -- Beta 先验参数
  beta                REAL NOT NULL DEFAULT 2,
  level               REAL NOT NULL DEFAULT 0.5, -- 冗余: alpha/(alpha+beta)
  confidence          REAL NOT NULL DEFAULT 0.3, -- 置信度（随做题量上升）
  attempts            INTEGER NOT NULL DEFAULT 0,
  correct_count       INTEGER NOT NULL DEFAULT 0,
  last_assessment_id  TEXT,
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, knowledge_point_id)
);
CREATE INDEX IF NOT EXISTS idx_mastery_user ON mastery(user_id);

-- ---------- 教学大纲 ----------
CREATE TABLE IF NOT EXISTS syllabi (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id),
  subject               TEXT NOT NULL,
  title                 TEXT NOT NULL,
  goal                  TEXT,              -- 总目标
  structure             TEXT NOT NULL,     -- JSON: {units:[{title,lessons:[...]}]}
  version               INTEGER NOT NULL DEFAULT 1,
  status                TEXT NOT NULL DEFAULT 'active',  -- active | archived
  source_assessment_id  TEXT,              -- 由哪次诊断生成
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_syllabi_user ON syllabi(user_id, updated_at);

CREATE TABLE IF NOT EXISTS syllabus_revisions (
  id           TEXT PRIMARY KEY,
  syllabus_id  TEXT NOT NULL REFERENCES syllabi(id),
  diff         TEXT NOT NULL,              -- JSON 变更描述
  reason       TEXT,                       -- 触发原因（小测结果摘要）
  source_quiz_id TEXT,
  applied      INTEGER NOT NULL DEFAULT 0, -- 用户是否确认应用
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_syllrev_syl ON syllabus_revisions(syllabus_id);

-- ---------- 课时 ----------
CREATE TABLE IF NOT EXISTS lessons (
  id                  TEXT PRIMARY KEY,
  syllabus_id         TEXT NOT NULL REFERENCES syllabi(id),
  seq                 INTEGER NOT NULL,
  title               TEXT NOT NULL,
  objectives          TEXT,                -- JSON 本课目标
  knowledge_point_ids TEXT,                -- JSON
  duration_min        INTEGER DEFAULT 45,
  status              TEXT NOT NULL DEFAULT 'pending', -- pending | prepared | delivered | reviewed
  ppt_asset_id        TEXT,                -- assets.id
  scene_id            TEXT,                -- 数字人场景配置
  quiz_assessment_id  TEXT,                -- 课后小测 assessment.id
  delivered_at        TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lessons_syl ON lessons(syllabus_id, seq);

-- ---------- 生成资产（PPT / 音频 / 图片） ----------
CREATE TABLE IF NOT EXISTS assets (
  id          TEXT PRIMARY KEY,
  owner_id    TEXT NOT NULL,
  kind        TEXT NOT NULL,               -- ppt | pptx | audio | avatar_video | image
  r2_key      TEXT NOT NULL,
  mime        TEXT,
  size_bytes  INTEGER,
  meta        TEXT,                        -- JSON（页数、章节、耗时等）
  status      TEXT NOT NULL DEFAULT 'processing',  -- processing | ready | failed
  error       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner_id, kind, created_at);

-- ---------- AI 用量日志（成本核算 / 审计） ----------
CREATE TABLE IF NOT EXISTS ai_logs (
  id                TEXT PRIMARY KEY,
  user_id           TEXT,
  action            TEXT NOT NULL,         -- gen_question / gen_syllabus / gen_ppt / explain / quiz_feedback / chat
  model             TEXT,
  prompt_tokens     INTEGER,
  completion_tokens INTEGER,
  cost_cents        REAL,                  -- 成本（人民币分）
  latency_ms        INTEGER,
  status            TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ailogs_time ON ai_logs(created_at);

-- ---------- 学习反馈 ----------
CREATE TABLE IF NOT EXISTS feedbacks (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  lesson_id  TEXT,
  rating     INTEGER,                      -- 1~5
  comment    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
