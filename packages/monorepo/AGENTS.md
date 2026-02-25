# Package Guidelines (`@icebreakers/monorepo`)

This file adds package-local guidance. Global rules are defined in the repository root `AGENTS.md` and still apply.

## Scope

- Package path: `packages/monorepo`
- Purpose: monorepo CLI implementation (`monorepo up`, `create`, `sync`, `clean`, `skills`, `ai`)

## Structure

- `src/commands/`: command implementations
- `src/core/`: config, git, workspace, logging abstractions
- `src/utils/`: shared utilities used by commands/core
- `test/`: unit and coverage-oriented command tests
- `resources/skills/`: packaged skill resources shipped with the CLI

## Local Rules

- Keep command flow in `src/commands/*` thin; move reusable logic to `src/core/*` or `src/utils/*`.
- When a command grows beyond manageable size, split by feature folder rather than suffix-only files.
- Prefer deterministic file update logic (merge-or-overwrite strategy) and cover it with tests.

## Validation

- `pnpm --filter @icebreakers/monorepo build`
- `pnpm --filter @icebreakers/monorepo lint`
- `pnpm --filter @icebreakers/monorepo typecheck`
- `pnpm --filter @icebreakers/monorepo test`
