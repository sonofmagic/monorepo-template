# create-icebreaker

Interactive bootstrapper for the icebreaker monorepo template. It can scaffold from npm (default) or clone from GitHub, then trims templates based on your selections.

## Usage

- `pnpm create icebreaker`
- `npm create icebreaker@latest`

By default this:

- uses npm templates by default (no GitHub needed)
- asks for the project directory (defaults to `icebreaker-monorepo`)
- asks which templates to keep (default keeps none)
- removes `docs/`, `templates/`, `packages/monorepo`, `packages/create-icebreaker`, and `packages/monorepo-templates` when cloning from git
- updates the root `package.json` name

## Templates

Available template keys:

- `unbuild`
- `tsup`
- `tsdown`
- `vue-lib`
- `vue-hono`
- `hono-server`
- `vitepress`
- `cli`

## Flags

- `--repo <git-url-or-owner/name>`: clone a different repo (git source only)
- `--branch <branch-or-tag>`: choose a branch or tag (git source only)
- `--source <npm|git>`: use npm templates or clone from git (default npm)
- `--templates <list>`: comma-separated template keys or indexes to keep (e.g. `tsup,vue-hono` or `1,5`)
- `--force`: overwrite a non-empty target directory
