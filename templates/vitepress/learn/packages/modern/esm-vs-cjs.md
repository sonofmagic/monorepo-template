# ESM vs CommonJS

Node supports two JavaScript module systems. ESM uses `import` and `export`; CommonJS uses `require` and `module.exports`. A package can support both, but it must state how each consumer reaches the correct file.

## Identify the format

| Signal                          | Meaning             |
| ------------------------------- | ------------------- |
| `.mjs`                          | Always ESM          |
| `.cjs`                          | Always CommonJS     |
| `.js` with `"type": "module"`   | ESM                 |
| `.js` without that package type | CommonJS by default |

Avoid guessing from syntax alone. Node resolves a `.js` file from its extension and the nearest package boundary.

## Publish both formats

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

Use an exports map rather than asking consumers to reach into `dist`. It gives each module system an intentional entry point and prevents accidental private imports becoming a public API.

## Interoperability rules

- Keep the package API identical across formats where possible.
- Test both `import` and `require` from a consumer fixture.
- Do not publish TypeScript source as the runtime entry point.
- Use `.cjs` for CommonJS output when the package itself declares `type: module`.

## Keep Reading

- [Package Entry Points](./package-entry-points.md)
- [Type Declarations](./dts.md)
