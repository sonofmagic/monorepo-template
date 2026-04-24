# repoctl

One-command repo setup and maintenance for pnpm/turbo workspaces.

## Install

```sh
pnpm add -D repoctl
```

## Quick Start

```sh
pnpm exec repoctl setup
pnpm exec repoctl new my-package
pnpm exec repoctl check
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
pnpm exec repoctl upgrade

# create a specific template without extra prompts
pnpm exec repoctl new dashboard --template vue-hono

# advanced workspace upgrade
pnpm exec repoctl ws up

# generate tooling configs
pnpm exec repoctl tg init --all
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

When `commands.create.defaultTemplate` is set, `repoctl new foo` now creates the package directly and places it under the conventional base directory inferred from the template, such as `packages/foo` or `apps/foo`.

## Advanced Usage

If you need the lower-level API and tooling wrappers, see `@icebreakers/monorepo`.
