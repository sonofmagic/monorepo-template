# JavaScript Runtime Keywords

Modern JavaScript modules have different runtime globals depending on whether Node loads them as CommonJS or ESM. Know the boundary before copying code between build tools, scripts, and package entry points.

## CommonJS values

```js
console.log(__filename)
console.log(__dirname)
console.log(require.main)
```

These values are available in CommonJS modules. They are not automatically present in ESM files.

## ESM equivalents

```js
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
```

Use `import.meta.url` as the starting point for resolving files relative to an ESM module. Prefer explicit Node built-in imports such as `node:path` so bundlers and readers can identify runtime-only dependencies.

## Keep code portable

- Keep filesystem access behind a small module when browser builds share source code.
- Do not use CommonJS globals in a package that declares `type: module`.
- Test generated ESM and CommonJS outputs independently when both are published.

## Keep Reading

- [JavaScript, CommonJS, and ESM Files](./js-cjs-mjs.md)
- [Reusing JavaScript](./how-to-reuse-js-code.md)
