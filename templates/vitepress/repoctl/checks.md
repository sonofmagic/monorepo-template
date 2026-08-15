---
outline: deep
---

# repoctl Verification

`repo check` provides stable, task-oriented entrypoints for local and CI verification. It preserves the underlying workspace scripts and reports which commands will run before execution.

## Modes

| Mode           | Command                         | Purpose                                             |
| -------------- | ------------------------------- | --------------------------------------------------- |
| Default        | `repo check`                    | Lightweight pre-commit verification                 |
| Staged         | `repo check --staged`           | lint-staged plus workspace-aware type checking      |
| Full           | `repo check --full`             | Root lint, typecheck, build, test, and tsd workflow |
| Commit message | `repo check --edit-file <file>` | Validate a commit message file                      |

Use `--dry-run`, `--json`, or `--markdown` to inspect the plan without running it. `--out <file>` persists the result and `--redact` removes local paths.

## Pre-Commit

`repo verify pre-commit` runs the repository's staged-file policy. JavaScript, TypeScript, Vue, and style files are routed to the configured lint tasks.

## Staged Type Checking

`repo verify staged-typecheck <files...>` maps changed TypeScript and Vue files to their owning workspace. Vue packages use their `vue-tsc` based typecheck script; TypeScript packages use `tsc`.

## Pre-Push

`repo verify pre-push` is the comprehensive delivery gate. The repository policy builds first, then runs lint, type checks, type-level tests, and test suites against built artifacts.

## Automation

```bash
repo check --full --dry-run --json --out reports/check-plan.json
repo check --staged --markdown --redact --out reports/check-plan.md
```

JSON field names and command IDs do not change with `--lang`; only human-readable descriptions do.
