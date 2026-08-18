# Your first run

This is the smallest complete repoctl workflow. It makes one change, records evidence, and leaves you with a clear next action.

## Install

```bash
pnpm add -D repoctl
```

## Initialize

```bash
pnpm exec repo init
```

Review the planned files before accepting writes. If the repository already has local conventions, use the adoption guide before allowing replacements.

## Diagnose

```bash
pnpm exec repo doctor
```

The report checks the repository root, package manager, workspace layout, task runner, hooks, and release metadata. Fix the first reported blocker, then run the command again.

## Plan checks

```bash
pnpm exec repo check --dry-run
```

This prints the commands that would run for lint, types, builds, tests, and package checks. Execute the plan only after it matches the checks your repository expects.

## Next

- New repository: [Create a package or app](/tasks/create-project).
- Existing repository: [Adopt an existing workspace](/tasks/adopt-existing).
- CI setup: [Add checks to CI](/tasks/ci).
