# @icebreakers/monorepo

`repoctl` 背后的 core engine 与 tooling wrapper。

如果你只是想使用默认 CLI 体验，优先安装 `repoctl`，并使用更短的 `repo` 命令：

```sh
pnpm add -D repoctl
pnpm exec repo setup
pnpm exec repo doctor
pnpm exec repo doctor --json
pnpm exec repo templates
pnpm exec repo new my-package
pnpm exec repo check
```

模板生成后的仓库还会带上更短的根脚本：

```sh
pnpm setup
pnpm doctor
pnpm new my-package
pnpm check
```

## 什么时候直接用这个包

`@icebreakers/monorepo` 更适合下面两类场景：

- 你需要直接使用 `@icebreakers/monorepo` / `@icebreakers/monorepo/tooling` 的程序化 API
- 你在维护 `repoctl` 的底层实现、模板、升级资产或 wrapper 配置

## CLI Compatibility

`repo`、`repoctl` 与 `@icebreakers/monorepo` 共享同一套 CLI 实现。

```sh
pnpm add -D @icebreakers/monorepo@latest

# 顶层任务命令
npx monorepo setup
npx monorepo doctor
npx monorepo templates
npx monorepo new my-package
npx monorepo check
npx monorepo upgrade

# 分组命令
npx monorepo ws up
npx monorepo ws ls --json --include-private
npx monorepo tg init --all
npx monorepo pkg new
npx monorepo ai p new --name checkout
npx monorepo skills sync --codex
```

推荐顺序仍然是：

1. 生成仓库里的 `pnpm setup / pnpm doctor / pnpm new / pnpm check`
2. `repo ...`
3. `repoctl ...` / `monorepo ...` 兼容入口

## `repo doctor`

`doctor` 是这次 CLI 增强里最面向新人的入口。它会检查：

- 根 `package.json`
- `pnpm-workspace.yaml`
- 当前 Node 版本是否满足 `engines.node`
- 根依赖里是否安装了 `repoctl` 或 `@icebreakers/monorepo`
- 推荐的根脚本 `setup / new / check / doctor` 是否齐全
- `repoctl.config.ts` 与 `monorepo.config.ts` 是否冲突
- `.husky/pre-commit` 与 `lint-staged.config.js` 是否同时存在

如果有阻塞项，命令会以非零状态结束。

需要在 CI、脚本或编辑器集成中消费诊断结果时，使用 `repo doctor --json`。它只输出结构化报告；如果存在 blocking issue，仍会以非零状态结束。

## 性能与开发体验

CLI 启动时只注册命令树，具体命令实现会在 action 执行时懒加载。因此 `repo --help`、`repo doctor --help`、`repoctl` 等入口不会提前加载所有 workspace、Git、配置与模板处理逻辑。

同一进程内的 workspace 发现会复用缓存，包括 workspace 根目录、`pnpm-workspace.yaml` 和 package 扫描结果。长期运行的程序化集成在修改 workspace 结构后，可以调用 `clearWorkspaceCache()` 强制后续读取重新扫描磁盘。

`repo ws ls` 会使用同一套缓存快速列出 workspace 包，并支持 `--json`、`--include-private`、`--include-root` 和可重复的 `--pattern`。程序化场景可以直接调用 `getWorkspacePackageSummaries()` 获取相同的轻量摘要数据。

## 默认 CLI 配置

工作区根目录推荐使用 `repoctl.config.ts` 覆盖默认行为。若你维护的是旧项目，也兼容 `monorepo.config.ts`，但两者不能同时存在。

```ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    init: {
      preset: 'standard',
    },
    create: {
      defaultTemplate: 'tsdown',
    },
  },
})
```

## 默认提交校验

如果你采用包内默认生成的 `.husky` 与 `lint-staged.config.js`，提交链路会自动包含下面这些校验：

- `pre-commit` 只检查 staged 文件
- 样式文件会执行 `stylelint --fix --allow-empty-input`
- `js`、`jsx`、`mjs`、`ts`、`tsx`、`mts`、`cts`、`vue` 文件会执行 `eslint --fix`
- `ts` / `tsx` / `mts` / `cts` / `vue` staged 文件会按最近的 workspace 执行 `typecheck`
- Vue workspace 的 `typecheck` 通常是 `vue-tsc -b`
- 纯 TypeScript workspace 的 `typecheck` 通常是 `tsc -p tsconfig.json`
- `pre-push` 会强制执行整仓 `pnpm lint` 与 `pnpm typecheck`，再按改动范围补跑 `build`、`test`、`tsd`

## `new` 与 `ai prompt` 的常用用法

先用 `repo templates` 查看内置模板：

```bash
repo templates
repo templates tsdown
repo templates --category library
repo templates --check
repo templates --check --json
repo templates --json
repo templates --markdown
repo templates tsdown --markdown
repo templates --markdown --out docs/templates.md
```

`repo new` / `monorepo new` 支持 `--template` 直接指定模板，例如：

```bash
repo new dashboard --template vue-hono
repo new dashboard --template vue-hono --dry-run
repo new dashboard --template vue-hono --json
repo new dashboard --template vue-hono --json --out plans/dashboard.json
```

如果 `--template` 拼错，CLI 会直接失败并提示最接近的模板 key；它不会静默回退到默认模板。
`--json` 用于脚本读取创建计划，隐含 `--dry-run`，不会写入文件。
`--out` 会把创建计划写入文件，也隐含 `--dry-run`。

当 `repoctl.config.ts` 中设置了 `commands.create.defaultTemplate` 时，命令会直接创建，不再额外询问模板，并自动按模板落到 `packages/` 或 `apps/`。

`monorepo ai prompt create` 支持批量生成：

```bash
npx monorepo ai prompt create --name checkout
npx monorepo ai prompt create --tasks agentic/tasks.json --format md -f
```

## Tooling Wrapper API

如果你希望在生成后的配置文件基础上继续手写覆盖，可以直接使用 `@icebreakers/monorepo/tooling` 或 `repoctl/tooling` 暴露的 wrapper。

- `defineCommitlintConfig` / `defineEslintConfig` / `defineStylelintConfig` / `defineLintStagedConfig` / `defineTsconfigConfig` 统一使用 `options`
- `defineVitestConfig` 使用 `options` 加 `overrides`
- `defineVitestProjectConfig` 也已统一使用 `options`
- 旧的 `config` 入参仍兼容，但只建议用于存量代码迁移

```ts
import { defineEslintConfig, defineVitestConfig, defineVitestProjectConfig } from '@icebreakers/monorepo/tooling'
import { defineConfig, defineProject } from 'vitest/config'

export const eslintConfig = await defineEslintConfig({
  options: {
    ignores: ['fixtures/**'],
  },
})

export const vitestConfig = defineConfig(async () => await defineVitestConfig({
  options: {
    includeWorkspaceRootConfig: false,
  },
  overrides: {
    test: {
      coverage: {
        exclude: ['dist/**'],
      },
    },
  },
}))

export const vitestProject = defineProject(await defineVitestProjectConfig({
  options: {
    environment: 'jsdom',
  },
}))
```

## 文档地址

https://monorepo.icebreaker.top/

## 需求环境

Node.js >= `v20.12.0`
