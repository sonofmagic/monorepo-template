# repoctl Overview

`repoctl` is the user-facing package name for this monorepo toolkit. Its recommended command is `repo`.

The CLI does not replace pnpm, Turborepo, or changesets. It gives teams a stable layer for common monorepo actions: setup, diagnostics, scaffolding, local verification, and template asset upgrades.

## When To Use It

| Goal                                                  | Command                  |
| ----------------------------------------------------- | ------------------------ |
| Add recommended scripts and workspace defaults        | `pnpm exec repo setup`   |
| Check whether a repository is ready to develop        | `pnpm exec repo doctor`  |
| Create a package, app, docs site, service, or CLI     | `pnpm exec repo new`     |
| Reproduce the recommended pre-commit or pre-push flow | `pnpm exec repo check`   |
| Sync newer standard assets from the template          | `pnpm exec repo upgrade` |
| Persist output for CI, editors, or issue reports      | `--json --out <file>`    |

## Recommended Command Layers

### Root Scripts

```bash
pnpm setup
pnpm doctor
pnpm new
pnpm check
```

These are the best commands for day-to-day team docs.

### Explicit CLI Calls

```bash
pnpm exec repo setup
pnpm exec repo doctor
pnpm exec repo templates
pnpm exec repo new sdk --template tsdown
pnpm exec repo check --dry-run
```

Use this form in CI, scripts, troubleshooting docs, and reproducible examples.

### Grouped Commands

```bash
pnpm exec repo ws ls
pnpm exec repo tg init --all
pnpm exec repo env support --markdown --redact
pnpm exec repo config inspect
```

Grouped commands are for maintainers and automation that need finer control.

## Compatibility

The package still supports compatibility entry points:

```bash
pnpm exec repoctl doctor
pnpm exec repoctl new
```

The docs prefer `repo` so new users only need to remember one command name.

## Keep Reading

- [Getting Started](./getting-started.md)
- [Choose By Scenario](./scenarios.md)
- [Command Reference](./commands.md)
- [Configuration](./config.md)
- [Templates](./templates.md)
- [Workflows and CI](./workflows.md)
- [Troubleshooting](./troubleshooting.md)
- [Command Aliases](./aliases.md)
