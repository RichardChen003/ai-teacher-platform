# AI 老师平台（AI Tutor Platform）

面向初高中学生的 AI 个性化教学平台：**入测诊断 → 专属 AI 老师 → 个性化大纲 → 数字人授课 → 课后小测 → 大纲微调**，形成完整的学习闭环。

> 目标环境：Cloudflare 全托管（前端静态资源 + 后端 Worker + D1 数据库 + R2 存储 + Queues 异步任务），生产级、可上线。

## 核心功能（MVP）

| 模块 | 说明 |
|---|---|
| ① 入测诊断 | 新用户首次注册后智能组卷，判断各知识点掌握情况，产出诊断报告与掌握度画像 |
| ② 老师智能体 | 基于学生画像 + 知识点图谱 + 课程上下文的 AI 老师（人设、流式对话、工具调用） |
| ③ 大纲生成 | 依据诊断报告 + 课标 + 时间预算，生成个性化教学大纲（可人工微调） |
| ④ PPT 生成 | 大纲 → 逐页课件 JSON → PPTX（可下载）与网页版演示（用于授课） |
| ⑤ 数字人讲解 | 2D Live2D 数字人形象 + TTS 语音 + 口型同步，配合课件逐页讲解、随时提问 |
| ⑥ 课后小测 | 每节课结束生成小测 → 更新掌握度 → 微调大纲 → 为下节课做准备 |
| ⑦ 基础能力 | 登录/注册（邮箱+密码，后续 OAuth）、个人中心（档案、错题本、进度、学习记录） |

## 技术栈速览

- **前端**：Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router v7 + TanStack Query
- **后端**：Hono（TypeScript）on Cloudflare Workers，Zod 校验，Better Auth 认证
- **数据**：Cloudflare D1（SQLite）/ R2（PPT、音频、素材）/ KV（会话缓存）/ Vectorize（RAG 向量检索）
- **异步**：Cloudflare Queues（PPT/大纲/小测等生成任务）+ Cron Triggers
- **AI**：Vercel AI SDK v5 + DeepSeek（主力）/ GLM / Qwen，经 Cloudflare AI Gateway 统一接入（缓存、限流、降级、观测）
- **数字人**：2D Live2D（pixi-live2d-display）+ TTS（MVP 用 Edge-TTS，生产换火山/阿里云）
- **部署**：单个全栈 Worker（Static Assets + API 同仓部署），GitHub Actions + Wrangler 自动发布

详见 [docs/01-技术方案.md](docs/01-技术方案.md)（架构、数据模型、API、成本、合规上线清单）。

## 目录结构

```
ai-teacher-platform/
├── apps/
│   ├── api/                  # Hono API（Worker 入口，含全部路由骨架）
│   └── web/                  # Vite + React 前端 SPA
├── packages/shared/          # 共享类型与 DTO（前后端同源）
├── infra/d1/                 # D1 数据库 schema.sql + seed.sql
├── resources/                # 已下载的开源资源（题库样例、数字人形象等，附许可说明）
├── scripts/                  # 资源下载脚本
├── docs/                     # 技术方案 / 资源清单 / 开发路线图
├── wrangler.toml             # 全栈 Worker 配置（assets + D1/R2/KV/Queues）
└── .github/workflows/        # 自动部署流水线
```

## 快速开始（本地开发）

前置：Node.js ≥ 20、npm、[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)（`npm i -g wrangler`）。

```bash
# 1. 安装依赖（npm workspaces 单仓）
npm install

# 2. 本地创建 D1 数据库（首次）
wrangler d1 create ai-teacher-db            # 把返回的 database_id 填入 wrangler.toml
wrangler d1 execute ai-teacher-db --local --file=infra/d1/schema.sql

# 3. 启动后端（默认 :8787）与前端（默认 :5173，/api 已代理到后端）
npm run dev:api
npm run dev:web
```

## 部署（Cloudflare）

```bash
# 配置账号
wrangler login
# 创建生产 D1 / R2 bucket / KV namespace 后填入 wrangler.toml（见 docs/01-技术方案.md §部署）
# 一键部署（前端构建产物作为 Static Assets 与 API 同仓发布）
npm run deploy
```

或直接推送到 GitHub，由 `.github/workflows/deploy.yml` 自动构建发布。

## 文档索引

- [docs/01-技术方案.md](docs/01-技术方案.md) — 架构设计、技术选型、数据模型、API 设计、部署、成本、合规上线清单
- [docs/02-资源清单.md](docs/02-资源清单.md) — 资源需求判断、许可说明、下载方式
- [docs/03-开发路线图.md](docs/03-开发路线图.md) — 6 周 MVP 时间线与验收标准

> 注意：本平台定位为"学习辅助工具"。面向中国大陆上线涉及生成式 AI 备案、未成年人保护、内容安全、数据出境等合规事项，详见技术方案 §9，务必在上线前完成评估。
