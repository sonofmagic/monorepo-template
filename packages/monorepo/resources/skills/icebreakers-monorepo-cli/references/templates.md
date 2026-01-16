# Templates

`monorepo new [path]` copies a template into the target path. If you want an app
under `apps/`, pass the path explicitly, e.g. `apps/my-app`.

Built-in template map:

- tsup -> packages/tsup-template
- tsdown -> packages/tsdown-template
- unbuild -> packages/unbuild-template
- vue-lib -> packages/vue-lib-template
- hono-server -> apps/server
- vue-hono -> apps/client
- vitepress -> apps/website
- cli -> apps/cli

Notes:

- The command prompts for template selection unless defaults are set in
  monorepo.config.ts.
- Override mappings with `commands.create.templateMap` and `commands.create.templatesDir`.
