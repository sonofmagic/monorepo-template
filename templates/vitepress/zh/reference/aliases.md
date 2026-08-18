# 命令别名

repoctl 保留了一组短别名，方便熟悉后在终端里少打字。团队文档仍建议优先写完整命令，减少新人理解成本。

## 包入口别名

`repoctl` 包提供多个 bin：

```bash
repo
repoctl
monorepo
rc
mo
```

文档统一推荐 `repo`。

这些 bin 都进入同一套命令实现：

```bash
repoctl doctor
monorepo doctor
rc doctor
mo doctor
```

## 顶层命令别名

| 推荐写法         | 短写        | 说明             |
| ---------------- | ----------- | ---------------- |
| `repo init`      | `repo init` | 初始化仓库默认值 |
| `repo templates` | `repo tpl`  | 查看或检查模板   |

## 分组命令别名

| 完整命令                       | 短写            |
| ------------------------------ | --------------- |
| `repo workspace`               | `repo ws`       |
| `repo workspace upgrade`       | `repo ws up`    |
| `repo workspace list`          | `repo ws ls`    |
| `repo workspace clean`         | `repo ws rm`    |
| `repo tooling`                 | `repo tg`       |
| `repo tooling init`            | `repo tg i`     |
| `repo package`                 | `repo pkg`      |
| `repo package create`          | `repo pkg new`  |
| `repo verify`                  | `repo v`        |
| `repo verify pre-push`         | `repo v push`   |
| `repo verify pre-commit`       | `repo v commit` |
| `repo verify commit-msg`       | `repo v msg`    |
| `repo verify staged-typecheck` | `repo v tc`     |
| `repo env`                     | `repo e`        |
| `repo env info`                | `repo e i`      |
| `repo env snapshot`            | `repo e s`      |
| `repo env paths`               | `repo e p`      |
| `repo env support`             | `repo e b`      |
| `repo env mirror`              | `repo e m`      |
| `repo config`                  | `repo cfg`      |
| `repo config inspect`          | `repo cfg i`    |
| `repo skills`                  | `repo sk`       |
| `repo skills sync`             | `repo sk s`     |
| `repo ai prompt`               | `repo ai p`     |
| `repo ai prompt create`        | `repo ai p new` |

## 推荐使用原则

- 新手教程写完整命令，例如 `pnpm exec repo doctor`。
- 团队 README 写根脚本，例如 `pnpm run repo:doctor`。
- 维护者脚本可以写短别名，但要在注释或文档里说明用途。
- CI 里优先写完整命令，方便日志搜索。
