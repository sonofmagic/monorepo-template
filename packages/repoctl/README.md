# repoctl

Package name: `repoctl`. Recommended command: `repo`.

## Install

```sh
pnpm add -D repoctl
```

## Quick Start

```sh
pnpm exec repo setup
pnpm exec repo new my-package
pnpm exec repo check
```

Inside generated repos, the same workflow is available as shorter root scripts:

```sh
pnpm setup
pnpm new my-package
pnpm check
```

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

When `commands.create.defaultTemplate` is set, `repo new foo` now creates the package directly and places it under the conventional base directory inferred from the template, such as `packages/foo` or `apps/foo`. `repoctl new foo` remains supported as a compatibility alias.

## Advanced Usage

If you need the lower-level API and tooling wrappers, see `@icebreakers/monorepo`.
