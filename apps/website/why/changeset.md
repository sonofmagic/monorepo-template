# monorepo 如何发包和生成变更日志

在 `monorepo` 中发包和生成变更日志是一项关键的工作。推荐的现代做法是使用 [`changesets`](https://github.com/changesets/changesets) 专为 **monorepo 包发布** 设计的开源工具。

## changesets 是什么？

`changesets` 是一款用于：

- 记录每个变更的目的和版本影响
- 自动生成变更日志（`CHANGELOG.md`）
- 自动决定要发布哪些包，以及使用什么语义版本（`major` /`minor`/ `patch`）
- 与 `CI/CD` 集成实现自动发布（支持 `GitHub Actions`）

## 使用 changesets 的优势

| 优势            | 说明                                                          |
| --------------- | ------------------------------------------------------------- |
| ✅ 精细控制     | 每次变更单独写一个 changeset 文件，明确说明影响的包和变更类型 |
| 📦 支持多包     | 自动识别哪些包发生了变更，以及它们的依赖是否也需要发布        |
| 🧾 自动生成日志 | 基于 changeset 文件生成结构清晰的 CHANGELOG.md                |
| 🔄 自动升级版本 | 遵循 Semver 规范，自动处理包之间的依赖升级                    |
| 🤖 CI/CD 集成   | 支持 GitHub Actions 自动创建版本 PR 并发布到 NPM              |

## 如何在 monorepo 中使用 changesets（pnpm + turbo）

### 1. 安装依赖

```bash
pnpm add -D @changesets/cli
pnpm changeset init
```

会生成：

```bash
.changeset/         # 存放每次变更的 YAML 文件
  └── cool-change.md
```

---

### 2. 编写 changeset

运行以下命令为一次变更创建记录：

```bash
pnpm changeset
```

交互式输入：

- 选择受影响的包（多个）
- 选择版本变更类型（patch / minor / major）
- 输入 changelog 信息

结果示例（`.changeset/awesome-change.md`）：

```md
---
"@my/utils": minor
"@my/ui": patch
---

feat: 新增时间工具；
fix: 修复 UI 按钮颜色。
```

---

### 3. 版本号升级 + changelog 生成

在合并变更后，运行：

```bash
pnpm changeset version
```

它会：

- 更新每个包的 `package.json` 版本号
- 修改依赖包引用版本
- 更新每个包的 `CHANGELOG.md`

---

### 4. 发布到 NPM

```bash
pnpm changeset publish
```

自动：

- 发布已变更的包
- 忽略未变更的包
- 使用 monorepo 中正确的依赖版本

---

### 5. 配合 GitHub Actions 自动发布（可选）

建议使用官方提供的 `create-release` GitHub Action：

```yaml
name: Release
on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm changeset version
      - run: pnpm changeset publish
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 与其他方案对比（如 lerna、手动脚本）

| 功能          | `changesets`   | `lerna`       | 手动脚本 |
| ------------- | -------------- | ------------- | -------- |
| 多包发布支持  | ✅             | ✅            | ❌       |
| 自动生成日志  | ✅             | ❌/部分支持   | ❌       |
| 精确控制变更  | ✅（逐条记录） | ❌            | ❌       |
| 现代化支持    | ✅（活跃维护） | 停滞/社区维护 | ❌       |
| 与 CI/CD 集成 | ✅             | 部分复杂      | ❌       |

---

## 示例场景

比如你在 monorepo 中改了 `@my/utils` 和 `@my/ui`，你可以：

```bash
pnpm changeset
# 然后写明：utils 为 minor，ui 为 patch

pnpm changeset version
# 自动升级 utils 到 1.3.0，ui 到 0.1.2，并更新 changelog

pnpm changeset publish
# 发布到 npm
```

## 总结

使用 `changesets`：

- 是 monorepo 最推荐的发包 + changelog 方案
- 搭配 `pnpm + turbo` 非常自然
- 支持团队协作、自动化流程、语义化版本管理
