# monorepo-template

[![codecov](https://codecov.io/gh/sonofmagic/monorepo-template/branch/main/graph/badge.svg?token=mWA3D53rSl)](https://codecov.io/gh/sonofmagic/monorepo-template)

中文 | [English Version](README.md)

> 基于 pnpm、Turbo Repo 与 Changesets 的现代多包模板，帮助你快速搭建企业级 Monorepo。

## 概览

monorepo-template 面向实际项目，内置统一的构建、测试、发布、代码风格与提交规范，适用于需要同时维护多个可部署应用和共享包的团队。

## 主要特性

- **模块化结构**：模板源代码集中在 `templates/`，可复用工具包位于 `packages/`，职责清晰。
- **统一工具链**：pnpm 工作区、Turbo 任务编排、Vitest 单测与 Changesets 发布覆盖开发到交付的全流程。
- **工程规范**：集成 ESLint、Stylelint、Husky、Commitlint，自动化保障代码质量与提交信息。
- **可扩展模板**：借助 `@icebreakers/monorepo` 提供的脚本（`script:init`、`script:sync`、`script:clean` 等）维护依赖与脚手架。
- **CI/CD 友好**：示例 GitHub Actions 配置、Codecov 集成与 `secrets.NPM_TOKEN` 支持自动化发布及覆盖率上报。

## 快速开始

1. **准备环境**：确认 Node.js >= 20，并执行 `corepack enable` 启用 pnpm。
2. **安装依赖**：运行 `pnpm install` 安装所有工作区依赖。
3. **本地开发**：使用 `pnpm dev` 启动 Turbo 并行开发任务，在各应用内快速迭代。
4. **构建与验证**：依次运行 `pnpm build`、`pnpm test`、`pnpm lint` 完成本地构建、测试与代码检查。
5. **模板清理（可选）**：执行 `pnpm script:clean` 清理示例包，为自定义项目腾出空间。

### 快捷初始化

- 零安装清理：`pnpm dlx @icebreakers/monorepo@latest clean --yes`，需要保留 private 包时追加 `--include-private`。
- 一键脚手架：`pnpm create icebreaker` 或 `npm create icebreaker@latest`，进入交互模式，输入目标目录并选择保留的模板。默认走 npm 模板，使用 `--source git` 可改为 clone。可用 `--templates tsup,vue-hono` 或 `--templates 2,5` 预选模板。

## 仓库结构

```text
templates/
  cli/          # CLI 程序脚手架
  client/       # Web 客户端示例（如 Vue/React）
  server/       # 服务端或 API 层入口
  vitepress/    # 静态站点或文档站
  tsup/         # 基于 tsup 的库模板
  tsdown/       # 基于 tsdown 的库模板
  unbuild/      # 基于 unbuild 的库模板
  vue-lib/      # Vue 组件库模板
packages/
  monorepo/           # @icebreakers/monorepo 辅助脚本
  create-icebreaker/  # npm create 脚手架
  monorepo-templates/ # 模板资源包
```

- `templates/cli`：CLI 工具示例。
- `templates/client`：前端富客户端范例。
- `templates/server`：服务端或 API 框架入口。
- `templates/vitepress`：营销页或文档站示例。
- `templates/tsup`：基于 tsup 的库模板。
- `templates/tsdown`：基于 tsdown 的库模板。
- `templates/unbuild`：基于 unbuild 的库模板。
- `templates/vue-lib`：Vue 组件库模板。
- `packages/*`：共享库与脚手架工具，可被各应用复用。
- 根目录配置文件（如 `turbo.json`、`tsconfig.json`、`eslint.config.js`）确保跨工作区设置一致。

## 常用脚本

| 命令                          | 说明                                          |
| ----------------------------- | --------------------------------------------- |
| `pnpm install`                | 安装所有工作区依赖。                          |
| `pnpm dev`                    | 并行运行所有包含 `dev` 脚本的工作区。         |
| `pnpm build`                  | 通过 Turbo 执行整仓构建。                     |
| `pnpm test` / `pnpm test:dev` | 运行 Vitest（一次性 / 监听模式）。            |
| `pnpm lint`                   | 在整个仓库执行 ESLint 与 Stylelint。          |
| `pnpm changeset`              | 交互式生成版本变更记录。                      |
| `pnpm publish-packages`       | 构建、检查并发布有变更的包。                  |
| `pnpm script:init`            | 使用 `@icebreakers/monorepo` 初始化模板配置。 |
| `pnpm script:sync`            | 对齐依赖与脚本版本。                          |
| `pnpm script:clean`           | 清理示例包及生成产物。                        |

## 模板使用流程

- 使用 `pnpm create icebreaker` 在新目录中生成精简后的工作区。
- 安装依赖后执行 `pnpm install`、`pnpm dev` 开始开发。
- 根据团队需求继续增删应用/包或复制模板扩展模块。

## 发布与版本管理

结合 Changesets 与 GitHub Actions 实现自动化版本管理：

1. 通过 `pnpm changeset` 记录改动类型（patch/minor/major）。
2. 合并后运行 `pnpm publish-packages`，或由 CI 在 `main` 分支自动发布。
3. 在 GitHub 仓库配置 `secrets.NPM_TOKEN`，允许 Actions 推送到 npm。

## 质量保障

- **代码规范**：`.editorconfig` 约定两空格缩进与 LF 换行，ESLint 与 Stylelint 保证多包一致性。
- **提交校验**：Husky 与 lint-staged 在提交前自动执行 `eslint --fix`、`vitest` 等检查。
- **测试与覆盖率**：运行 `pnpm test -- --coverage`，在 `coverage/` 输出覆盖率报告。
- **持续升级**：执行 `npx @icebreakers/monorepo@latest` 获取模板最新能力。

## 更多资源

- 官方文档：https://monorepo.icebreaker.top/
- 贡献指南：参阅 `CONTRIBUTING.md` 了解协作流程。
- 行为准则：查看 `CODE_OF_CONDUCT.md` 了解社区守则。
- 安全策略：遵循 `SECURITY.md` 汇报安全问题。
- 许可证：详见 `LICENSE` 了解项目开源协议。
