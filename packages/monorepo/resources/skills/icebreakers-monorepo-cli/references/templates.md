# Templates

`monorepo new [path]` copies a template into the target path. If you want an app
under `apps/`, pass the path explicitly, e.g. `apps/my-app`.

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
