---
layout: doc
---

# icebreaker's monorepo 模板

整套模板围绕 **pnpm + Turborepo + TypeScript** 打造，帮助团队快速落地一个可维护、可编排、可持续迭代的 `monorepo` 工程。这里我们把使用方式拆成几个核心模块，方便你按需查阅。

## 核心能力

- **工作区管理**：`pnpm` workspace + Turborepo 任务编排，内置缓存和过滤能力。
- **全链路 TypeScript**：所有模板（应用、类库、CLI）均使用 TS，并自带基础测试脚手架（`vitest`）。
- **质量与规范**：集成 `eslint`、`stylelint`、`husky`、`commitlint`、`lint-staged`，开箱即用。
- **自动化发布**：`changesets` + GitHub Actions + Dockerfile 模板，实现语义化发版和部署。
- **命令行助手**：`@icebreakers/monorepo` CLI 提供创建、同步、升级、镜像等常用命令，可通过 `monorepo.config.ts` 自定义行为。

## 快速上手

1. **拉取模板**：[GitHub](https://github.com/sonofmagic/monorepo-template) 右上角 `Use this template`，或克隆源码。
2. **安装依赖**：在 `pnpm-workspace.yaml` 所在目录执行 `pnpm install`（需要 Node.js ≥ 20，推荐 `npm i -g pnpm`）。
3. **可选清理**：运行 `pnpm script:clean` 移除演示包，仅保留最小打包模板；随后再次执行 `pnpm install` 更新 lockfile。
4. **初始化元数据**：`pnpm script:init` 会批量更新 `package.json`、`README.md` 等公共信息。

## 仓库结构速览

| 目录                        | 描述                             |
| --------------------------- | -------------------------------- |
| `apps/cli`                  | TypeScript 编写的 CLI 模板       |
| `apps/client`               | Vue 3 + Vite 客户端示例          |
| `apps/server`               | 基于 Hono 的服务端模板           |
| `apps/website`              | VitePress 文档站（即本网站源码） |
| `packages/tsup-template`    | 使用 `tsup` 打包的库模板         |
| `packages/unbuild-template` | 使用 `unbuild` 打包的库模板      |
| `packages/vue-lib-template` | Vue 组件库模板                   |
| `packages/monorepo`         | CLI 及配置同步工具，支持独立升级 |

## 常用脚本

| 命令                 | 说明                                                |
| -------------------- | --------------------------------------------------- |
| `pnpm script:clean`  | 清理演示仓库，保留最小模板                          |
| `pnpm script:init`   | 同步初始化 `package.json`、`README.md` 等基础信息   |
| `pnpm script:sync`   | 使用 `cnpm` 同步所有包到 npmmirror（需预装 `cnpm`） |
| `pnpm script:mirror` | 为 VS Code 终端写入国内镜像环境变量                 |

更多脚本可在根目录 `package.json` 中查看，命令介绍详见 [工具区](./tools/turborepo.md)。

## CLI 命令概览

```bash
npx monorepo new           # 创建子包/应用
npx monorepo clean         # 批量删除已勾选的子项目
npx monorepo sync          # 同步所有包到 npmmirror
npx monorepo mirror        # 写入 VS Code 镜像配置
npx monorepo up            # 从最新模板同步配置文件
```

所有命令都支持在 `monorepo.config.ts` 中覆写默认行为，例如新增模板、修改同步命令、跳过 README 初始化等。配置示例见下文和 [配置中心说明](./monorepo/manage.md#使用-monorepo-configts-定制命令行为)。

## 自定义配置：`monorepo.config.ts`

```ts
import { defineMonorepoConfig } from '@icebreakers/monorepo'

export default defineMonorepoConfig({
  commands: {
    create: {
      defaultTemplate: 'cli',
      renameJson: true,
    },
    clean: {
      autoConfirm: true,
      ignorePackages: ['docs'],
    },
    upgrade: {
      skipOverwrite: true,
      targets: ['.github', 'monorepo.config.ts'],
    },
  },
})
```

更多可配置项详见 [管理指南](./monorepo/manage.md)。

## 依赖与版本升级

```bash
pnpm up -rLi
```

- `-r`：递归遍历所有 workspace
- `-L`：升级到最新版本
- `-i`：交互式选择（推荐查看差异后再确认）

## 自动化发布

模板默认集成 [`changesets`](https://github.com/changesets/changesets) 与推荐的 GitHub Actions 工作流：

1. 安装 [changeset-bot](https://github.com/apps/changeset-bot)。
2. 在仓库设置中开启 `Actions` 的 `Read and write permissions` 并勾选允许创建 PR。
3. 在 `Repository secrets` 中配置 `NPM_TOKEN`（若需要 Codecov 也可配置 `CODECOV_TOKEN`）。
4. 运行 `pnpm changeset`、`pnpm changeset version`、`pnpm changeset publish` 完成发布；或交由 CI 自动执行。

具体操作指南参见 [发包流程](./monorepo/publish.md)。

## 更多资源

- [为什么选择 monorepo？](./monorepo/index.md)
- [pnpm workspaces 与 Turborepo 组合的优势](./monorepo/manage.md)
- [工具链介绍](./tools/turborepo.md)
- [常见思考与 FAQ](./thinking.md)

> 欢迎结合自己的业务场景对模板做进一步裁剪与扩展，建议在自定义后保留 `monorepo.config.ts` 以便集中管理命令默认值。
