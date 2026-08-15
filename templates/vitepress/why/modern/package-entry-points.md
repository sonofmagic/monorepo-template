# Package Entry Points

Use the `exports` field to define the package's supported public paths.

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./package.json": "./package.json"
  }
}
```

Do not rely on consumers reaching into undeclared internal files. Every exported path should have runtime output, types where applicable, and a compatibility test.
