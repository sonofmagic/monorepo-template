# Templates

repoctl templates are maintained by `@icebreakers/monorepo-templates`. The CLI, scaffolder, and docs share the same template metadata.

## Built-In Templates

| Key           | Category | Default target     | Use case                |
| ------------- | -------- | ------------------ | ----------------------- |
| `tsdown`      | library  | `packages/tsdown`  | TypeScript library      |
| `vue-lib`     | library  | `packages/vue-lib` | Vue 3 component library |
| `vue-hono`    | app      | `apps/client`      | Vue 3 + Hono app        |
| `hono-server` | service  | `apps/server`      | Hono API service        |
| `vitepress`   | docs     | `apps/website`     | VitePress docs site     |
| `cli`         | tool     | `apps/cli`         | TypeScript CLI          |

## Discover Templates

```bash
repo templates
repo templates tsdown
repo templates --category library
repo templates --json
repo templates --markdown --out docs/templates.md
```

## Create From A Template

```bash
repo new sdk --template tsdown
repo new ui --template vue-lib
repo new api --template hono-server
repo new website --template vitepress
repo new toolbox --template cli
```

Simple names are placed in the conventional target folder. Library templates go under `packages/`; app templates go under `apps/`. If you pass an explicit path such as `packages/shared-utils`, repoctl respects it.

## Preview Creation

```bash
repo new website --template vitepress --dry-run
repo new website --template vitepress --json
repo new website --template vitepress --json --out plans/website.json
```

`--dry-run` does not write files. It shows the template, source directory, target directory, package name, and output files.

`--json` emits the same plan as structured data and implies `--dry-run`.

`--out <file>` persists the preview and also implies `--dry-run`.

## Check Template Health

```bash
repo templates --check
repo templates --check --json
```

The check validates duplicate sources and targets, existing source directories, package metadata, categories, descriptions, and temporary files that would be filtered by the scaffolder.
