# Package Entry Points

The `exports` field is the public map of a package. It selects files for ESM, CommonJS, types, and intentional subpath imports while preventing consumers from coupling to internal folders.

## Define one primary entry

```json
{
  "name": "example-package",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

Consumers can now use `import { feature } from 'example-package'` or `require('example-package')` without knowing your output layout.

## Add a deliberate subpath

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./cli": "./dist/cli.js",
    "./package.json": "./package.json"
  }
}
```

Each subpath is a public promise. Add one only when it has a stable purpose, documentation, and tests. Do not expose `./dist/*` as a shortcut around API design.

## Verify consumers

- Test the root import and every documented subpath.
- Verify both ESM and CommonJS branches when both are published.
- Check `npm pack --dry-run` includes every exported file.
- Treat removing or changing a public subpath as a breaking change.

## Keep Reading

- [ESM vs CommonJS](./esm-vs-cjs.md)
- [Type Declarations](./dts.md)
