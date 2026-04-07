---
layout: doc
---

# icebreaker's monorepo 模板

整套模板围绕 **pnpm + Turborepo + TypeScript** 打造，帮助团队快速落地一个可维护、可编排、可持续迭代的 `monorepo` 工程。这里我们把使用方式拆成几个核心模块，方便你按需查阅。

## 核心能力

- **工作区管理**：`pnpm` workspace + Turborepo 任务编排，内置缓存和过滤能力。
- **全链路 TypeScript**：所有模板（应用、类库、CLI）均使用 TS，并自带基础测试脚手架（`vitest`）。
- **质量与规范**：集成 `eslint`、`stylelint`、`husky`、`commitlint`、`lint-staged`，提交前会校验样式、ESLint 与 workspace typecheck，推送前会强制执行整仓 `lint` 与 `typecheck`。
- **自动化发布**：`changesets` + GitHub Actions + Dockerfile 模板，实现语义化发版和部署。
- **命令行助手**：`repoctl` CLI 提供创建、同步、升级、镜像等常用命令，可通过 `repoctl.config.ts` 自定义行为；`repo` 是推荐的短别名，`rc` 与 `@icebreakers/monorepo` 保持兼容发布。

## 快速上手

1. **拉取模板**：[GitHub](https://github.com/sonofmagic/monorepo-template) 右上角 `Use this template`，或克隆源码。
2. **安装依赖**：在 `pnpm-workspace.yaml` 所在目录执行 `pnpm install`（需要 Node.js ≥ 20，推荐 `npm i -g pnpm`）。
3. **初始化仓库默认值**：运行 `pnpm exec repoctl init`，同步推荐的 workspace 元数据与工程化配置。
4. **创建下一个包或应用**：运行 `pnpm exec repoctl new`，通过引导式流程选择要创建的类型。
5. **本地校验**：运行 `pnpm exec repoctl check`，执行推荐的本地校验。
6. **可选清理**：直接运行 `npx -y repoctl@latest clean` 远程执行清理，移除演示包后再执行 `pnpm install`（避免依赖本地构建 CLI）；如已安装依赖，也可使用 `pnpm script:clean`。

## 仓库结构速览

| 目录                  | 描述                             |
| --------------------- | -------------------------------- |
| `templates/cli`       | TypeScript 编写的 CLI 模板       |
| `templates/client`    | Vue 3 + Vite 客户端示例          |
| `templates/server`    | 基于 Hono 的服务端模板           |
| `templates/vitepress` | VitePress 文档站（即本网站源码） |
| `templates/tsdown`    | 使用 `tsdown` 打包的库模板       |
| `templates/vue-lib`   | Vue 组件库模板                   |
| `packages/monorepo`   | CLI 及配置同步工具，支持独立升级 |

## 常用脚本

| 命令                      | 说明                                              |
| ------------------------- | ------------------------------------------------- |
| `pnpm exec repoctl init`  | 初始化推荐的 workspace 元数据与 tooling 默认值    |
| `pnpm exec repoctl new`   | 通过引导式流程创建新的包或应用                    |
| `pnpm exec repoctl check` | 执行推荐的本地校验                                |
| `pnpm script:clean`       | 清理演示仓库，保留最小模板                        |
| `pnpm script:init`        | 同步初始化 `package.json`、`README.md` 等基础信息 |
| `pnpm script:mirror`      | 为 VS Code 终端写入国内镜像环境变量               |

更多脚本可在根目录 `package.json` 中查看，命令介绍详见 [工具区](./tools/turborepo.md)。

## CLI 命令概览

```bash
npx repoctl init              # 初始化推荐默认值
npx repoctl new               # 引导式创建子包/应用
npx repoctl check             # 推荐本地校验
npx -y repoctl@latest clean  # 远程清理已勾选的子项目，避免依赖本地构建
npx repoctl mirror         # 写入 VS Code 镜像配置
npx repoctl skills sync    # 同步内置技能到全局目录
npx repoctl upgrade        # 从最新模板同步配置文件
npx repoctl ws up          # 分组命令短别名
npx repoctl ai prompt create  # 生成 Agentic 任务提示词模板
npx repoctl ai p new          # 短别名
```

如果你已经熟悉模板内部命令结构，也可以继续使用 `repoctl package create`、`repoctl workspace upgrade` 这类分组命令。

示例：`npx repoctl ai prompt create -o agentic-task.md -f`，可直接生成 Markdown 模板并覆盖旧文件。默认会写入 `agentic/prompts/<timestamp>/prompt.md`，同时生成一个按时间排序的目录，并会提示你确认或修改目录名称，方便后续补充图片等素材；也可以用别名 `npx repoctl ai p new`.

如果你更偏好短命令，也可以把上面的 `repoctl` 换成 `repo`。`rc` 同样可用，但因为和其他 CLI 发生命令名冲突的概率更高，这里不把它作为主文档入口。

多文件场景：

- `npx repoctl ai prompt create --name checkout` 自动落盘到 `agentic/prompts/checkout.md`（默认目录可改）。
- `npx repoctl ai prompt create --tasks agentic/tasks.json -f` 读取 JSON 数组批量生成，适合多人协作收口任务。

所有命令都支持在 `repoctl.config.ts` 中覆写默认行为，例如新增模板、修改同步命令、跳过 README 初始化等。也兼容 `monorepo.config.ts`，但两者不能同时存在。配置示例见下文和 [配置中心说明](./monorepo/manage.md#使用-repoctlconfigts-定制命令行为)。

## 自定义配置：`repoctl.config.ts`

```ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    ai: {
      baseDir: 'agentic/custom-prompts',
      format: 'json',
      force: true,
      tasksFile: 'agentic/tasks.json',
    },
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
      targets: ['.github', 'repoctl.config.ts'],
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

> 欢迎结合自己的业务场景对模板做进一步裁剪与扩展，建议优先使用 `repoctl.config.ts` 统一管理命令默认值；已有项目的 `monorepo.config.ts` 也继续兼容。
