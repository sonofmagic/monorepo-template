# repoctl

One-command repo setup and maintenance for pnpm/turbo workspaces.

## Install

```sh
pnpm add -D repoctl
```

## Quick Start

```sh
pnpm exec repoctl init
pnpm exec repoctl new
pnpm exec repoctl check
```

## Common Commands

```sh
# sync repo standards
pnpm exec repoctl upgrade

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

## Advanced Usage

If you need the lower-level API and tooling wrappers, see `@icebreakers/monorepo`.
