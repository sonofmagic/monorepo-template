# 排障与报告

repoctl 的排障重点不是让你猜错在哪里，而是尽量输出可以复现、可以保存、可以发给同事的报告。

## 先跑 doctor

```bash
repo doctor
repo doctor --strict
```

`doctor` 主要检查：

- 当前目录是不是仓库根目录。
- Node 版本是否满足要求。
- `pnpm-workspace.yaml` 是否存在。
- `repoctl` 是否作为 CLI 依赖安装。
- 根脚本是否齐全。
- 是否仍残留已废弃的 `monorepo.config.ts`。
- Husky 与 lint-staged 是否都接上。

## 保存诊断报告

```bash
repo doctor --json --out reports/doctor.json
repo doctor --markdown --redact --out reports/doctor.md
```

推荐把 Markdown 报告贴到 issue 或 PR。`--redact` 会脱敏本机路径。

## 查看校验计划

```bash
repo check --dry-run
repo check --json --out reports/check-plan.json
repo check --markdown --redact --out reports/check-plan.md
```

当你不确定为什么某个文件触发了 workspace typecheck、pre-push 要跑哪些任务时，先看 check plan。

## 收集环境信息

```bash
repo env info
repo env support --markdown --redact --out reports/support.md
repo env snapshot --json --out reports/snapshot.json
repo env paths --markdown --redact --out reports/paths.md
```

这些命令适合排查 Node、pnpm、workspace、Git、路径和 CI 环境差异。

## 先判断问题类型

| 现象                           | 优先命令                                  | 继续阅读                             |
| ------------------------------ | ----------------------------------------- | ------------------------------------ |
| 不确定当前目录是不是仓库根目录 | `repo doctor`                             | [doctor 诊断](./doctor.md)           |
| 不知道 `repo check` 会跑什么   | `repo check --dry-run`                    | [校验链路](./checks.md)              |
| CI 失败但日志不完整            | `repo env support --markdown --redact`    | [报告与自动化输出](./reports.md)     |
| 模板创建结果不符合预期         | `repo new <name> --template <key> --json` | [模板资产治理](./template-assets.md) |
| 模板列表或元数据异常           | `repo templates --check`                  | [模板资产治理](./template-assets.md) |

## 常见问题

### 当前目录不是仓库根目录

切回包含 `pnpm-workspace.yaml` 和根 `package.json` 的目录，再运行：

```bash
repo doctor
```

### 同时存在两个配置文件

只保留一个：

```txt
repoctl.config.ts
```

`monorepo.config.ts` 已不再加载。旧项目需要改名为 `repoctl.config.ts`。

### `repo new` 提示模板不存在

先查看可用模板：

```bash
repo templates
```

显式传入的 `--template` 会先校验。拼错时命令会失败并提示相近 key，不会静默回退。

### 自动化里不希望出现交互

使用非交互参数：

```bash
repo init --yes
repo upgrade --no-overwrite
repo check --json --out reports/check-plan.json
```

非 TTY 环境下，repoctl 不会弹出交互选择框。

## 继续阅读

- [工作流与 CI](./workflows.md)
- [命令速查](./commands.md)
- [doctor 诊断](./doctor.md)
- [报告与自动化输出](./reports.md)
- [命令别名](./aliases.md)
