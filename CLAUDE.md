# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a pnpm + Turbo monorepo template designed for production-ready projects. Template sources live under `templates/` while reusable tooling lives under `packages/`.

### Architecture

- **`templates/`** - Template sources:
  - `cli/` - CLI application scaffold
  - `client/` - Vue.js web client with Cloudflare integration
  - `server/` - Server/API layer (tsup-based)
  - `vitepress/` - VitePress documentation site
  - `tsdown/` - TypeScript library build template
  - `vue-lib/` - Vue component library template

- **`packages/`** - Reusable tooling:
  - `monorepo/` - @icebreakers/monorepo helper scripts and CLI
  - `create-icebreaker/` - npm create scaffolding tool
  - `monorepo-templates/` - template asset bundle for npm

### Build System

- **Package Manager**: pnpm (enforced by preinstall hook, requires pnpm@10.26.1)
- **Task Orchestration**: Turbo with caching and parallel execution
- **Node Version**: >= 20.0.0

## Development Commands

### Core Commands

| Command          | Description                                       |
| ---------------- | ------------------------------------------------- |
| `pnpm install`   | Install all workspace dependencies                |
| `pnpm dev`       | Run all apps in parallel (Turbo `dev --parallel`) |
| `pnpm build`     | Build all workspaces with Turbo caching           |
| `pnpm test`      | Run Vitest tests once                             |
| `pnpm test:dev`  | Run Vitest in watch mode                          |
| `pnpm lint`      | Run ESLint and Stylelint across all workspaces    |
| `pnpm typecheck` | Run TypeScript type checking                      |
| `pnpm format`    | Auto-fix code with ESLint                         |
| `pnpm validate`  | Run typecheck + lint + test (full validation)     |

### Release & Publishing

| Command                 | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `pnpm changeset`        | Create an interactive changeset for version bumps        |
| `pnpm publish-packages` | Build, lint, test, version, and publish changed packages |

### Monorepo Helper Scripts

| Command              | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `pnpm script:init`   | Initialize template settings                                 |
| `pnpm script:sync`   | Synchronize dependency and script versions across workspaces |
| `pnpm script:clean`  | Remove sample packages and generated artifacts               |
| `pnpm script:mirror` | Mirror configurations across workspaces                      |

### Git & Committing

| Command                  | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| `pnpm commit`            | Interactive commit prompt (enforces Conventional Commits) |
| `pnpm commitlint --edit` | Validate commit message (runs as hook)                    |

## Code Organization

### Test Location

Tests are colocated with their targets in `test/*.test.ts` directories within each workspace. This mirrors the monorepo convention that keeps unit tests adjacent to the code they test.

### Public Assets

Each app manages its own public assets (e.g., `public/`, `worker/`) to keep deployments self-contained.

### Workspace Dependencies

Workspaces use `workspace:*` protocol for internal dependencies. Root `package.json` contains shared devDependencies that are inherited by workspaces.

## Coding Conventions

- **File Naming**: kebab-case for files (e.g., `user-table.vue`, `api-client.ts`)
- **Export Naming**: PascalCase for components, camelCase for utilities
- **Indentation**: 2 spaces (enforced by `.editorconfig`)
- **Line Endings**: LF (enforced by `.editorconfig`)
- **Language**: TypeScript (`.ts`/`.tsx`) and Vue SFCs preferred

## Quality & Standards

- **ESLint**: `@icebreakers/eslint-config` - all changed JavaScript, TypeScript, and Vue code must pass ESLint before commit
- **Stylelint**: `@icebreakers/stylelint-config` for CSS/SCSS and Vue style blocks; all style-related changes must pass Stylelint before commit
- **Testing**: Vitest with v8 coverage (reports to `coverage/`)
- **Commits**: Conventional Commits required (enforced by commitlint + Husky)
- **Pre-commit Hooks**: Husky + lint-staged run staged-file ESLint/Stylelint checks and workspace typechecks
- **Type Checking**: TypeScript workspaces must pass `tsc` via their `typecheck` script; Vue workspaces must pass `vue-tsc` via their `typecheck` script
- **Pre-push Hooks**: pushes must pass repository-wide `pnpm lint` and `pnpm typecheck`, with additional `build` / `test` / `tsd` runs based on changed files

## Refactoring Expectations

- Treat any code file above roughly 300 lines as a refactor signal.
- Do not keep extending already-large files when responsibilities can be split cleanly.
- Prefer folder-based decomposition over suffix-only sibling files such as `xxx.config.ts` or `xxx.filter.ts`.
- Before commit, review touched large files and split or restructure them when the new change would otherwise make them harder to maintain.

## Publishing Workflow

This monorepo uses Changesets for version management:

1. Make changes to packages
2. Run `pnpm changeset` to describe changes (patch/minor/major)
3. After merging, run `pnpm publish-packages` locally or let CI publish from `main`
4. Ensure `secrets.NPM_TOKEN` is configured in GitHub for automated publishing

When modifying publishable packages, always create a changeset so releases stay traceable.

## Template Customization

When adapting this template for a new project:

- Remove unused apps/packages with `pnpm script:clean`
- Duplicate existing templates to create new modules quickly
- Run `pnpm script:init` to align workspace configuration
- Keep versions synchronized with `pnpm script:sync`
- Update `package.json` name, repository, bugs URLs
