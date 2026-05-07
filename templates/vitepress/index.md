---
layout: home

hero:
  name: repoctl
  text: 让 pnpm monorepo 的日常操作更短、更稳
  tagline: 用一套 CLI 管理初始化、诊断、创建模板、提交前校验和模板资产同步。
  image:
    src: /logo.jpg
    alt: repoctl logo
  actions:
    - theme: brand
      text: 快速开始
      link: /repoctl/getting-started
    - theme: alt
      text: 命令速查
      link: /repoctl/commands

features:
  - title: 从已有仓库开始
    details: 安装 repoctl 后运行 setup 和 doctor，先把 workspace、根脚本、配置冲突和提交链路检查清楚。
  - title: 用模板创建包和应用
    details: repo new 支持交互式创建、指定模板、dry-run、JSON 输出和创建计划落盘。
  - title: 把质量门禁变成日常命令
    details: repo check 统一预览和执行 lint、typecheck、build、test、tsd 等推荐校验。
---

## 最短路径

```bash
pnpm add -D repoctl
pnpm exec repo setup
pnpm exec repo doctor
pnpm exec repo new
pnpm exec repo check
```

在由模板生成的仓库里，同一套工作流会暴露成更短的根脚本：

```bash
pnpm setup
pnpm doctor
pnpm new
pnpm check
```

## 你可以继续阅读

- [repoctl 概览](./repoctl/index.md)
- [快速开始](./repoctl/getting-started.md)
- [接入已有仓库](./repoctl/adopt-existing.md)
- [命令速查](./repoctl/commands.md)
- [配置文件](./repoctl/config.md)
- [模板与创建](./repoctl/templates.md)
- [工作流与 CI](./repoctl/workflows.md)
- [知识库：为什么往 monorepo 方向演进](./monorepo/index.md)
