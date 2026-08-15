# ESM and CommonJS Runtime Globals

CommonJS provides `require`, `module`, `exports`, `__filename`, and `__dirname`. ES modules use `import`, `export`, `import.meta.url`, and `createRequire` when interoperability is required.

Avoid assuming CommonJS globals exist inside ESM. Resolve file paths with `fileURLToPath(import.meta.url)` and prefer static imports so bundlers and type checkers can understand dependencies.

See [ESM vs CommonJS](./modern/esm-vs-cjs.md) for package-level guidance.
