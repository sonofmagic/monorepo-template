# Monorepo Command Reference

| Task                           | Command                |
| ------------------------------ | ---------------------- |
| Initialize repository defaults | `repo init`            |
| Diagnose workspace state       | `repo doctor`          |
| Create a package or app        | `repo new`             |
| Preview or run verification    | `repo check`           |
| Synchronize managed assets     | `repo upgrade`         |
| List workspace packages        | `repo ws ls`           |
| Initialize tooling configs     | `repo tg init --all`   |
| Run pre-push verification      | `repo verify pre-push` |

One command layer matters because scripts, documentation, CI, and contributor expectations otherwise drift independently. repoctl keeps task names stable while pnpm and Turborepo continue to perform dependency installation and task execution.

See the complete [repoctl command reference](/reference/commands).
