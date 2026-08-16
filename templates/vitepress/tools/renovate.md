# Renovate

Renovate keeps dependencies current through reviewable pull requests. It is most useful when the configuration groups compatible updates, lets CI prove the upgrade, and avoids mixing unrelated ecosystem changes.

## Repository policy

```json
{
  "extends": ["config:recommended", "group:allNonMajor"],
  "rangeStrategy": "bump",
  "automerge": true,
  "automergeType": "pr"
}
```

The repository groups compatible minor and patch updates. Cloudflare Workers tooling is grouped separately because Wrangler and its Vite plugin have a deliberate compatibility relationship.

## Review an update

1. Read the package release notes when the update changes build, test, or deployment tooling.
2. Run the normal build and validation sequence against the updated lockfile.
3. Check generated assets and package metadata for unexpected churn.
4. Merge only after the configured checks prove the update is compatible.

Do not rely on commit-message directives for a retired deployment provider. Deployment behavior belongs in the active platform configuration and CI settings.

## Keep Reading

- [pnpm](./pnpm.md)
- [Workflows and CI](../repoctl/workflows.md)
- [Troubleshooting](../repoctl/troubleshooting.md)
