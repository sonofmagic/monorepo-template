# Modern Package Guide

Modern packages should expose a small, explicit API and generate artifacts that match their declared contract.

## Checklist

- Choose ESM-only or intentional dual-package support.
- Declare every public subpath in `exports`.
- Emit and test type declarations.
- Keep development-only files out of the package tarball.
- Validate the supported Node and bundler matrix.
- Record public changes through repository versioning.

Start with [ESM vs CommonJS](./esm-vs-cjs.md), then review [entry points](./package-entry-points.md) and [declarations](./dts.md).
