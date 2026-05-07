# Why Monorepo

This project uses monorepo practices because multiple packages, applications, CLIs, and docs sites usually share the same engineering rules.

The goal is not to make the repository look more complex. The goal is to reduce repeated setup work.

## Problems A Monorepo Solves

### Shared Tooling

In separate repositories, each package tends to maintain its own lint, typecheck, test, release, and commit setup. That makes upgrades slow and inconsistent.

In a pnpm workspace, those rules can be centralized at the root and reused by every package.

### Atomic Cross-Package Changes

When one type change affects a library, an app, and a CLI, a monorepo lets you update, verify, review, and revert that change together.

### Incremental Builds

pnpm handles workspace dependencies. Turborepo coordinates tasks and caching. Together they make it practical to run build, lint, test, and typecheck flows across many packages.

## Where repoctl Fits

repoctl adds the missing workflow layer:

- `repo setup` aligns root scripts and standard files.
- `repo doctor` checks whether the workspace is ready.
- `repo new` creates packages and apps from known templates.
- `repo check` previews and runs local verification.
- `repo upgrade` syncs standard assets as the template evolves.

## Keep Reading

- [repoctl Overview](../repoctl/index.md)
- [Command Reference](../repoctl/commands.md)
- [Templates](../repoctl/templates.md)
