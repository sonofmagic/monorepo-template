# Modern Package Guide

A publishable package is more than a source folder. Consumers depend on its runtime format, type declarations, entry points, files list, and compatibility policy. This guide explains the decisions that keep those contracts explicit.

## Start with the consumer

Before choosing a bundler or module format, answer these questions:

- Will consumers load the package through ESM, CommonJS, or both?
- Does the package ship runtime code, types, a CLI, or generated assets?
- Which Node versions must work?
- Should consumers import one public entry point or several intentional subpaths?

The answers define the package boundary. Tooling should implement that boundary, not invent it.

## Recommended shape

```text
src/          source code
dist/         generated ESM, CommonJS, and declaration files
package.json  public metadata and exports map
README.md     installation and usage contract
```

Use `files` to publish only the built output and deliberately included documentation. Run `npm pack --dry-run` before publishing to inspect the actual package tarball.

## Topics

- [ESM vs CommonJS](./esm-vs-cjs.md)
- [Type Declarations](./dts.md)
- [Package Entry Points](./package-entry-points.md)
- [Bundlers](./bundlers.md)
- [TypeScript](./typescript.md)

## Keep Reading

- [What Is An npm Package?](../what-is-npm-package.md)
- [Publishing A Package](../publish-basic-npm-package.md)
