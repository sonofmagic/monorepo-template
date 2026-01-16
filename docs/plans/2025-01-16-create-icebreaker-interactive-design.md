---
title: Create Icebreaker Interactive Scaffolder
date: 2025-01-16
status: draft
---

# Create Icebreaker Interactive Scaffolder

## Goals

Provide a single, minimal-flow entry point so developers can run `pnpm create icebreaker` and immediately scaffold a trimmed monorepo without cloning, building, or running cleanup/init commands manually. The flow should be interactive by default, ask for a target directory (defaulting to a new folder), and allow selecting which templates to keep. The selection starts with nothing checked so the user makes an explicit choice. The scaffolded repo must not include `packages/monorepo` or `packages/create-icebreaker`, and the root `package.json` name must be rewritten to the chosen project name. The resulting repo should be a ready-to-install workspace with only the requested template folders, while still allowing an empty monorepo if the user selects no templates.

## Non-Goals

Do not change the template repository layout, publishing strategy, or any of the template contents themselves. Do not introduce heavy interactive dependencies or a full TUI; the script should stay lightweight and run on Node 18+. Do not remove existing CLI flags; they continue to work for automation. Do not force a template selection; users can proceed with zero templates. Do not attempt to fully replace the `monorepo` CLI for advanced cleanup or init logic; the new flow handles a limited, targeted cleanup suitable for first-run scaffolding.

## UX & Command Interface

Default behavior is interactive. The CLI will prompt for a project directory, showing a default (e.g. `icebreaker-monorepo`); an empty input accepts the default. Next, the CLI lists templates with index numbers and their labels, and prompts for a comma-separated selection. Input accepts indexes (`1,4,7`) or template keys (`tsup,vue-hono`), with trimming and de-duplication; an empty input keeps zero templates. Existing flags (`--repo`, `--branch`, `--force`, `--no-clean`, `--include-private`, `--agent`) remain, but `--no-clean` becomes a no-op or is deprecated in help text because the new cleanup is handled internally. A new `--templates` flag provides non-interactive selection (`--templates tsup,vue-hono`), and if all required options are present the script should skip prompts.

## Data Flow & Cleanup Rules

The process flow is: parse args → prompt for missing inputs → prepare target dir → shallow clone → remove `.git` → remove unselected templates → remove `packages/monorepo` and `packages/create-icebreaker` → update root `package.json` → print next steps. Template removal uses a fixed map aligned with existing template directories: `unbuild`, `tsup`, `tsdown`, `vue-lib`, `vue-hono`, `hono-server`, `vitepress`, and `cli`. For a zero-template selection, the script can delete empty `apps/` or `packages/` directories if they end up empty, but keeping them is acceptable. The root `package.json` update sets `name` to the chosen project name (derived from directory basename), and removes `@icebreakers/monorepo` from devDependencies plus any `script:*` entries that invoke `monorepo`. Other fields (repository, author) are not modified; this keeps the flow deterministic and avoids requiring Git configuration during bootstrap.

## Error Handling & Messaging

The script should clearly surface errors (e.g., non-empty target dir without `--force`, clone failures, missing git binary), and exit with non-zero status. If template parsing yields unknown keys or indexes, it should warn and ignore those entries rather than failing the whole process. If no templates are selected, it should still succeed and explain that the repo is intentionally empty. After success, it prints standard next steps: `cd`, `pnpm install`, and `pnpm dev` (or template-specific guidance can be added later).

## Testing & Documentation

Add focused tests for argument parsing and template selection behavior in `create-icebreaker` if a test harness is introduced; otherwise keep manual verification steps in docs. Update root README and `packages/create-icebreaker/README.md` to reflect the new interactive flow and simplified bootstrap steps. Document the new `--templates` flag and clarify that `packages/monorepo` and `packages/create-icebreaker` are removed in generated projects.
