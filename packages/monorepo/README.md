# @icebreakers/monorepo

`repoctl` 背后的 core engine 与 tooling wrapper。

如果你只是想使用默认 CLI 体验，优先安装 `repoctl`：

```sh
pnpm add -D repoctl
pnpm exec repoctl setup
pnpm exec repoctl new my-package
pnpm exec repoctl check
```

`@icebreakers/monorepo` 适合下面两类场景：

- 你需要直接使用 `@icebreakers/monorepo` / `@icebreakers/monorepo/tooling` 的程序化 API
- 你在维护 `repoctl` 的底层实现、模板、升级资产或 wrapper 配置

## CLI Compatibility

`repoctl` 与 `@icebreakers/monorepo` 共享同一套 CLI 实现。若你仍希望直接安装 `@icebreakers/monorepo`，可继续使用兼容入口：

```sh
pnpm add -D @icebreakers/monorepo@latest

# 顶层任务命令
npx monorepo setup
npx monorepo new my-package
npx monorepo check
npx monorepo upgrade

# 分组命令
npx monorepo ws up
npx monorepo tg init --all
npx monorepo pkg new
npx monorepo ai p new --name checkout
npx monorepo skills sync --codex
```

`monorepo ai prompt create`（短别名 `ai p new`，兼容旧写法 `ai create` / `ai new`）默认会把模板写入 `agentic/prompts/<timestamp>/prompt.md`，每次都会建一个以时间命名的目录，并在命令行提示可修改该目录名称，方便追加截图等素材；也可以通过参数自定义路径。

`@icebreakers/monorepo` 在运行时会从 `@icebreakers/monorepo-templates` 读取模板、骨架与升级资产。

`monorepo skills sync` 会将包内 `resources/skills/icebreakers-monorepo-cli` 同步到 `~/.codex/skills/icebreakers-monorepo-cli` 或 `~/.claude/skills/icebreakers-monorepo-cli`；未指定目标时会交互选择。

当前推荐的主命令分组如下：

- `workspace` / `ws`: 工作区元信息、升级、清理
- `tooling` / `tg`: 工程化配置生成
- `package` / `pkg`: 子包创建
- `env` / `e`: 环境辅助命令
- `verify` / `v`: 本地校验
- `ai prompt` / `ai p`: AI prompt 模板

常用短写包括 `ws up`、`tg init`、`pkg new`、`e m`、`ai p new`。

`repoctl new` / `monorepo new` 现在支持 `--template` 直接指定模板，例如 `repoctl new dashboard --template vue-hono`。当 `repoctl.config.ts` 中设置了 `commands.create.defaultTemplate` 时，命令会直接创建，不再额外询问模板，并自动按模板落到 `packages/` 或 `apps/`。

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

`monorepo ai prompt create` 支持批量生成：

```bash
# 基于名称自动落盘到 agentic/prompts/checkout.md（默认目录可在 repoctl.config.ts 中设置）
npx monorepo ai prompt create --name checkout

# 使用任务清单一次生成多个文件（tasks.json 为字符串或对象数组）
npx monorepo ai prompt create --tasks agentic/tasks.json --format md -f
```

`agentic/tasks.json` 示例：

```json
[
  "checkout",
  { "name": "payments", "format": "json", "force": true }
]
```

### 配置文件

在工作区根目录下创建 `repoctl.config.ts`（内容可为普通 ESM），即可覆盖每个命令的默认行为。已有项目若使用 `monorepo.config.ts` 也兼容，但两个文件不能同时存在。例如：

```ts
// repoctl.config.ts
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

`workspace init` 用于同步 README / package.json / changeset / issue template 等元信息；`tooling init` 用于生成工程化配置文件，并自动补充根 `package.json` 的 `devDependencies`。当前内置的目标有：`commitlint`、`eslint`、`stylelint`、`lint-staged`、`tsconfig`、`vitest`。

例如：

```bash
# 只生成指定配置
npx monorepo tooling init eslint stylelint lint-staged

# 生成全部内置配置，并覆盖已存在文件
npx monorepo tooling init --all --force
```

也可以在 `repoctl.config.ts` / `monorepo.config.ts` 里为兼容命令 `init` 配默认项；`tooling init` 也会复用这组配置：

```ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    init: {
      tooling: ['eslint', 'tsconfig', 'vitest'],
      force: false,
    },
  },
})
```

目前支持 `ai`、`create`、`clean`、`upgrade`、`init` 与 `mirror` 六类配置覆写；新的分组命令会映射到这些既有配置键。

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

Nodejs >= `v20.11.0`
