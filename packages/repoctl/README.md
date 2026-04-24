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
pnpm exec repo new my-package
pnpm exec repo check
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
- `repo new`: create a new package or app.
- `repo check`: run the recommended local verification flow.
- `repo upgrade`: sync the latest standard assets and scripts from the template.

`repo doctor` is intentionally lightweight. It checks root workspace files, Node version compatibility, CLI dependency presence, recommended root scripts, config conflicts, and whether Husky plus lint-staged are both wired.

## Common Commands

```sh
# sync repo standards
pnpm exec repo upgrade

# create a specific template without extra prompts
pnpm exec repo new dashboard --template vue-hono

# advanced workspace upgrade
pnpm exec repo ws up

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

## Advanced Usage

If you need the lower-level API and tooling wrappers, see `@icebreakers/monorepo`.
