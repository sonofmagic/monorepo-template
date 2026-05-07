---
description: 说明 repoctl doctor 的检查项、状态含义、strict 模式和修复建议。
---

# repoctl doctor 诊断

`repo doctor` 用来判断当前目录是不是一个可维护、可开发、可接入 repoctl 工作流的 pnpm monorepo 根目录。

## 1. 状态含义

| 状态   | 含义           | 对退出码的影响                |
| ------ | -------------- | ----------------------------- |
| `pass` | 检查通过       | 不影响                        |
| `warn` | 存在建议修复项 | 默认不失败，`--strict` 下失败 |
| `fail` | 阻塞项         | 命令返回失败状态              |

CI 中推荐使用：

```bash
repo doctor --strict
```

这样 warning 不会长期堆积成隐性风险。

## 2. 核心检查项

| 检查项                       | 通过标准                                        | 常见修复                     |
| ---------------------------- | ----------------------------------------------- | ---------------------------- |
| `package-json`               | 当前 workspace 根目录存在 `package.json`        | 回到仓库根目录或先初始化项目 |
| `workspace-manifest`         | 存在 `pnpm-workspace.yaml`                      | `repo setup --yes`           |
| `node-version`               | 当前 Node 满足 `engines.node`                   | 切换 Node 版本或补充 engines |
| `tool-package`               | 根依赖包含 `repoctl` 或 `@icebreakers/monorepo` | `pnpm add -D repoctl`        |
| `root-scripts`               | 存在 `setup`、`new`、`check`、`doctor` 根脚本   | `repo setup --yes`           |
| `config-file`                | 只存在一种配置文件                              | 保留 `repoctl.config.ts`     |
| `commit-hooks`               | Husky 和 lint-staged 同时就绪                   | `repo upgrade --yes`         |
| `tooling-imports`            | 配置不再引用本地源码 loader                     | `repo upgrade --yes`         |
| `workspace-patterns`         | 常见目录被 workspace patterns 覆盖              | `repo setup --yes`           |
| `workspace-package-coverage` | 常见目录下的包都被 pnpm 覆盖                    | `repo setup --yes`           |

## 3. 输出报告

```bash
repo doctor
repo doctor --json
repo doctor --markdown --redact
repo doctor --json --out reports/doctor.json
repo doctor --markdown --redact --out reports/doctor.md
```

| 输出         | 适合场景                    |
| ------------ | --------------------------- |
| 默认交互文本 | 本地直接阅读                |
| JSON         | CI、编辑器、脚本消费        |
| Markdown     | 粘贴到 issue、PR 或排障文档 |
| `--redact`   | 分享报告前隐藏本机绝对路径  |

## 4. strict 模式

`--strict` 会把 warning 也视为失败。它适合放在 CI 早期阶段：

```bash
pnpm install --frozen-lockfile
repo doctor --strict
repo check --full
```

如果你正在接入存量仓库，建议先不用 strict，把报告保存下来逐项修复：

```bash
repo doctor --markdown --redact --out reports/doctor.md
repo upgrade --no-overwrite
repo doctor
```

## 5. 排查顺序

建议按阻塞程度处理：

1. 先处理 `fail`，否则命令或 CI 很可能无法继续。
2. 再处理配置冲突和 Node 版本问题。
3. 然后补根脚本、hook 和 lint-staged。
4. 最后整理 workspace patterns 与 tooling imports。

如果不确定报告能否安全分享，使用 [报告与自动化输出](./reports.md) 里的 `--redact` 和 `env support`。
