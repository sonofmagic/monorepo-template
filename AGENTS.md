# Repository Guidelines

## Project Structure & Module Organization

This pnpm + Turbo monorepo keeps deployable surfaces under `apps/` (`cli`, `client`, `server`, `website`) and reusable templates under `packages/` (e.g., `monorepo`, `vue-lib-template`). Shared TypeScript and build settings live in root configs such as `turbo.json`, `tsconfig.json`, and `eslint.config.js`. Tests sit alongside their targets in `test/*.test.ts`, and each app owns its public assets (`public/`, `worker/`) to keep deployments self-contained.

## Build, Test, and Development Commands

- `pnpm install` — set up workspaces; ensure Node 20+ as defined in `package.json`.
- `pnpm dev` — run `turbo run dev --parallel` for all apps that expose a `dev` script.
- `pnpm build` — execute `turbo run build` to build every workspace with caching.
- `pnpm test` / `pnpm test:dev` — run Vitest suites once or in watch mode across packages.
- `pnpm lint` — invoke `turbo run lint` to apply ESLint/Stylelint policies repo-wide.
- `pnpm script:sync` & `pnpm script:clean` — use the monorepo helper to align dependency versions or clear generated artifacts.

## Coding Style & Naming Conventions

Follow the root `.editorconfig`: two-space indentation, LF line endings, UTF-8. Prefer TypeScript (`.ts`/`.tsx`) and Vue SFCs; name files with kebab-case (`user-table.vue`) and exported symbols with PascalCase for components or camelCase for utilities. ESLint (`@icebreakers/eslint-config`) and Stylelint enforce formatting; run `pnpm lint` before committing, and rely on Husky + lint-staged to auto-fix staged files via `eslint --fix`.

## Testing Guidelines

Vitest powers unit tests located in `test/*.test.ts`. Mirror existing naming by matching the unit under test (`monorepo` utilities map to `packages/monorepo/test/*.test.ts`). Aim for meaningful assertions rather than snapshot defaults, and add coverage checks with `pnpm test -- --coverage`, which writes reports to `coverage/`. When introducing new public APIs, include integration-style tests in the relevant app workspace.

## Commit & Pull Request Guidelines

Commits must conform to Conventional Commit syntax; recent history uses prefixes like `feat`, `fix`, and `chore`. Example: `feat(server): add auth router`. Use `pnpm commit` (commitlint prompt) or ensure your manual message passes `pnpm commitlint --edit`. Before opening a PR, make sure `pnpm lint` and `pnpm test` succeed, link related issues, and provide screenshots or logs for user-facing changes. Touching publishable packages requires a changeset (`pnpm changeset`) so releases stay traceable.
