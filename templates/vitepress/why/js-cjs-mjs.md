# JavaScript Module Extensions

Node.js uses file extensions and the nearest `package.json` `type` field to determine module format.

| Extension       | Meaning                                       |
| --------------- | --------------------------------------------- |
| `.mjs`          | Always ES module                              |
| `.cjs`          | Always CommonJS                               |
| `.js`           | Depends on `package.json` `type`              |
| `.mts` / `.cts` | TypeScript source with explicit module intent |

For published libraries, make the package `exports` map explicit and test both import and require paths when both formats are supported.
