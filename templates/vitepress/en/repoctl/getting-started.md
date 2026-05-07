# Getting Started

This guide follows the order you would use when adding repoctl to a workspace.

## Prerequisites

- Node.js 20 or newer.
- pnpm. Corepack is recommended: `corepack enable`.
- Git. `repo doctor` reads repository metadata and checks the commit workflow.

```bash
node -v
pnpm -v
git --version
```

## Install

```bash
pnpm add -D repoctl
```

If the repository was generated from this template, the dependency and root scripts may already be present.

## Initialize Defaults

```bash
pnpm install
pnpm exec repo setup
pnpm exec repo doctor
```

| Command        | Purpose                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| `pnpm install` | Install workspace dependencies and local links                              |
| `repo setup`   | Add recommended scripts, workspace patterns, and tooling entries            |
| `repo doctor`  | Check root files, Node version, CLI dependency, config conflicts, and hooks |

Fix blocking issues reported by `doctor`, then run it again.

## Create A Package

List templates first:

```bash
pnpm exec repo templates
```

Create a TypeScript library:

```bash
pnpm exec repo new sdk --template tsdown
```

Preview before writing files:

```bash
pnpm exec repo new sdk --template tsdown --dry-run
pnpm exec repo new sdk --template tsdown --json --out plans/sdk.json
```

`--json` and `--out` imply `--dry-run`, which makes them suitable for CI, editor integrations, and scripts.

## Use Short Root Scripts

After `repo setup`, daily commands can be shorter:

```bash
pnpm setup
pnpm doctor
pnpm new sdk --template tsdown
pnpm check
```

| Root script   | Equivalent CLI          |
| ------------- | ----------------------- |
| `pnpm setup`  | `pnpm exec repo setup`  |
| `pnpm doctor` | `pnpm exec repo doctor` |
| `pnpm new`    | `pnpm exec repo new`    |
| `pnpm check`  | `pnpm exec repo check`  |

## Verify Before Committing

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

Or use the repoctl verification entry:

```bash
pnpm check
pnpm exec repo check --dry-run
pnpm exec repo check --json --out reports/check-plan.json
```

## Sync Template Assets

```bash
pnpm exec repo upgrade
pnpm exec repo upgrade --no-overwrite
pnpm exec repo upgrade --yes
```

- `--no-overwrite` preserves changed managed files.
- `--yes` or `--overwrite` is for explicit automated overwrites.
- Non-TTY environments do not open interactive prompts.

## Next Steps

- Adopt an existing repository: [Adopt Existing Repositories](./adopt-existing.md).
- Set team defaults: [Configuration](./config.md).
- Inspect template keys: [Templates](./templates.md).
- Share diagnostic output: [Troubleshooting](./troubleshooting.md).
