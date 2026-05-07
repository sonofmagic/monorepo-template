# 接入已有仓库

repoctl 不只适合新模板仓库。它也可以渐进接入已有 pnpm workspace，用诊断报告和非覆盖同步把风险降下来。

## 适合接入的仓库

优先满足这些条件：

- 已经使用 pnpm 或准备迁移到 pnpm。
- 有根 `package.json`。
- 能接受 `apps/*`、`packages/*`、`examples/*` 这类 workspace 目录约定。
- 希望统一 `setup`、`doctor`、`new`、`check` 这类日常入口。

如果仓库还不是 pnpm workspace，先补最小 `pnpm-workspace.yaml`：

```yaml
packages:
  - apps/*
  - packages/*
```

## 第一步：安装并初始化

```bash
pnpm add -D repoctl
pnpm exec repo setup --yes
```

`setup --yes` 会使用安全默认值。它会补齐推荐脚本和 workspace patterns，但不会无条件覆盖已有 README、package.json、pnpm-workspace.yaml 或 tooling 配置。

## 第二步：保存第一次诊断

```bash
pnpm exec repo doctor --markdown --redact --out reports/doctor-before.md
pnpm exec repo doctor --json --out reports/doctor-before.json
```

建议把第一次报告提交到 PR 评论或 artifact，而不是只看终端输出。

重点看这些项：

| 检查项                       | 常见问题                                             |
| ---------------------------- | ---------------------------------------------------- |
| `package-json`               | 当前目录不是仓库根目录                               |
| `workspace-manifest`         | 缺少 `pnpm-workspace.yaml`                           |
| `node-version`               | 根 package 没声明 `engines.node` 或版本不匹配        |
| `tool-package`               | 没安装 `repoctl`                                     |
| `root-scripts`               | 缺少 `setup/new/check/doctor`                        |
| `config-file`                | `repoctl.config.ts` 和 `monorepo.config.ts` 同时存在 |
| `commit-hooks`               | Husky 和 lint-staged 只接了一半                      |
| `workspace-package-coverage` | package.json 没被 workspace patterns 覆盖            |

## 第三步：保守同步标准资产

```bash
pnpm exec repo upgrade --no-overwrite
pnpm exec repo doctor --markdown --redact --out reports/doctor-after.md
```

`--no-overwrite` 适合第一次接入：它同步缺失资产，但保留已有 drifted 文件。你可以在 PR diff 里逐项看哪些配置要进一步迁移。

## 第四步：预览校验计划

```bash
pnpm exec repo check --dry-run
pnpm exec repo check --json --out reports/check-plan.json
pnpm exec repo check --markdown --redact --out reports/check-plan.md
```

先看 plan，再决定要不要接入 hook 或 CI。

## 第五步：接入根脚本

如果 `setup` 已补齐根脚本，团队日常文档就可以改成：

```bash
pnpm doctor
pnpm new
pnpm check
```

CI 和自动化脚本仍建议写完整 CLI：

```bash
pnpm exec repo doctor --strict
pnpm exec repo check --full
```

## 第六步：处理遗留配置

### 配置文件冲突

只保留：

```txt
repoctl.config.ts
```

`monorepo.config.ts` 只是兼容旧项目。

### 本地 tooling loader

如果 `doctor` 提示 tooling 配置引用了本地源码 loader，使用：

```bash
pnpm exec repo upgrade --yes
```

这个命令会迁移到 `repoctl/tooling` 入口。

### workspace patterns 不覆盖包

运行：

```bash
pnpm exec repo setup --yes
```

或手动扩展 `pnpm-workspace.yaml`。

## 推荐 PR 结构

存量仓库接入建议拆成小 PR：

1. 安装 `repoctl`，补 `setup/doctor/new/check` 根脚本。
2. 提交 `doctor-before` 和 `doctor-after` 报告。
3. 同步或迁移 tooling 配置。
4. 接入 hook 和 CI。
5. 用 `repo new --dry-run` 验证模板创建路径。

## 下一步

- [工作流与 CI](./workflows.md)
- [排障与报告](./troubleshooting.md)
- [配置文件](./config.md)
