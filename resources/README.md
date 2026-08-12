# resources/ — 已下载资源

> 本目录存放**开发验证用**的开源资源，均记录来源与许可于 `manifest.json`。
> 详细许可判断与生产策略见 [docs/02-资源清单.md](../docs/02-资源清单.md)。

## 目录

```
question-bank/
  agieval/   高考数学（选择/填空）· MIT · 仅开发验证
  tal-scq/   小初高数学竞赛题 · 研究用途 · 仅开发验证（禁止进生产题库）
  math23k/   小学应用题 · 研究用途 · 仅开发验证
avatar/
  live2d/
    Hiyori/  女老师形象（Live2D 官方示例 · 开发占位）
    Haru/    男老师形象（Live2D 官方示例 · 开发占位）
licenses/    上游仓库 LICENSE / README 记录
manifest.json 下载清单（来源 / 许可 / 大小 / 时间）
```

## 重新下载

```bash
node scripts/download_resources.mjs
```

## 重要提醒

1. **题库**：这些开源数据集**只用于开发验证**（组卷算法、评分链路、LaTeX 解析），**禁止直接作为生产题库**（许可多为研究用途）。生产题库 = 原创 + LLM 生成 + 人工审核（见 docs/02 §2）。
2. **数字人形象**：Live2D 官方示例模型仅用于开发占位，**商用上线前必须替换**为定制形象（委托制作 / 明确免费商用许可的模型 / 确认授权）。
3. 重新下载需要能访问 GitHub 的网络环境。
