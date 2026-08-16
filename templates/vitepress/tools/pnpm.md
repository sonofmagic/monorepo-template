# pnpm

pnpm is the package manager used by repoctl workspaces. Its workspace protocol, content-addressable store, and filter syntax make it a practical fit for repositories with several packages and applications.

## Install dependencies

```bash
pnpm install
pnpm install --frozen-lockfile
```

Use the frozen form in CI. It proves that `package.json` files and the lockfile describe the same dependency graph.

## Work with one workspace

```bash
pnpm --filter repoctl build
pnpm --filter @icebreakers/monorepo test
pnpm --filter './packages/*' lint
```

Filters are a routing tool, not a replacement for repository scripts. Prefer an existing package script over an ad hoc command when a task should be repeatable.

## Link local packages

```json
{
  "dependencies": {
    "@icebreakers/monorepo": "workspace:*"
  }
}
```

The `workspace:` protocol prevents accidentally resolving a local package from the public registry during development.

## Operational guidance

- Pin the package manager in the root `package.json`.
- Commit `pnpm-lock.yaml` for applications and monorepos.
- Use `pnpm exec` for binaries supplied by the current workspace.
- Use `pnpm --filter` for a scoped package command and Turbo for graph-wide task orchestration.

## Keep Reading

- [Turborepo](./turborepo.md)
- [Managing A Monorepo](../monorepo/manage.md)
- [repoctl Commands](../repoctl/commands.md)
