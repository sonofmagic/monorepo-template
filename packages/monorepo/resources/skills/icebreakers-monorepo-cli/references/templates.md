# Templates

Prefer `repoctl new [name]` for the guided flow. It first asks what you want to
create, then maps that intent to a template and default target directory.

Intent defaults:

- library -> `tsdown` -> `packages/<name>`
- web-app -> `vue-hono` -> `apps/<name>`
- api-service -> `hono-server` -> `apps/<name>`
- docs-site -> `vitepress` -> `apps/<name>`
- cli-tool -> `cli` -> `apps/<name>`

Advanced users can still use `repoctl package create [path]` or `repoctl pkg new [path]`
to select templates directly.

Built-in template map:

- tsdown -> templates/tsdown => packages/tsdown
- vue-lib -> templates/vue-lib => packages/vue-lib
- hono-server -> templates/server => apps/server
- vue-hono -> templates/client => apps/client
- vitepress -> templates/vitepress => apps/website
- cli -> templates/cli => apps/cli

Notes:

- The command prompts for template selection unless defaults are set in
  repoctl.config.ts or monorepo.config.ts.
- Override mappings with `commands.create.templateMap` and `commands.create.templatesDir`.
