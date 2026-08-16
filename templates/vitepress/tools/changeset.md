# pnpm Versioning

repoctl uses pnpm's native versioning workflow. A change intent records why a publishable package needs a release, and the repository ledger keeps that intent with the source change.

## Record release intent

```bash
pnpm change
pnpm version -r
pnpm publish -r
```

Choose the smallest version bump that matches the public contract. Removing a managed asset from a published template package is a minor change because consumers no longer receive that asset. Metadata-only URL changes are patch changes.

## Fixed packages

Some packages version together because they share a public contract. The versioning configuration defines those groups; do not manually align versions in package manifests.

## Before publishing

1. Build the affected packages.
2. Run lint and typecheck.
3. Run unit, integration, and end-to-end tests where available.
4. Confirm the generated changelog and package contents match the intent.

## Keep Reading

- [Publishing and Changelogs](../monorepo/publish.md)
- [Workflows and CI](../repoctl/workflows.md)
- [Template Assets](../repoctl/template-assets.md)
