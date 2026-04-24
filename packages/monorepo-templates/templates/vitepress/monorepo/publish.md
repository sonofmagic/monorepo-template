# monorepo 发包与变更日志

这套模板默认推荐用 `changesets` 管理版本和 changelog。原因不是“它很流行”，而是它对 monorepo 的工作方式最顺手：

- 变更是按包记录的
- 版本升级能自动联动内部依赖
- changelog 可以稳定产出
- 很容易接到 CI 里

## 一条务实的发布流程

先把顺序记住：

1. 写代码
2. 跑校验
3. 生成 changeset
4. 合并后 version / publish

对应到命令，一般是：

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm tsd
pnpm test
pnpm changeset
```

如果你改的是公开类型或类库 API，`tsd` 不要省。

## 为什么推荐 `changesets`

| 需求           | `changesets` 的做法                       |
| -------------- | ----------------------------------------- |
| 记录哪些包变了 | 每次变更生成单独的 `.changeset/*.md` 文件 |
| 控制版本类型   | 明确选择 `patch` / `minor` / `major`      |
| 自动生成日志   | `changeset version` 统一产出 changelog    |
| 联动内部包版本 | 自动改内部依赖引用                        |
| CI 自动发布    | 可接 `changesets/action`                  |

## 日常开发阶段怎么做

### 1. 本地先把质量门过掉

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm tsd
pnpm test
```

这一点和仓库的提交要求是一致的。

### 2. 记录 changeset

```bash
pnpm changeset
```

按提示选择：

1. 哪些包受影响
2. 这些包分别是 `patch` / `minor` / `major`
3. 这次改动怎么写进 changelog

示例：

```md
---
"@my/utils": minor
"@my/ui": patch
---

- feat(utils): 新增时间格式化工具
- fix(ui): 修复按钮禁用态样式
```

### 3. 合并前看一眼影响面

changeset 文件本身就是最便宜的“发布预告”。代码评审时顺手看一下，通常就能避免：

- 漏记某个包
- 版本类型选错
- changelog 写得太含糊

## 发布阶段怎么做

### 手动流程

```bash
pnpm changeset version
pnpm publish-packages
```

`changeset version` 会做这些事：

- 更新受影响包的版本号
- 调整内部依赖版本
- 生成或更新每个包的 `CHANGELOG.md`

### CI 自动流程

模板推荐结合 `changesets/action`。

一个常见的工作流结构如下：

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
          node-version: 24
          cache: pnpm
          registry-url: https://registry.npmjs.org
      - run: pnpm install
      - name: Create Release Pull Request or Publish to npm
        uses: changesets/action@v1
        with:
          publish: pnpm publish-packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 关于 npm 鉴权

现在更推荐在 CI 里使用 OIDC，而不是长期保存一个会过期的 `NPM_TOKEN`。

原因很现实：

- token 会过期
- token 泄漏风险更高
- OIDC 更适合自动化发布

所以工作流里建议保留：

```yaml
permissions:
  id-token: write
```

## 常见发布约束

### 私有包不会被发布

如果一个包是：

```json
{
  "private": true
}
```

那么它通常不会进入 npm 发布流程。

### 没有 changeset 就不会有版本 PR

如果你改了公开包，却没有提交 `.changeset/*.md`，那么后续版本流转通常会断掉。

### 先 build 再发

这个仓库的约定很明确：先 build，再 lint / typecheck / tsd / test，再谈发布。不要跳步。

## 常见问题

### 为什么没有生成 changelog？

通常是下面几种原因：

- 没有执行 `pnpm changeset version`
- `.changeset/*.md` 没有提交
- 受影响包实际没有进入版本计算

### 如何跳过某个包的发布？

- 在 changeset 里不要勾选它
- 或者把它标记为 `private: true`

### 为什么要在 PR 阶段就看 changeset？

因为它本质上是在回答一个非常具体的问题：

“这次改动准备怎么影响发布面？”

这个问题越早看，越不容易在合并后补救。

## 继续阅读

- [如何管理 monorepo](./manage.md)
- [命令速查](./commands.md)
- [排障指南](./troubleshooting.md)
