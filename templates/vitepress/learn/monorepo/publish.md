# Publishing and Changelogs

repoctl coordinates release tasks with pnpm versioning. It does not replace the registry, GitHub Actions, or package build scripts.

## Development Flow

```bash
pnpm change
pnpm change status
repo release stable prepare
repo release stable publish
```

Change intents record the affected package and release level. The release preparation step updates versions and repository changelogs; publish sends built packages to the configured registry.

## Versioning Configuration

Fixed groups and repository changelog storage live in `pnpm-workspace.yaml`. `repo doctor` reports missing or legacy release configuration.

## Prerelease Lanes

```bash
repo release pre enter beta
repo release pre publish
repo release pre exit
```

Supported lane names include `alpha`, `beta`, `rc`, and `next`.

## Recovery

Use the publish-unpublished release mode to recover versions that were prepared but not published. Inspect the generated report before retrying a partial release.
