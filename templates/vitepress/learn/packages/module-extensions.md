# JavaScript, CommonJS, and ESM Files

File extensions tell Node which module loader should read a file. Use them deliberately when a package publishes both module formats or when a script must work independently of the nearest `package.json`.

## Extension rules

| Extension | Module format                                         |
| --------- | ----------------------------------------------------- |
| `.mjs`    | ESM in every package                                  |
| `.cjs`    | CommonJS in every package                             |
| `.js`     | Determined by the nearest `package.json` `type` field |

```json
{
  "type": "module"
}
```

With this declaration, `.js` files are ESM. Use `.cjs` for CommonJS output such as a compatibility build or an older tooling configuration file.

## Avoid ambiguous output

```text
dist/index.js     ESM output
dist/index.cjs    CommonJS output
dist/index.d.ts   Type declarations
```

Connect these files through `exports`; do not ask consumers to infer a `dist` layout. A clear output layout also makes package tarball checks easier.

## Keep Reading

- [ESM vs CommonJS](./modern/esm-vs-cjs.md)
- [Package Entry Points](./modern/package-entry-points.md)
