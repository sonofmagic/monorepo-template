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

## Next Steps

After scaffolding finishes:

```sh
cd <your-project>
pnpm install
pnpm exec repoctl init
pnpm exec repoctl new
pnpm exec repoctl check
```

Recommended maintenance flow inside the generated workspace:

- `pnpm exec repoctl init`: bootstrap recommended workspace metadata and tooling
- `pnpm exec repoctl new`: create the next package or app through the guided flow
- `pnpm exec repoctl check`: run recommended local verification
- `pnpm dlx repoctl@latest clean --yes`: optional zero-install cleanup on a fresh clone

## Templates

Available template keys:

- `tsdown`
- `vue-lib`
- `vue-hono`
- `hono-server`
- `vitepress`
- `cli`

## Flags

- `--templates <list>`: comma-separated template keys or indexes to keep (e.g. `tsdown,vue-hono` or `1,4`)
- `--force`: overwrite a non-empty target directory
