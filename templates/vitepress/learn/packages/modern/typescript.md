# TypeScript

TypeScript gives a package one source language for implementation and public types. Build output should remain JavaScript plus declarations so consumers do not need your development compiler configuration.

## Start with a strict package config

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Use a separate configuration only when an output format genuinely needs different compiler behavior. Prefer a bundler configuration for output strategy and keep the TypeScript configuration focused on source checking and declaration generation.

## Build and test from artifacts

```bash
pnpm build
pnpm typecheck
pnpm tsd
```

Run type tests against the generated package contract. A source-only test can pass while the published declaration path or exports map is broken.

## Runtime execution

For local scripts, `tsx` can run TypeScript without creating a development `dist` directory. That is convenient for tooling, but it is not a replacement for building libraries before testing the package that consumers install.

## Keep Reading

- [Type Declarations](./dts.md)
- [Bundlers](./bundlers.md)
- [Publishing A Package](/learn/packages/publish)
