# 为 repoctl 贡献

[English](CONTRIBUTING.md) | 简体中文

repoctl 接受缺陷修复、文档改进、测试补充和边界清晰的功能提案。

## 开发准备

1. 使用 Node.js 22.12+ 并启用 Corepack。
2. 运行 `pnpm install`。
3. 从 `main` 创建职责单一的分支。
4. 在实现功能的同时新增或更新测试。

提交 Pull Request 前依次运行：

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm tsd
pnpm test
```

修改可发布包时必须通过 `pnpm change` 创建变更意图。提交信息必须遵循 Conventional Commits。

修改模板或受管根资产时，先修改源码，再运行 `pnpm --filter @icebreakers/monorepo-templates sync:assets` 刷新随包副本。

缺陷请提交到 https://github.com/sonofmagic/repoctl/issues；尚未形成具体实现的设计问题请使用 Discussions。
