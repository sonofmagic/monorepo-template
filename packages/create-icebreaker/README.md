# create-icebreaker

Interactive bootstrapper for the icebreaker monorepo template. It scaffolds from the npm package and trims templates based on your selections.

## Usage

- `pnpm create icebreaker`
- `npm create icebreaker@latest`

By default this:

- uses npm templates by default (no GitHub needed)
- asks for the project directory (defaults to `icebreaker-monorepo`)
- asks which templates to keep (default keeps none)
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

- `--templates <list>`: comma-separated template keys or indexes to keep (e.g. `tsup,vue-hono` or `1,5`)
- `--force`: overwrite a non-empty target directory
