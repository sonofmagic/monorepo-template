# Command Aliases

repoctl keeps several aliases for terminal convenience. Team docs should still prefer full commands because they are easier for new users to read.

## Binary Aliases

The `repoctl` package exposes these bins:

```bash
repo
repoctl
monorepo
rc
mo
```

The docs recommend `repo`.

Compatibility entry points remain available:

```bash
repoctl doctor
monorepo doctor
rc doctor
mo doctor
```

## Top-Level Aliases

| Recommended      | Alias       | Purpose                       |
| ---------------- | ----------- | ----------------------------- |
| `repo setup`     | `repo init` | Initialize workspace defaults |
| `repo upgrade`   | `repo sync` | Sync standard template assets |
| `repo templates` | `repo tpl`  | Inspect or check templates    |

## Group Aliases

| Full Command                   | Alias           |
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

## Recommendation

- Use full commands in onboarding docs.
- Use root scripts in project README files.
- Use short aliases in maintainer scripts only when the surrounding docs explain them.
- Prefer full commands in CI logs.
