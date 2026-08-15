# pnpm Versioning

This repository uses pnpm change intents and workspace versioning for releases.

## Daily Development

```bash
pnpm change
pnpm change status
```

Choose every publishable package whose public behavior changed and record the correct patch, minor, or major level. Private template workspaces are not release units.

## Release

```bash
repo release stable prepare
repo release stable publish
```

repoctl coordinates the release workflow, validates configuration, and publishes metadata. pnpm owns the versioning state and repository changelog storage.

## Prerelease Lanes

Use `repo release pre enter <tag>`, `repo release pre publish`, and `repo release pre exit` for alpha, beta, rc, or next lanes.
