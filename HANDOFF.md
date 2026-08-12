# AI 老师平台 · 项目交接文档（HANDOFF）

> **写给下一位开发者**：本文档是接手本项目的唯一入口。请先完整阅读本文，
> 再进入 `docs/` 目录查看详细技术方案。开发环境是本机 Windows（Git Bash），
> Node 22（managed，路径见文末「运行环境」）。

---

## 一、我们要开发什么（产品定义）

**一句话**：初高中学生专属的 AI 个性化教学平台，核心是「数字人老师」陪学。

**学习闭环（产品的核心故事）**：

```
入测诊断 → 诊断报告 → 专属教学大纲 → 数字人课堂（课件+讲解） → 课后小测 → 大纲微调
   ↑                                                                        │
   └────────────────────────── 循环往复，动态适应 ────────────────────────────┘
```

**目标用户**：初高中学生（MVP 以初中数学 7 年级为试点科目）。
**上线导向**：整个项目要真实部署上线（Cloudflare 全托管），不是玩具。

### 功能模块清单

| # | 模块 | 说明 | 状态 |
|---|------|------|------|
| ① | 入测诊断 | 新用户做题 → 客观题自动判分 → 掌握度画像 | ✅ 后端完成 + 前端完成 |
| ② | 诊断报告 | 知识点掌握度条形图、薄弱点、综合水平 | ✅ 完成 |
| ③ | 教学大纲 | 基于掌握度规则生成课时计划（LLM 可插拔） | ✅ 后端完成 + 前端完成 |
| ④ | 课件/PPT | 课件 JSON（网页演示）+ PPTX 导出（pptxgenjs） | ✅ 后端完成 + 前端页面完成 |
| ⑤ | 数字人课堂 | Live2D 形象 + Web Speech 语音讲解 + 幻灯片翻页 | ✅ 前端完成（Live2D 需验证） |
| ⑥ | 课后小测 | 每课小测 → 判分 → 掌握度更新 → 大纲微调信号 | ✅ 后端完成 + 前端完成 |
| ⑦ | 认证/用户中心 | 邮箱密码注册登录（Better Auth）+ 学习档案 | ✅ **已修复，注册/登录/会话全流程可用** |
| ⑧ | 对话答疑 | 课堂内随时提问 | 🟡 已接通 DeepSeek（无 key 时返回演示提示，有 key 真实回答） |

> **当前阶段结论**：MVP 六模块**功能全链路已打通**（认证 + 诊断 → 大纲 → 课件 → 小测全链路本地实测通过），
> 前端 UI 已按产品级标准重做（品牌化设计系统）。剩余工作是「Cloudflare 线上部署 + 生产题库 + 合规项」。

---

## 二、目前开发到哪个步骤了（当前状态）

### ✅ 已完成

1. **技术选型与方案**：`docs/01-技术方案.md`（架构/API/成本/合规）、`docs/02-资源清单.md`（许可红线）、`docs/03-开发路线图.md`（W1~W6）
2. **项目骨架**：monorepo（`packages/shared` + `apps/api` + `apps/web` + `infra/d1`），单个全栈 Worker 部署形态
3. **数据库**：D1 schema + seed（users/knowledge_points/questions/assessments/mastery/syllabi/lessons/assets + auth_* 认证表），本地已应用验证
4. **题库**：`infra/d1/questions-seed.sql` 自建 18 道初中数学题（含解析，已入库）；另有 3 套开源数据集在 `resources/question-bank/`（仅开发验证，**不可进生产**）
5. **后端核心逻辑**（全部真实实现，非桩）：
   - 组卷：分层抽样、学生端剔除答案
   - 判分：客观题自动判分 + 解答题近似判分
   - 掌握度：Beta 分布（α/β 参数）更新，`apps/api/src/lib/mastery.ts`
   - 大纲生成：规则引擎（弱项优先、按周排课），`apps/api/src/lib/teaching.ts`
   - 课件生成 + PPTX 渲染（pptxgenjs，存 R2）
   - 课后小测：抽题 → 判分 → 掌握度更新 → 课时状态流转
6. **前端 UI（本次重点）**：品牌化设计系统重做 ——
   - 侧边栏布局、渐变主色（靛蓝+橙）、卡片/按钮/徽章/进度条组件库（`apps/web/src/index.css`）
   - 页面：登录（含「快速体验 Demo」入口）、工作台（学习闭环四步卡+统计）、诊断（配置→答题→报告三步，含掌握度条形图）、大纲（课时时间线+生成配置）、AI 课堂（数字人+语音+PPT+小测弹窗）、个人中心
7. **Demo 免登录模式**：后端 `DEMO_MODE=true` 时，前端带 `x-demo: 1` 头即以演示用户身份访问全部业务接口（生产关闭即失效，无安全风险）
8. **资源下载**：Live2D 形象（Haru/Hiyori）+ 3 套开源题库 + 许可记录，共 76 文件 / 24MB（`resources/`），脚本 `scripts/download_resources.mjs` 可重跑
9. **验证记录**：
   - API typecheck ✅ / 前端 build ✅（vite build 通过，产物 ~90KB gzip）
   - wrangler dev 本地冒烟：health ✅、知识点图谱 ✅、组卷链路 ✅（答案正确剔除）、注册接口路由曾 404 已修（见踩坑）

### 🟡 部分完成 / 已知问题

| 问题 | 说明 | 影响 |
|------|------|------|
| ~~Better Auth 注册/登录~~ | ✅ **已修复（2026-08-12）**：`withCloudflare` 必须传 `cf`（否则配置阶段同步抛错）+ `autoDetectIpAddress/geolocationTracking` 关闭；表名映射 `auth_*`；schema 字段改 camelCase。注册/登录/会话全流程 curl 实测通过 | 已解决 |
| Live2D 渲染 | 模型已复制到 `apps/web/public/live2d`（9MB），组件有超时/异常自动降级为静态形象；dev server 资源 200 | 需人工浏览器确认 WebGL 渲染效果 |
| 语音讲解 | 用浏览器 Web Speech API（免费、中文可读） | 移动端兼容性一般，上线可换 TTS API |
| 大纲微调 | 小测后 `lessons.status=delivered` 已写入 + `syllabus_revisions` 记录已写入，但「自动重排大纲并应用」的增强逻辑未做 | MVP 可用，进阶功能 |
| LLM | `lib/llm.ts` 已实现 DeepSeek 调用（chatText/chatJSON + ai_logs 用量记录），大纲/课件/答疑三处接入，失败自动回退规则引擎（已验证） | 需配置 `LLM_API_KEY` 生效 |
| 部署 | 本地跑通，**Cloudflare 线上部署未执行**（需账号 + 创建资源） | 下一步核心任务 |

### ⬜ 未开始

- 部署上线（wrangler deploy + 资源开通 + 域名 + 环境变量）
- 生产题库建设（原创 + LLM 生成 + 人工审核，见 docs/02）
- 合规项（未成年人保护、内容安全审核接入，见 docs/01 上线清单）

---

## 三、接下来要做什么（Roadmap）

**建议顺序（按价值排序）**：

### P0 · 立即（1~2 天）
1. **前端端到端走查**：✅ 已用 playwright-core 驱动 Edge 无头走查（脚本 `scripts/e2e-assert.mjs`、`scripts/e2e-walkthrough.mjs`）：
   `登录 → Demo → 工作台 → 诊断(逐题作答) → 报告 → 大纲(生成12课时) → 课堂(课件) → 个人中心` 全部断言通过，
   无 console 错误；Live2D 资源 200。
2. **补齐诊断页容错**：题库为空时已有空态提示（`题库为空，无法组卷`），交卷失败有 error 展示。

### P1 · 本周（3~5 天）
3. ~~认证落地~~：✅ **已完成（见上）**。注册/登录/会话可用，登录页可放开「注册」入口。
4. **Cloudflare 部署**：
   - `wrangler login` → `wrangler d1 create ai-teacher-db` → `wrangler kv namespace create` → 建 R2 桶 → 队列
   - 把真实 ID 填进 `wrangler.toml`
   - 环境变量进 Dashboard Secrets（BETTER_AUTH_SECRET / LLM_API_KEY 等）
   - `npm run build && wrangler deploy`
   - 生产 `DEMO_MODE` 移除或置 false
5. ~~LLM 接入~~：✅ **已完成**：`lib/llm.ts`（DeepSeek）+ 大纲/课件/答疑三处接入，`LLM_API_KEY` 存在即生效，失败回退规则引擎。

### P2 · 上线前（1~2 周）
6. 生产题库（原创+生成+审核）、内容安全审核、监护人同意流程、隐私合规自查（docs/01 清单）
7. 域名 + SSL + 大陆访问评估（静态资源缓存兜底）

---

## 四、技术栈全览

| 层 | 选型 | 版本 | 说明 / 备选 |
|----|------|------|------------|
| 部署形态 | **单个全栈 Worker**（Static Assets + Hono API 同仓） | wrangler 3.114 | 2026 官方推荐新项目形态；SPA 用 `not_found_handling="single-page-application"` |
| 前端框架 | Vite + React 19 + TypeScript | vite 6 / react 19 | 登录后型产品无需 SSR |
| 样式 | Tailwind CSS v4（`@tailwindcss/vite`） | 4.x | **注意 v4 限制**（见踩坑） |
| 路由/请求 | React Router v7 + TanStack Query v5 | | |
| 后端 | Hono v4（on Workers）+ Zod v4 共享 DTO | | zod v4 已统一（见踩坑） |
| 认证 | Better Auth + `better-auth-cloudflare`（d1Native） | | **无直接 d1Adapter**，必须 d1Native 或 Drizzle/Kysely |
| 数据库 | Cloudflare D1（SQLite） | | schema 在 `infra/d1/` |
| 对象存储 | R2（课件 JSON / PPTX / 头像） | | binding 无 createSignedUrl，MVP 用 Worker 直流 |
| 缓存/会话 | KV | | |
| 异步 | Queues（PPT/大纲/小测/TTS 生成）+ Cron（每日 4 点备份） | | 骨架已配，未实际消费 |
| LLM | DeepSeek-V3.2（deepseek-chat）主力，GLM-4-Flash 兜底 | | 经 Cloudflare AI Gateway；¥2/M 入 ¥3/M 出 |
| AI 编排 | AI SDK v5（预留） | | |
| 数字人 | **2D Live2D**（pixi.js v7 + pixi-live2d-display 0.4，Haru 模型） | | 视频类 API（智影/硅基/HeyGen）贵且不可交互，作升级路径 |
| 语音 | Web Speech API（浏览器免费） | | 升级：Edge TTS / 火山 / 阿里 |
| PPT | pptxgenjs（同步渲染存 R2） | | |
| 题库 | 自建 SQL seed + 开源数据集（仅验证） | | **红线：开源集不可进生产** |

### 目录结构

```
ai-teacher-platform/
├── apps/
│   ├── api/                  # Hono Worker（全部后端逻辑）
│   │   └── src/
│   │       ├── index.ts      # 路由挂载 + CORS + 错误处理
│   │       ├── env.ts        # Env 类型（绑定/变量/secrets）
│   │       ├── db.ts         # 查询助手
│   │       ├── lib/
│   │       │   ├── mastery.ts   # Beta 掌握度核心
│   │       │   └── teaching.ts  # 大纲/课件/PPTX/小测规则引擎
│   │       └── routes/       # health/auth/me/diagnosis/knowledge/syllabus/lessons/assets/chat
│   ├── web/                  # React SPA
│   │   └── src/
│   │       ├── lib/api.ts    # 统一 API 客户端（含 Demo 头）
│   │       ├── components/   # Layout / Live2DTeacher
│   │       └── pages/        # Login/Dashboard/Diagnosis/Syllabus/Classroom/Profile
├── packages/shared/          # zod DTO 与类型（api 与 web 共享）
├── infra/d1/                 # schema.sql / seed.sql / questions-seed.sql
├── resources/                # 题库样例 + Live2D 模型 + 许可记录（manifest.json）
├── scripts/                  # download_resources.mjs / copy-live2d.mjs
├── docs/                     # 01-技术方案 / 02-资源清单 / 03-开发路线图
├── .github/workflows/deploy.yml  # CI（wrangler deploy，需配 secrets）
├── wrangler.toml             # 全栈 Worker 配置
└── package.json              # npm workspaces
```

---

## 五、如何本地运行

### 运行环境（本机实测）

```bash
# 本机 Node 22（managed），Git Bash 下：
export PATH="/c/Users/Richard chen/.workbuddy/binaries/node/versions/22.22.2:$PATH"
# 或直接用全路径调用：
"C:/Users/Richard chen/.workbuddy/binaries/node/versions/22.22.2/node.exe"
```

### 一条龙启动

```bash
cd ai-teacher-platform
npm install                       # workspaces 一次性装完

# 1) 初始化本地 D1（只需首次/重置时）
npx wrangler d1 execute ai-teacher-db --local --file=infra/d1/schema.sql
npx wrangler d1 execute ai-teacher-db --local --file=infra/d1/seed.sql
npx wrangler d1 execute ai-teacher-db --local --file=infra/d1/questions-seed.sql
# 另外需要插入演示用户（认证表由 Better Auth 自建，业务 users 表需手动）：
npx wrangler d1 execute ai-teacher-db --local --command \
  "INSERT INTO users (id, email, name, role, grade, subject, weekly_hours) VALUES ('demo_user','demo@local.dev','演示同学','student',7,'math',4)"

# 2) 起后端（:8787）
npm run dev:api                  # 即 npx wrangler dev --port 8787

# 3) 另开终端起前端（:5173，/api 已代理）
npm run dev:web                  # 会自动复制 Live2D 模型到 public/

# 4) 浏览器打开 http://localhost:5173 → 登录页点「快速体验 Demo」即可全流程
```

> ⚠️ **dev:api 不能加管道**：`npx wrangler dev ... | head -30` 会因为 head 提前关闭管道
> 触发 SIGPIPE 把 wrangler 杀掉（本次实际踩过）。直接裸跑即可。

### 构建验证

```bash
npm -w apps/api run typecheck
npm -w apps/web run build        # 输出 apps/web/dist，含 live2d 静态资源
```

### 本地 D1 数据重置

```bash
rm -rf .wrangler/state   # 清掉本地模拟数据库，再按上面步骤重灌
```

---

## 六、踩坑记录（血泪教训，务必先看）

1. **Better Auth 没有 d1Adapter**：D1 必须用 `better-auth-cloudflare` 的 `withCloudflare({ d1Native, kv })`，
   且依赖 `drizzle-orm` 会被间接引入 —— **必须显式 `npm i -w apps/api drizzle-orm`**，否则打包报
   `Could not resolve "drizzle-orm"`。
2. **`withCloudflare` 运行时要求 `cf` 上下文**：报错
   `Cloudflare context is required for geolocation or IP detection features`。
   当前 auth 路由已修好挂载路径（`/api/auth` + 内部 `*`），但注册/登录的完整运行时上下文仍待验证 ——
   这就是为什么 MVP 先用 Demo 模式。
3. **Zod v4 与 zValidator**：better-auth 会把 zod 拉到 v4。`z.record()` 必须显式键类型
   （`z.record(z.string(), z.any())`）。`@hono/zod-validator` 用最新版。
4. **Tailwind v4 限制**：自定义类之间**不能互相 `@apply`**（如 `.btn-primary { @apply btn }` 会报
   `Cannot apply unknown utility class`）。每个类必须完全独立展开，或用 `@utility` 注册。
5. **pixi.js 版本**：`pixi-live2d-display@0.4` 只兼容 **pixi v7**（v8 已不兼容），
   且 Application 透明背景用 `backgroundAlpha: 0`（不是 `transparent`）。
6. **R2 无 createSignedUrl**：当前 workers-types 的 R2Bucket 只有 head/get/put，
   同域部署直接用 Worker 流式返回即可（已实现 `/assets/:id/download` 逻辑）。
7. **vite alias Windows 兼容**：`@aiteacher/shared` 别名必须用 `fileURLToPath(new URL(...))`
   而非 `.pathname`（Windows 下 pathname 会有 `/C:/` 前缀问题）。
8. **Hono 路由挂载**：`app.route("/api/auth", router)` 后，router 内部路径写 `*` 而非 `/auth/*`
   （否则变成 `/api/auth/auth/*` 404）。
9. **wrangler dev 管道 SIGPIPE**：见上文 ⚠️。
10. **`withCloudflare` 配置阶段同步抛错**：只要 `autoDetectIpAddress`/`geolocationTracking` 任一开启且没传 `cf`，
    `betterAuth()` 在**创建实例时**就 throw（不是运行时）——所以必须在 `withCloudflare` 第一参传 `cf: {}`
    并显式 `autoDetectIpAddress: false, geolocationTracking: false`。
11. **Better Auth 表名/字段约定**：默认表名 `user/session/account/verification`（无前缀）、字段 camelCase。
    现有 schema 用 `auth_*` 前缀 + snake_case 会直接 `no such table` / `no column named emailVerified`。
    解决方案：代码里 `modelName` 映射 + schema 字段改 camelCase（本次已统一）。
12. **本地 D1 重建**：`rm -rf .wrangler/state` 后必须确认**没有任何残留 wrangler/workerd 进程**占用文件
    （Windows 下会报文件被占用，删除看似成功实则未生效，导致灌入旧 schema）。用 `netstat -ano | grep 8787`
    + 杀进程后再删。

---

## 七、重要红线（上线前必须处理）

1. **题库**：`resources/question-bank/` 下的 AGIEval / TAL-SCQ / Math23K **仅开发验证用**，
   **严禁进入生产题库**。生产题库 = 原创 + LLM 生成 + 人工审核（三层）。
2. **数字人形象**：Live2D 官方示例模型（Haru/Hiyori）**仅占位**，商用前必须替换为自有形象或购买授权。
3. **教材/PPT 模板**：版权原因未下载，用「课标 + 自建知识图谱」和「自建模板引擎」替代。
4. **未成年人保护**：上线需监护人同意流程、防沉迷、数据最小化（docs/01 有清单）。
5. **生成式 AI 合规**：用已备案模型 API（DeepSeek 已备案）+ 内容安全审核（腾讯云天御/阿里云）。
6. **Demo 模式**：`wrangler.toml` 的 `DEMO_MODE = "true"` 上线前必须移除/置 false。

---

## 八、关键文件速查

| 文件 | 作用 |
|------|------|
| `docs/01-技术方案.md` | 架构、模块设计、API 契约、成本、上线合规清单（最权威） |
| `docs/02-资源清单.md` | 资源与许可判断 |
| `docs/03-开发路线图.md` | W1~W6 里程碑 |
| `infra/d1/schema.sql` | 全部表结构（含 auth_*） |
| `apps/api/src/lib/teaching.ts` | 大纲/课件/PPTX/小测引擎（规则版 + LLM 可插拔） |
| `apps/api/src/lib/llm.ts` | **LLM 接入层**（DeepSeek：chatText/chatJSON + ai_logs 用量记录） |
| `apps/api/src/lib/mastery.ts` | Beta 掌握度 |
| `apps/api/src/routes/auth.ts` | **认证**（withCloudflare + modelName 映射 + Demo 降级） |
| `apps/web/src/lib/api.ts` | 前端 API 客户端（Demo 头在此） |
| `scripts/e2e-assert.mjs` | 前端 DOM 断言走查（playwright-core 驱动 Edge） |
| `wrangler.toml` | 全栈 Worker 配置（部署时填真实 ID） |

---

*交接日期：2026-08-12。祝顺利 🚀*
