# Type Declarations

Type declarations describe the public TypeScript contract of a JavaScript package. They must be generated from the same source and exported through the same public entry points as the runtime code.

## Emit declarations

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "./dist"
  }
}
```

Bundlers such as tsdown can emit declaration files alongside runtime output. The important rule is that declaration paths are stable and match the package exports map.

## Link types to exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

The top-level `types` field is useful for simple packages. Per-entry `types` declarations are necessary when a package exposes subpaths or format-specific output.

## Test the public contract

```bash
pnpm tsd
pnpm pack --dry-run
```

Type tests should import from the package name, not a source file. That proves the declarations consumers receive are compatible with the documented API.

## Keep Reading

- [Package Entry Points](./package-entry-points.md)
- [TypeScript](./typescript.md)
