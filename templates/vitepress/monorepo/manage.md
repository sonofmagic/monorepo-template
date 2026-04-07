# 如何管理 monorepo

本节结合模板实践，总结一套围绕 **pnpm + Turborepo + repoctl.config** 的管理方法：从依赖安装、任务调度到命令覆写，帮助团队高效协作。

## 基础设施速览

| 能力           | 工具                | 要点                                                                                             |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------------ |
| Workspace 管理 | `pnpm`              | 内容寻址、硬链接，安装速度快、占用小；严格依赖隔离杜绝“幽灵依赖”                                 |
| 任务编排       | `turborepo`         | 基于依赖图调度任务，支持并行与缓存，`turbo run build --filter=...` 精准执行                      |
| 命令自定义     | `repoctl.config.ts` | 使用 `c12` 加载，可对 create/clean/upgrade/init/mirror 覆写默认行为，也兼容 `monorepo.config.ts` |

## 日常操作流程

### 1. 管理依赖

```bash
# 安装/更新
pnpm install
pnpm up -rLi

# 查看依赖图
pnpm ls --depth 2
```

- `pnpm install` 自动按 workspace 复用依赖。
- `pnpm up -rLi` 交互式升级所有包，`-L` 为最新版本，`-i` 逐项确认。

### 2. 调度构建与测试

```bash
# 全量构建 / 测试
pnpm build
pnpm test

# 只构建受影响的包
pnpm build --filter={templates/client}

# 观察执行计划
pnpm exec turbo run build --dry=json | jq '.'
```

Turborepo 会缓存任务输出：

| 构建场景       | 全量（首次） | 增量（未改动） |
| -------------- | ------------ | -------------- |
| 传统脚本       | 120s         | 120s           |
| Turbo 本地缓存 | 120s         | **≈5s**        |
| Turbo 远程缓存 | 120s         | **≈2s**        |

> 建议在 CI 中启用远程缓存（Vercel/Turbo Cloud 或自建存储）进一步缩短时间。

### 3. 自定义命令行为

使用 `defineMonorepoConfig` 即可集中覆写：

```ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    create: {
      templatesDir: './custom-templates',
      templateMap: {
        'cloud-function': {
          source: 'functions/cloud',
          target: 'apps/functions/cloud',
        },
      },
      choices: [
        { value: 'cli', name: 'CLI 模板' },
        { value: 'cloud-function', name: '云函数模板' },
      ],
    },
    clean: {
      autoConfirm: true,
      pinnedVersion: '^2.0.0',
    },
  },
})
```

常用配置项：

| 命令      | 可覆盖字段                                                                         | 说明                                                                                        |
| --------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `create`  | `templatesDir` / `templateMap` / `choices` / `defaultTemplate`                     | 扩展模板来源、修改提示内容                                                                  |
| `clean`   | `autoConfirm` / `ignorePackages` / `includePrivate` / `pinnedVersion`              | 控制交互、过滤包、锁定依赖版本                                                              |
| `upgrade` | `targets` / `mergeTargets` / `scripts` / `skipChangesetMarkdown` / `skipOverwrite` | 改写配置同步策略                                                                            |
| `init`    | `skipReadme` / `skipPkgJson` / `skipChangeset`                                     | 按需跳过初始化步骤                                                                          |
| `mirror`  | `env`                                                                              | 注入镜像环境变量                                                                            |
| `ai`      | `output` / `format` / `force` / `baseDir` / `tasksFile`                            | 预设 Agentic 模板输出目录、格式与批量任务，默认写入 `agentic/prompts/<timestamp>/prompt.md` |

推荐优先使用 `repoctl.config.ts` 作为配置文件名；已有仓库若仍使用 `monorepo.config.ts` 也能继续工作。但两个文件不能同时存在，否则 CLI 会直接报错，避免隐式覆盖。

更多细节可参考 CLI 命令文档或源码中的 `commands/*`。

### Tooling Wrapper 参数约定

如果你不只想生成默认配置文件，而是要在项目里手写调用 `repoctl/tooling` 或 `@icebreakers/monorepo/tooling`，建议遵守下面这套参数约定：

- `defineCommitlintConfig` / `defineEslintConfig` / `defineStylelintConfig` / `defineLintStagedConfig` / `defineTsconfigConfig`：使用 `options`
- `defineVitestConfig`：使用 `options` 与 `overrides`
- `defineVitestProjectConfig`：使用 `options`
- 历史上的 `config` 字段仍兼容，但只建议作为迁移过渡

```ts
import { defineEslintConfig, defineVitestConfig, defineVitestProjectConfig } from 'repoctl/tooling'
import { defineConfig, defineProject } from 'vitest/config'

export default await defineEslintConfig({
  options: {
    ignores: ['fixtures/**'],
  },
})

export const vitestRoot = defineConfig(async () => await defineVitestConfig({
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

### 4. 依赖升级 / 配置同步

```bash
npx repoctl upgrade                        # 推荐的顶层入口
npx repoctl workspace upgrade              # 使用分组命令
npx repoctl ws up                          # 短别名
npx @icebreakers/monorepo@latest workspace upgrade  # 直接使用兼容的远端 CLI

# 常用参数
# -c, --core  仅同步核心配置，排除 GitHub 相关文件
# -i          以交互方式筛选文件
# -s          跳过新增，仅覆盖已存在文件
```

升级 CLI 后再执行 `repoctl upgrade`（或 `workspace upgrade` / `ws up`），可以同步获得模板最新的工作流、脚手架与配置。

## 常见问题与建议

- **依赖冲突**：使用 `pnpm why <pkg>` 定位冲突来源，优先升级上游依赖或将共享依赖提升到顶层。
- **缓存命中率低**：确认是否使用了 `turbo run <task> --filter` 以及 `dependsOn` 配置是否准确，必要时开启远程缓存。
- **CI 时间长**：结合 `pnpm fetch` 预拉取依赖，配合 `turbo` 缓存，通常能把 pipeline 压缩到原来的 1/3。
- **命令行为差异**：将所有自定义行为写入 `repoctl.config.ts`，避免脚本散落多处难以维护；旧仓库可继续沿用 `monorepo.config.ts`。

## 进一步阅读

- [为什么越来越多团队迁移到 monorepo？](./index.md)
- [changesets 发包指南](./publish.md)
- [工具篇：pnpm、Turborepo、Changesets 等](../tools/turborepo.md)
- [常见思考与实践](../thinking.md)

> 小提示：在迁移现有项目时，可以先把最常变的模块放进 monorepo，再逐步收拢其它仓库，配合 `repoctl.config.ts` 就能实现平滑衔接。
