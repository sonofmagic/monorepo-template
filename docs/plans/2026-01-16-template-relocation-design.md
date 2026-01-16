# Template Relocation And Naming

## Context

Templates currently live under `apps/` and `packages/*-template`. We want to move all template sources to a root `templates/` folder, remove the `-template` suffix from directory names, and keep generated projects in the standard `apps/` and `packages/` layout. The new templates should still be part of the workspace for lint/build/test.

## Goals

- Relocate template source directories into a flat `templates/` folder at the repo root.
- Rename template directories to drop the `-template` suffix (for example `vue-lib-template` -> `vue-lib`).
- Keep generated project outputs in `apps/` and `packages/` (not under `templates/`).
- Keep template metadata in one place for `create-icebreaker` and `@icebreakers/monorepo`.
- Include `templates/*` in the workspace (Option A).

## Non-Goals

- Changing template selection keys (for example `vue-lib`, `tsup`, `vitepress`).
- Changing runtime behavior of the templates themselves.

## Proposed Changes

- Move templates from `apps/` and `packages/*-template` into `templates/`.
- Update `pnpm-workspace.yaml` to include `templates/*`.
- Replace template metadata to include both source and target paths.
  - Source path: location inside `templates/`.
  - Target path: location inside generated projects (`apps/` or `packages/`).
- Update `@icebreakers/monorepo-templates` to export the new metadata and copy assets from `templates/`.
- Update `create-icebreaker` to copy from source path to target path.
- Update `@icebreakers/monorepo` `create` command to use source/target paths instead of a single path.
- Update docs and tests that reference the old template paths.

## Data Flow

- `template-data.mjs` exports `{ key, label, source, target }`.
- `@icebreakers/monorepo-templates` exposes the template list and directories.
- `create-icebreaker` copies `templatesDir/<source>` into `<target>` under the new project.
- `@icebreakers/monorepo` copies packaged `templates/<source>` into workspace `<target>`.

## Risks And Mitigations

- Risk: new paths break existing tests and docs.
  - Mitigation: update snapshot tests, docs, and references in one pass.
- Risk: template packages stop participating in lint/build/test.
  - Mitigation: include `templates/*` in `pnpm-workspace.yaml`.

## Testing

- Update snapshots and unit tests referencing template paths.
- Run `pnpm lint` and `pnpm test` after relocation (optional here).
