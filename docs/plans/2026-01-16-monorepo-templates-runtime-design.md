# Monorepo Templates Runtime Dependency Design

## Context

The monorepo CLI currently ships its own `assets/` and `templates/` inside `packages/monorepo`. We want `@icebreakers/monorepo` to depend entirely on `@icebreakers/monorepo-templates` at runtime so there is a single source of truth for skeletons, assets, and project templates.

## Goals

- Make `@icebreakers/monorepo` read `skeleton/`, `templates/`, and `assets/` exclusively from `@icebreakers/monorepo-templates`.
- Remove runtime fallback to `packages/monorepo/assets` and `packages/monorepo/templates`.
- Keep the root `templates/` directory as the editable source during development, synced into `monorepo-templates` for publishing.

## Non-Goals

- Changing template content or naming beyond required path adjustments.
- Introducing offline bundling or embed assets within `@icebreakers/monorepo`.

## Approach

1. Expand `@icebreakers/monorepo-templates` to include `assets/` and export `assetsDir` alongside `templatesDir` and `skeletonDir`.
2. Update `packages/monorepo` to import directory constants from `@icebreakers/monorepo-templates` and remove local path derivations.
3. Remove or simplify `packages/monorepo/scripts/prepublish.ts` so it no longer syncs assets/templates into the monorepo package.
4. Treat missing `@icebreakers/monorepo-templates` or missing assets as a hard failure with a clear error.

## Components & Data Flow

- `monorepo-templates/scripts/sync-assets.mjs` copies root `templates/`, root skeleton files, and root asset files into the package for publish.
- `@icebreakers/monorepo` uses `assetsDir`/`templatesDir` from the dependency to serve `create`, `upgrade`, and `clean`.
- `create-icebreaker` continues to source templates and skeletons from `@icebreakers/monorepo-templates`.

## Error Handling

- If `@icebreakers/monorepo-templates` is not installed or the directories are missing, CLI commands should fail with a clear message instructing the user to install the dependency.

## Testing

- Update tests that assert template/asset paths to point at `@icebreakers/monorepo-templates`.
- Add a test case that fails when `@icebreakers/monorepo-templates` is absent, with an explicit error message.
- Validate `sync-assets` output includes `assets/`, `skeleton/`, and `templates/`.

## Rollout

- Publish `@icebreakers/monorepo-templates` with assets included.
- Release `@icebreakers/monorepo` after template package is available.
