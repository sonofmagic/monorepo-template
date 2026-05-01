# repoctl

Package name: `repoctl`. Recommended command: `repo`.

## Install

```sh
pnpm add -D repoctl
```

## Quick Start

```sh
pnpm exec repo setup
pnpm exec repo doctor
pnpm exec repo doctor --json
pnpm exec repo doctor --json --out reports/doctor.json
pnpm exec repo templates
pnpm exec repo new my-package
pnpm exec repo check
pnpm exec repo check --dry-run
```

Inside generated repos, the same workflow is available as shorter root scripts:

```sh
pnpm setup
pnpm doctor
pnpm new my-package
pnpm check
```

## What Each Command Is For

- `repo setup`: initialize the workspace with the recommended metadata and tooling defaults.
- `repo doctor`: diagnose whether the current repo is ready to use.
- `repo templates`: list the built-in package/app templates and their target folders.
- `repo new`: create a new package or app.
- `repo check`: run the recommended local verification flow.
- `repo upgrade`: sync the latest standard assets and scripts from the template.

`repo doctor` is intentionally lightweight. It checks root workspace files, Node version compatibility, CLI dependency presence, recommended root scripts, config conflicts, and whether Husky plus lint-staged are both wired. Use `repo doctor --json --out reports/doctor.json` when automation needs a persisted report.
Use `repo check --dry-run` or `repo check --json --out reports/check-plan.json` when automation needs to inspect the verification plan before running it.

## Common Commands

```sh
# sync repo standards
pnpm exec repo upgrade

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

Prefer `repoctl.config.ts`. `monorepo.config.ts` remains supported for compatibility, but the two files cannot coexist.

## Compatibility

`repoctl new foo`, `repoctl doctor`, and `repoctl check` remain supported as compatibility aliases.

## Performance Notes

The CLI keeps startup lightweight by registering the command tree first and loading each command implementation only when that action runs. Workspace discovery also uses an in-process cache, so repeated checks inside one command reuse the same `pnpm-workspace.yaml` and package scan results.

## Advanced Usage

If you need the lower-level API and tooling wrappers, see `@icebreakers/monorepo`.
