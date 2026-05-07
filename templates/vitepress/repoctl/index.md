# repoctl 概览

`repoctl` 是这套模板推荐给使用者的包名。默认命令是 `repo`，目标是把 pnpm workspace、Turborepo、模板创建、诊断报告和提交前校验收敛到一组稳定入口里。

它不替代 pnpm、Turbo 或 changesets，而是把这些工具在 monorepo 里的常见动作串起来。

## 什么时候使用 repoctl

| 场景                                     | 推荐入口                 |
| ---------------------------------------- | ------------------------ |
| 给已有 pnpm workspace 补齐标准脚本和配置 | `pnpm exec repo setup`   |
| 判断当前仓库是不是能顺利开发             | `pnpm exec repo doctor`  |
| 创建新的包、应用、文档站或 CLI           | `pnpm exec repo new`     |
| 提交前复现推荐校验链路                   | `pnpm exec repo check`   |
| 同步模板最新标准资产                     | `pnpm exec repo upgrade` |
| 给 CI、编辑器或脚本读取结构化结果        | `--json --out <file>`    |

## 推荐命令层级

### 1. 生成仓库里的短脚本

```bash
pnpm setup
pnpm doctor
pnpm new
pnpm check
```

这是给日常开发和团队文档使用的入口。短、稳定、不需要先解释 CLI 包名。

### 2. 明确调用 repo CLI

```bash
pnpm exec repo setup
pnpm exec repo doctor
pnpm exec repo templates
pnpm exec repo new sdk --template tsdown
pnpm exec repo check --dry-run
```

这是文档、CI、脚本和排障里最清楚的写法。

### 3. 分组命令

```bash
pnpm exec repo ws ls
pnpm exec repo tg init --all
pnpm exec repo env support --markdown --redact
pnpm exec repo config inspect
```

这些入口适合已经熟悉 repoctl 的维护者，用来做更细的 workspace、tooling、环境和配置操作。

## 和旧入口的关系

`repoctl` 包仍然提供兼容入口，例如：

```bash
pnpm exec repoctl doctor
pnpm exec repoctl new
```

文档统一推荐 `repo`，是为了减少新人需要记住的名字。底层实现仍来自同一套 CLI。

## 下一步

- 第一次接入：[快速开始](./getting-started.md)
- 不知道用哪个命令：[按场景选命令](./scenarios.md)
- 查命令参数：[命令速查](./commands.md)
- 固化团队默认值：[配置文件](./config.md)
- 看可创建的模板：[模板与创建](./templates.md)
- 接入 CI 和本地流程：[工作流与 CI](./workflows.md)
- 生成排障报告：[排障与报告](./troubleshooting.md)
- 熟悉短命令：[命令别名](./aliases.md)
