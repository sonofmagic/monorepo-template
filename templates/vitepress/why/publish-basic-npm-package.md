# Publishing A Package

Publishing is the point where the repository's package contract becomes public. Build first, test the built artifacts, inspect the tarball, and publish only after the version intent and changelog describe the consumer-visible change.

## Prepare the package

```bash
pnpm --filter example-package build
pnpm --filter example-package typecheck
pnpm --filter example-package test
pnpm --filter example-package tsd
pnpm --filter example-package pack --pack-destination ../../artifacts
```

Run the package commands against generated output where possible. A source-only test does not prove that `exports`, files, or declarations will resolve after installation.

## Verify package metadata

```json
{
  "name": "example-package",
  "version": "1.0.0",
  "files": ["dist", "README.md", "LICENSE"],
  "publishConfig": { "access": "public" }
}
```

Use `npm pack --dry-run` to see what users receive. Confirm the runtime entry point, declaration files, README, and license are present.

## Release through the repository workflow

```bash
pnpm change
pnpm version -r
pnpm publish -r
```

The version ledger preserves why the release exists. Do not manually edit a package version to bypass fixed-group or changelog rules.

## Keep Reading

- [pnpm Versioning](../tools/changeset.md)
- [Modern Package Guide](./modern/)
