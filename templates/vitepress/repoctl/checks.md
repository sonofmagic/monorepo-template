---
description: 说明 repoctl check 和 verify 的校验模式、pre-commit、staged typecheck、pre-push 与 commit-msg 链路。
---

# repoctl 校验链路

`repo check` 是给人使用的统一入口，`repo verify` 是给 hook、CI 和脚本复用的底层入口。

## 1. 模式速查

| 命令                                         | 模式         | 实际动作                                                       |
| -------------------------------------------- | ------------ | -------------------------------------------------------------- |
| `repo check`                                 | `default`    | 执行 `repo verify pre-commit`                                  |
| `repo check --staged`                        | `staged`     | 执行 pre-commit，并按 staged TypeScript/Vue 文件路由 typecheck |
| `repo check --full`                          | `full`       | 按根脚本执行 `lint`、`typecheck`、`test`、`build` 中存在的任务 |
| `repo check --edit-file .git/COMMIT_EDITMSG` | `commit-msg` | 执行 commit message 校验                                       |

预览模式不会真正执行校验：

```bash
repo check --dry-run
repo check --full --json --out reports/check-plan.json
repo check --markdown --redact --out reports/check-plan.md
```

## 2. pre-commit

`repo verify pre-commit` 默认执行 lint-staged。适合在提交前只处理 staged 文件，避免每次提交都跑整仓校验。

推荐的 lint-staged 行为包括：

| 文件类型                   | 推荐处理                                 |
| -------------------------- | ---------------------------------------- |
| JS、TS、Vue                | ESLint 自动修复                          |
| CSS、SCSS、Less、Vue style | Stylelint 自动修复                       |
| TS、TSX、MTS、CTS、Vue     | 路由到最近 workspace 的 `typecheck` 脚本 |

## 3. staged typecheck

`repo verify staged-typecheck <files...>` 会根据文件路径向上查找最近的 workspace，并执行该 workspace 的 `typecheck`。

```bash
repo verify staged-typecheck packages/ui/src/button.ts templates/client/src/App.vue
```

它解决的是 monorepo 里常见的问题：一个提交只改了某个包，不应该让所有 Vue 和 TypeScript workspace 都重复跑类型检查。

## 4. pre-push

`repo verify pre-push` 面向推送前的完整保护。默认策略是：

| 阶段         | 行为                                             |
| ------------ | ------------------------------------------------ |
| 根任务       | 强制执行整仓 `lint` 与 `typecheck`               |
| 变更范围任务 | 按 workspace 改动范围补跑 `build`、`test`、`tsd` |
| 失败处理     | 任一任务失败时停止并返回失败状态                 |

如果 CI 想要更明确地复现整仓校验，可以使用：

```bash
repo check --full
```

## 5. commit message

`repo verify commit-msg <file>` 用于 Git 的 `commit-msg` hook。未配置自定义命令时，它会执行：

```bash
pnpm exec commitlint --edit <file>
```

如果你只是手动验证当前提交信息，可以运行：

```bash
repo check --edit-file .git/COMMIT_EDITMSG
```

## 6. 选择建议

| 场景               | 推荐命令                                          |
| ------------------ | ------------------------------------------------- |
| 本地提交前快速复现 | `repo check`                                      |
| lint-staged 调试   | `repo check --staged --dry-run`                   |
| 推送前完整检查     | `repo check --full`                               |
| CI 门禁            | `repo doctor --strict` 后接 `repo check --full`   |
| 只生成计划         | `repo check --json --out reports/check-plan.json` |
