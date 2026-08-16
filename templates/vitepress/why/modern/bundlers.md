# Bundlers

Choose a bundler by the package boundary you need to ship. A library build needs reliable entry points and declarations; a component library also needs framework and CSS handling; an application build needs an optimized browser bundle.

## Current choices

| Tool       | Good fit                                        | Notes                                             |
| ---------- | ----------------------------------------------- | ------------------------------------------------- |
| `tsdown`   | TypeScript libraries and tooling                | Produces modern library output with declarations  |
| `vite`     | Applications and component libraries            | Strong development server and library mode        |
| `rolldown` | Toolchains that need Rollup-compatible behavior | Evaluate ecosystem compatibility before migration |

The repoctl generic library template uses `tsdown`. Vue component libraries continue to use Vite library mode.

## tsdown library configuration

:::code-group

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  target: 'node18',
})
```

:::

## Retired defaults

`tsup` and `unbuild` are not recommended for new repoctl templates. Existing projects can migrate when their build behavior and published artifacts are covered by tests. Do not rewrite a working package merely to follow a tooling trend.

## Keep Reading

- [TypeScript](./typescript.md)
- [Package Entry Points](./package-entry-points.md)
