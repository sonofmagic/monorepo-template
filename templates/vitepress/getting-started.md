---
layout: doc
---

# 新手使用指南

这篇指南按第一次接手仓库的顺序写。你不需要先理解所有工具，只要先把仓库跑起来，再慢慢看更细的命令。

## 你需要先准备什么

- Node.js 20 或更高版本。
- pnpm。推荐通过 Corepack 启用：`corepack enable`。
- Git。`repo doctor` 会读取仓库信息，用来补全新包的 repository、bugs 和 author。

确认版本：

```bash
node -v
pnpm -v
git --version
```

## 第一次进入仓库

```bash
pnpm install
pnpm setup
pnpm doctor
```

这三步分别解决三件事：

| 命令           | 作用                               |
| -------------- | ---------------------------------- |
| `pnpm install` | 安装 workspace 依赖                |
| `pnpm setup`   | 同步推荐的根脚本、配置和工具链入口 |
| `pnpm doctor`  | 检查当前仓库能不能顺利开始开发     |

如果 `doctor` 报错，先按输出里的 `fix:` 处理。处理完再跑一次 `pnpm doctor`，直到没有 blocking issue。

如果要在 CI 或脚本里读取诊断结果：

```bash
pnpm exec repo doctor --json
pnpm exec repo doctor --json --out reports/doctor.json
```

如果希望 CI 把建议项也当成失败，使用 strict 模式：

```bash
pnpm exec repo doctor --strict
pnpm exec repo doctor --strict --json --out reports/doctor.json
```

## 创建第一个包或应用

不知道要用哪个模板时，先看列表：

```bash
pnpm exec repo templates
```

只看库包模板：

```bash
pnpm exec repo templates --category library
```

常用模板：

| 模板          | 适合什么          |
| ------------- | ----------------- |
| `tsdown`      | TypeScript 库包   |
| `vue-lib`     | Vue 3 组件库      |
| `vue-hono`    | Vue 3 + Hono 应用 |
| `hono-server` | Hono API 服务     |
| `vitepress`   | 文档站            |
| `cli`         | 命令行工具        |

创建时可以走交互式：

```bash
pnpm new
```

也可以直接指定：

```bash
pnpm new my-lib --template tsdown
pnpm new website --template vitepress
pnpm new api --template hono-server
```

创建前想先确认目标目录：

```bash
pnpm new website --template vitepress --dry-run
pnpm new website --template vitepress --json
pnpm new website --template vitepress --json --out plans/website.json
```

如果模板 key 拼错，CLI 会直接失败并提示最接近的模板 key；它不会静默回退到默认模板。
`--json` 用于脚本读取创建计划，隐含 `--dry-run`，不会写入文件。
`--out` 会把创建计划写入文件，也隐含 `--dry-run`。

普通名字会自动放进合适目录，比如库包放到 `packages/`，应用放到 `apps/`。如果你传入了带 `/` 的路径，例如 `packages/shared-utils`，CLI 会尊重这个路径。

## 开发时怎么跑

先看新建 workspace 的 `package.json`，确认它提供了哪些脚本。常见流程是：

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm test
```

整仓命令由 Turborepo 调度。你在根目录执行 `pnpm build`，会构建所有声明了 `build` 脚本的 workspace 包。

## 提交前检查

提交前推荐按这个顺序跑：

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

如果只是想跑模板推荐的本地检查：

```bash
pnpm check
```

如果你改了公开类型 API，并且对应包有 `tsd`：

```bash
pnpm tsd
```

## 什么时候用 repo 命令

生成仓库里优先记住短命令：

| 日常命令      | 等价 CLI                |
| ------------- | ----------------------- |
| `pnpm setup`  | `pnpm exec repo setup`  |
| `pnpm new`    | `pnpm exec repo new`    |
| `pnpm doctor` | `pnpm exec repo doctor` |
| `pnpm check`  | `pnpm exec repo check`  |

需要更细的能力时再用 `repo`：

```bash
pnpm exec repo templates
pnpm exec repo env paths
pnpm exec repo config inspect
pnpm exec repo ws ls
pnpm exec repo ws ls --json --out reports/workspaces.json
pnpm exec repo tg init --all
pnpm exec repo upgrade
```

`repoctl`、`monorepo`、`rc`、`mo` 这些入口仍然兼容。新项目文档统一推荐 `repo`，减少新人记忆负担。

## 更新模板标准资产

当模板仓库升级后，可以同步最新推荐配置：

```bash
pnpm exec repo upgrade
pnpm doctor
```

如果只想同步核心配置，跳过 GitHub、Renovate、开源社区文件：

```bash
pnpm exec repo upgrade --core
```

如果你不希望覆盖已有文件：

```bash
pnpm exec repo upgrade --skip-overwrite
```

## 常见问题

### 提示目录已经存在

`pnpm new` 不会覆盖已有目录。换一个名字，或者手动处理已有目录后再创建。

### 不知道模板 key 怎么写

运行：

```bash
pnpm exec repo templates
```

查看单个模板详情：

```bash
pnpm exec repo templates tsdown
```

需要给脚本读取时：

```bash
pnpm exec repo templates --json
```

### `repoctl.config.ts` 和 `monorepo.config.ts` 同时存在

只保留一个。推荐保留 `repoctl.config.ts`，旧文件名仅作为兼容入口。

### 新建包之后依赖没装上

新建模板只负责生成文件。生成后回到根目录运行：

```bash
pnpm install
```

然后再跑：

```bash
pnpm build
pnpm typecheck
pnpm test
```

## 下一步

- 想看完整命令：[命令速查](./monorepo/commands.md)
- 想选择合适模板：[模板速查](./monorepo/templates.md)
- 想理解 workspace 管理：[如何管理 monorepo](./monorepo/manage.md)
- 遇到校验问题：[常见问题排障](./monorepo/troubleshooting.md)
- 准备发包：[发包与变更日志](./monorepo/publish.md)
