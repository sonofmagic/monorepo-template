# Troubleshooting

repoctl focuses on reports that can be reproduced, saved, and shared.

## Start With Doctor

```bash
repo doctor
repo doctor --strict
```

`doctor` checks:

- Current directory and repository root.
- Node.js version.
- `pnpm-workspace.yaml`.
- The `repoctl` CLI dependency.
- Recommended root scripts.
- Conflicting config files.
- Husky and lint-staged wiring.

## Save A Diagnostic Report

```bash
repo doctor --json --out reports/doctor.json
repo doctor --markdown --redact --out reports/doctor.md
```

Markdown reports are useful in issues and PRs. `--redact` removes local absolute paths.

## Inspect The Verification Plan

```bash
repo check --dry-run
repo check --json --out reports/check-plan.json
repo check --markdown --redact --out reports/check-plan.md
```

Use this when you need to understand why a file triggers a workspace typecheck or which tasks pre-push would run.

## Collect Environment Information

```bash
repo env info
repo env support --markdown --redact --out reports/support.md
repo env snapshot --json --out reports/snapshot.json
repo env paths --markdown --redact --out reports/paths.md
```

These commands help compare local, CI, Git, Node, pnpm, and workspace differences.

## Common Fixes

### Not At Repository Root

Change into the directory that contains `pnpm-workspace.yaml` and the root `package.json`, then run:

```bash
repo doctor
```

### Conflicting Config Files

Keep only:

```txt
repoctl.config.ts
```

`monorepo.config.ts` is for compatibility with older projects.

### Unknown Template Key

List available templates:

```bash
repo templates
```

Explicit `--template` values are validated first. Invalid keys fail with suggestions.

### Automation Should Not Prompt

Use non-interactive options:

```bash
repo setup --yes
repo upgrade --no-overwrite
repo check --json --out reports/check-plan.json
```
