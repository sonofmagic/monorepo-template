# repoctl

Package name: `repoctl`. Recommended command: `repo`.

## Install

```sh
pnpm add -D repoctl
```

## Quick Start

```sh
pnpm exec repo init
pnpm exec repo doctor
pnpm exec repo doctor --json
pnpm exec repo doctor --json --out reports/doctor.json
pnpm exec repo templates
pnpm exec repo new my-package
pnpm exec repo check
pnpm exec repo check --dry-run
pnpm exec repo env info
```

Inside generated repos, the same workflow is available as conflict-free `repo:*` root scripts:

```sh
pnpm run repo:init
pnpm run repo:doctor -- --json
pnpm run repo:new -- my-package
pnpm run repo:check
```

## What Each Command Is For

- `repo init`: initialize the workspace with the recommended metadata and tooling defaults.
- `repo doctor`: diagnose whether the current repo is ready to use.
- `repo templates`: list the built-in package/app templates and their target folders.
- `repo new`: create a new package or app.
- `repo check`: run the recommended local verification flow.
- `repo upgrade`: sync the latest standard assets and scripts from the template.

`repo init` is safe to run in an existing pnpm workspace. By default it creates missing root files, appends missing workspace patterns, and skips existing README/tooling files; use `--force` or `--overwrite` when you explicitly want managed files rewritten. Use `--yes` in CI.

`repo upgrade` is also CI-safe. In a non-TTY process it will not prompt; changed files are skipped unless you pass `--yes` or `--overwrite`. Use `--no-overwrite` when automation must preserve every changed file.

`repo doctor` is intentionally lightweight. It checks root workspace files, Node version compatibility, CLI dependency presence, recommended `repo:*` root scripts, stale `monorepo.config.ts` files, workspace pattern coverage, legacy local tooling imports, and whether Husky plus lint-staged are both wired. Use `repo doctor --json --out reports/doctor.json` or `pnpm run repo:doctor -- --json` when automation needs a persisted report.
Use `repo check --dry-run` or `repo check --json --out reports/check-plan.json` when automation needs to inspect the verification plan before running it.

## Common Commands

```sh
# sync repo standards
pnpm exec repo upgrade
pnpm exec repo upgrade --yes
pnpm exec repo upgrade --no-overwrite

# create a specific template without extra prompts
pnpm exec repo new dashboard --template vue-hono
pnpm exec repo new dashboard --template vue-hono --dry-run
pnpm exec repo new dashboard --template vue-hono --json
pnpm exec repo new dashboard --template vue-hono --json --out plans/dashboard.json
# invalid template keys fail with a suggestion instead of falling back silently

# discover available templates
pnpm exec repo templates
pnpm exec repo templates tsdown
pnpm exec repo templates --category library
pnpm exec repo templates --check
pnpm exec repo templates --check --json
pnpm exec repo templates --json
pnpm exec repo templates --markdown
pnpm exec repo templates tsdown --markdown
pnpm exec repo templates --markdown --out docs/templates.md

# advanced workspace upgrade
pnpm exec repo ws up

# inspect verification routing
pnpm exec repo check --dry-run
pnpm exec repo check --json --out reports/check-plan.json

# collect environment info for debugging
pnpm exec repo env info
pnpm exec repo env info --json --out reports/env.json
pnpm exec repo env snapshot --json --out reports/snapshot.json

# inspect workspace packages
pnpm exec repo ws ls
pnpm exec repo ws ls --json --include-private
pnpm exec repo ws ls --json --out reports/workspaces.json

# generate tooling configs
pnpm exec repo tg init --all
```

## Config

Create `repoctl.config.ts` in the workspace root to customize defaults.

```ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    init: {
      preset: 'standard',
    },
    create: {
      defaultTemplate: 'tsdown',
    },
  },
})
```

When `commands.create.defaultTemplate` is set, `repo new foo` creates the package directly and places it under the conventional base directory inferred from the template, such as `packages/foo` or `apps/foo`.

Use `repoctl.config.ts`. `monorepo.config.ts` is no longer loaded at runtime.

## Performance Notes

The CLI keeps startup lightweight by registering the command tree first and loading each command implementation only when that action runs. Workspace discovery also uses an in-process cache, so repeated checks inside one command reuse the same `pnpm-workspace.yaml` and package scan results.

## Advanced Usage

If you need the lower-level API and tooling wrappers, see `@icebreakers/monorepo`.
