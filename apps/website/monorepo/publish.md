# monorepo 发包与变更日志

本模板推荐使用 [`changesets`](https://github.com/changesets/changesets) 管理版本、生成 `CHANGELOG` 并发布 npm 包。它针对 monorepo 场景设计，维护活跃，易于与 CI/CD 集成。

## 为什么选 changesets？

| 场景         | changesets 能力                                               |
| ------------ | ------------------------------------------------------------- |
| 精确记录改动 | 每次变更生成独立的 changeset 文件，说明影响的包与语义版本类型 |
| 自动生成日志 | 基于 changeset 内容生成结构化的 `CHANGELOG.md`                |
| 语义化版本   | 支持 `major` / `minor` / `patch`，并处理依赖联动升级          |
| 自动化发布   | 可在 CI 中自动创建版本 PR 或直接发布到 npm                    |

## 推荐流程

> 以下命令默认在仓库根目录执行。

### 1. 初始化

```bash
pnpm add -D @changesets/cli
pnpm changeset init
```

生成 `.changeset/` 目录，用于存放配置与变更记录。

### 2. 记录变更

```bash
pnpm changeset
```

按照提示：

1. 选择受影响的包。
2. 指定版本类型（`patch` / `minor` / `major`）。
3. 填写 changelog 描述。

示例输出：

```md
---
"@my/utils": minor
"@my/ui": patch
---

- feat(utils): 新增时间处理工具
- fix(ui): 修复按钮颜色
```

### 3. 升级版本并生成 changelog

```bash
pnpm changeset version
```

命令会自动：

- 更新受影响包的 `package.json` 版本。
- 调整内部依赖引用。
- 为每个包写入或追加 `CHANGELOG.md`。

### 4. 发布到 npm

```bash
pnpm changeset publish
```

changesets 会只发布有改动的包，并按照依赖顺序执行。

### 5. GitHub Actions 自动化（可选）

结合 `changesets/action` 实现自动创建发布 PR 或直接发布：

```yaml
name: Release

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

env:
  HUSKY: 0

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - name: Create Release Pull Request or Publish to npm
        uses: changesets/action@v1
        with:
          publish: pnpm publish-packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

`pnpm publish-packages` 为模板内脚本，可替换为自定义构建+发布流程。

## 与其他方案对比

| 能力 / 工具    | changesets | lerna 经典模式 | 手写脚本 |
| -------------- | ---------- | -------------- | -------- |
| 支持多包       | ✅         | ✅             | ❌       |
| 自动 changelog | ✅         | 部分支持       | ❌       |
| 逐条记录变更   | ✅         | ❌             | ❌       |
| 维护活跃度     | 高         | 低             | 需自养   |
| CI/CD 集成     | 简单       | 相对繁琐       | 完全手工 |

## 常见问题 FAQ

- **是否可与 `monorepo.config.ts` 联动？** 配置文件主要用于 CLI 行为定制，发布流程仍由 changesets 主导，两者互不冲突。
- **为何 `CHANGELOG` 没生成？** 确认是否执行了 `pnpm changeset version` 并提交了 `.changeset` 文件。
- **如何避免发布某些包？** 在创建 changeset 时不勾选即可，或将包标记为 `private: true`。

## 相关资源

- [changesets 官方文档](https://github.com/changesets/changesets)
- [模板中的发布工作流示例](https://github.com/sonofmagic/monorepo-template/blob/main/.github/workflows/release.yml)
- [管理指南：pnpm + Turborepo + monorepo.config](./manage.md)

> 小提示：在 PR 合并前先执行 `pnpm changeset version` 并提交结果，可以在代码审查阶段提前暴露发布影响，避免遗漏。
