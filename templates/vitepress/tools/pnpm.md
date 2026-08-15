# pnpm

pnpm owns workspace discovery, dependency installation, script execution, and versioning configuration.

```bash
pnpm install
pnpm --filter <package> build
pnpm -r test
pnpm change
pnpm change status
```

`pnpm-workspace.yaml` is the source of truth for package patterns and release groups. repoctl can diagnose missing patterns and synchronize recommended defaults, but pnpm remains the package manager.

Prefer exact workspace filters in automation and keep `packageManager` plus `engines.node` declared at the repository root.
