# Turborepo

Turborepo turns package scripts into a dependency-aware task graph. repoctl workspaces use it for the repository-wide work that should be cached and run in dependency order.

## Define task boundaries

```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["build"], "outputs": ["coverage/**"] },
    "typecheck": { "dependsOn": ["^typecheck"], "outputs": [] }
  }
}
```

`^build` means that a package must build its workspace dependencies before its own build starts. Declare outputs accurately so the cache can restore useful artifacts and ignore transient files.

## Run graph-aware tasks

```bash
pnpm turbo run build
pnpm turbo run test --filter=repoctl
pnpm turbo run lint typecheck
```

Use root scripts for the common entrypoints. The root script is the stable command people and CI should remember; Turbo remains the graph executor beneath it.

## Cache with care

- Include configuration files that materially affect output in task inputs.
- Keep secrets out of cached output.
- Set `outputs: []` for validation-only tasks.
- Use `--force` only when diagnosing cache behavior.

## Keep Reading

- [pnpm](./pnpm.md)
- [Verification](../repoctl/checks.md)
- [Managing A Monorepo](../monorepo/manage.md)
