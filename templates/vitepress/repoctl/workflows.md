# Workflows and CI

repoctl commands have two audiences: humans using short daily commands, and automation consuming stable reports.

## Local Daily Workflow

```bash
pnpm install
pnpm run repo:doctor
pnpm run repo:new -- sdk --template tsdown
pnpm run repo:check
pnpm build
```

| Step                   | What It Proves                                          |
| ---------------------- | ------------------------------------------------------- |
| `pnpm install`         | Workspace dependencies and local links are ready        |
| `pnpm run repo:doctor` | Root files, Node, scripts, config, and hooks are usable |
| `pnpm run repo:new`    | New packages follow template conventions                |
| `pnpm run repo:check`  | The lightweight local verification flow is reproducible |
| `pnpm build`           | The workspace build graph has no obvious breakage       |

## Adopt An Existing Repository

```bash
pnpm add -D repoctl
pnpm exec repo init --yes
pnpm exec repo doctor --markdown --out reports/doctor.md
pnpm exec repo upgrade --no-overwrite
pnpm exec repo doctor
```

Start conservatively with `--no-overwrite`. After reviewing asset drift, decide whether `--yes` or `--overwrite` is appropriate.

## Fast CI Gate

```bash
pnpm install --frozen-lockfile
pnpm exec repo doctor --strict
pnpm exec repo check --full
```

This is a simple gate for small repositories or early projects. `doctor --strict` treats warnings as failures.

## CI Report Mode

```bash
pnpm exec repo doctor --json --out reports/doctor.json
pnpm exec repo check --json --out reports/check-plan.json
pnpm exec repo env support --markdown --redact --out reports/support.md
```

Use these outputs as CI artifacts:

- `doctor.json` for scripts.
- `check-plan.json` to explain verification routing.
- `support.md` for issues, PRs, and external collaboration.

## Hooks

```bash
repo verify pre-commit
repo verify staged-typecheck packages/app/src/main.ts
repo verify commit-msg .git/COMMIT_EDITMSG
repo verify pre-push
```

| Stage      | Recommended Behavior                                      |
| ---------- | --------------------------------------------------------- |
| pre-commit | Focus on staged files, lint, and workspace typecheck      |
| commit-msg | Enforce Conventional Commit messages                      |
| pre-push   | Run root lint/typecheck and affected build/test/tsd tasks |

## Non-Interactive Options

| Scenario                              | Option                                             |
| ------------------------------------- | -------------------------------------------------- |
| Accept setup defaults                 | `repo init --yes`                                  |
| Preserve changed files during upgrade | `repo upgrade --no-overwrite`                      |
| Explicitly overwrite standard assets  | `repo upgrade --yes` or `repo upgrade --overwrite` |
| Preview only                          | `--dry-run`                                        |
| Output for scripts                    | `--json --out <file>`                              |
| Share a redacted report               | `--markdown --redact --out <file>`                 |

## Keep Reading

- [Command Reference](./commands.md)
- [Troubleshooting](./troubleshooting.md)
- [Command Aliases](./aliases.md)
