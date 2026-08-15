# Managing A Monorepo

repoctl gives a pnpm and Turborepo workspace a predictable operating model without hiding the underlying tools.

## Daily Workflow

```bash
pnpm install
pnpm run repo:doctor
pnpm run repo:new -- sdk
pnpm run repo:check
pnpm build
pnpm test
```

Use root `repo:*` scripts in team documentation, direct `repo` commands in automation, and grouped commands such as `repo ws ls` when maintainers need finer control.

## Command Boundaries

- `doctor` reads repository state and reports drift.
- `check` previews or runs verification.
- `upgrade` synchronizes managed assets while preserving custom files by default.
- `new` creates packages and applications from the shared template registry.

## Configuration

Store team defaults in `repoctl.config.ts`. Explicit CLI options override configuration, which keeps CI reproducible without making local interactive use verbose.

## Dependency and Build Guidance

Keep shared dependency versions aligned through pnpm workspace policy. Let Turborepo model task dependencies and caching. Build publishable packages before testing their delivery artifacts.
