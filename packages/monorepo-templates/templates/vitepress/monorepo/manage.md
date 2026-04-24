# 如何管理 monorepo

这一页只讲一件事：拿到这套模板后，日常到底怎么用，才是最省心的。

## 先记住默认工作流

```bash
pnpm install
pnpm doctor
pnpm new
pnpm check
pnpm build
```

大多数场景里，这已经够了。

如果你在接入一个旧仓库，再多加一步：

```bash
pnpm setup
```

## 命令分层

这套模板故意把入口做得很少。

### 第一层：根脚本

这是最推荐的入口：

```bash
pnpm setup
pnpm new
pnpm doctor
pnpm check
```

适合：

- 新人
- 日常开发
- 文档教程
- 团队内部统一约定

### 第二层：主 CLI

当你要明确告诉别人“这是 CLI 行为，不只是 package.json 脚本”时，用：

```bash
pnpm exec repo setup
pnpm exec repo new
pnpm exec repo doctor
pnpm exec repo check
pnpm exec repo upgrade
```

### 第三层：分组命令

更细的高级操作保留在分组里：

```bash
repo workspace upgrade
repo ws up
repo tooling init eslint vitest
repo tg init --all
repo skills sync --codex
repo ai prompt create --name checkout
```

## 日常任务对照表

| 你想做什么             | 推荐命令                     | 说明                                              |
| ---------------------- | ---------------------------- | ------------------------------------------------- |
| 初始化一个刚接入的仓库 | `pnpm setup`                 | 同步推荐的仓库元信息和基础工程化配置              |
| 看仓库当前状态是否健康 | `pnpm doctor`                | 先排根目录、Node、脚本、配置冲突、提交链路        |
| 创建一个新的包或应用   | `pnpm new`                   | 支持交互式选择，也支持 `--template`               |
| 提交前做本地校验       | `pnpm check`                 | 默认对齐推荐 pre-commit / pre-push 逻辑           |
| 同步模板最新标准资产   | `pnpm exec repo upgrade`     | 适合模板升级、老仓库补齐                          |
| 清理演示仓库或非必要包 | `pnpm exec repo clean --yes` | 零安装也可以用 `pnpm dlx repo@latest clean --yes` |

## `doctor`、`check`、`upgrade` 的边界

这是最容易混淆的三个命令。

### `doctor`

偏“仓库体检”。

它不关心你当前改了什么代码，而是关心：

- 这个仓库是不是完整
- 当前目录是不是根目录
- 当前机器的 Node 版本能不能跑
- 命令入口和配置文件是不是一致

### `check`

偏“提交前校验”。

它更像一个人工触发的推荐检查入口，适合：

- 提交前自查
- 怀疑 lint / typecheck / hooks 有问题时快速复现

### `upgrade`

偏“模板资产同步”。

它解决的是：

- 模板最新默认脚本要不要补进来
- 工作流、配置文件、GitHub 资产要不要同步
- 存量仓库要不要追上现在的标准

## 配置推荐

推荐只保留一个文件：

```ts
// repoctl.config.ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    create: {
      defaultTemplate: 'tsdown',
    },
    clean: {
      autoConfirm: true,
    },
    upgrade: {
      skipOverwrite: true,
    },
  },
})
```

说明：

- 优先使用 `repoctl.config.ts`
- `monorepo.config.ts` 继续兼容
- 两者不能同时存在

如果同时存在，现在 CLI 会直接报错，`repo doctor` 也会把它判成阻塞项。

## `new` 的推荐用法

### 交互式

```bash
pnpm new
```

适合第一次使用模板、想先看看有哪些模板可选。

### 直接指定模板

```bash
pnpm exec repo new docs --template vitepress
pnpm exec repo new sdk --template tsdown
```

适合你已经明确知道要创建什么。

### 固化团队默认模板

```ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    create: {
      defaultTemplate: 'tsdown',
    },
  },
})
```

设置后：

```bash
pnpm exec repo new utils
```

会直接按默认模板生成，不再额外询问模板类型。

## 默认提交链路

如果你保留模板默认生成的 `.husky` 与 `lint-staged.config.js`，通常会得到这条链路：

| 阶段         | 默认行为                                                                |
| ------------ | ----------------------------------------------------------------------- |
| `pre-commit` | 聚焦 staged 文件运行 `stylelint`、`eslint`、workspace `typecheck`       |
| `pre-push`   | 运行整仓 `lint`、`typecheck`，再补跑受影响包的 `build` / `test` / `tsd` |

这也是为什么：

- `pnpm doctor` 会检查 Husky 与 lint-staged 是否同时存在
- `pnpm check` 会成为最自然的人工入口

## 依赖与构建建议

```bash
pnpm install
pnpm up -rLi
pnpm build
pnpm test
```

- `pnpm install`：统一安装 workspace 依赖
- `pnpm up -rLi`：交互式升级依赖
- `pnpm build` / `pnpm test`：让 Turborepo 帮你做任务编排与缓存

## 工具层 API 什么时候用

如果你只是要使用默认 CLI，不需要直接碰 `@icebreakers/monorepo/tooling`。

只有下面两种情况建议直接使用：

- 你要在仓库里手写 tooling wrapper 配置
- 你在维护这套 CLI / 模板本身

其余大多数团队，停留在 `repoctl.config.ts` 这一层就够了。

## 继续阅读

- [命令速查](./commands.md)
- [排障指南](./troubleshooting.md)
- [发包与变更日志](./publish.md)
