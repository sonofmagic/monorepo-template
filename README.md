# monorepo-template

[![codecov](https://codecov.io/gh/sonofmagic/monorepo-template/branch/main/graph/badge.svg?token=mWA3D53rSl)](https://codecov.io/gh/sonofmagic/monorepo-template)

English | [中文版本](README.zh-CN.md)

> A modern pnpm + Turbo Repo + Changesets starter that helps you bootstrap production-ready monorepos quickly.

## Overview

monorepo-template is a production-oriented pnpm + Turbo monorepo template. It ships with unified build, test, release, linting, and commit conventions, making it ideal for teams maintaining multiple deployable apps alongside reusable packages.

## Key Features

- **Modular Architecture**: All deployable surfaces live under `apps/` while reusable templates reside in `packages/`, keeping responsibilities clear.
- **Unified Toolchain**: pnpm workspaces, Turbo task pipelines, Vitest, and Changesets streamline the entire lifecycle from development to release.
- **Engineering Standards**: ESLint, Stylelint, Husky, and Commitlint keep code quality high and commit messages consistent.
- **Extensible Template**: Helper scripts (`script:init`, `script:sync`, `script:clean`, etc.) from `@icebreakers/monorepo` keep dependencies and scaffolding aligned.
- **CI/CD Ready**: Sample GitHub Actions configuration, Codecov integration, and `secrets.NPM_TOKEN` support automated publishing and coverage reporting.

## Quick Start

1. **Prepare environment**: Ensure Node.js >= 20 and run `corepack enable` so pnpm is available.
2. **Install dependencies**: Run `pnpm install` to fetch every workspace dependency.
3. **Local development**: Use `pnpm dev` to launch Turbo parallel dev scripts and iterate within each app.
4. **Build and verify**: Run `pnpm build`, `pnpm test`, and `pnpm lint` to validate builds, tests, and linting.
5. **Template cleanup (optional)**: Use `pnpm script:clean` to prune sample packages when personalising the template.

## Repository Layout

```text
apps/
  cli/          # CLI application scaffold
  client/       # Web client (e.g., Vue/React)
  server/       # Server or API layer
  website/      # Static site or documentation portal
packages/
  monorepo/           # @icebreakers/monorepo helper scripts
  tsup-template/      # Library template powered by tsup
  unbuild-template/   # Library template powered by unbuild
  vue-lib-template/   # Vue component library template
```

- `apps/cli`: Sample CLI app scaffold.
- `apps/client`: Sample rich web client application.
- `apps/server`: Entry point for server or API services.
- `apps/website`: Static marketing or documentation site starter.
- `packages/*`: Reusable packages and scaffolding shared across apps.
- Root configuration files (`turbo.json`, `tsconfig.json`, `eslint.config.js`, etc.) enforce consistent settings across the monorepo.

## Common Scripts

| Command                       | Description                                                   |
| ----------------------------- | ------------------------------------------------------------- |
| `pnpm install`                | Install workspace dependencies.                               |
| `pnpm dev`                    | Run every workspace exposing a `dev` script in parallel.      |
| `pnpm build`                  | Execute a repository-wide build through Turbo.                |
| `pnpm test` / `pnpm test:dev` | Run Vitest once or in watch mode.                             |
| `pnpm lint`                   | Apply ESLint and Stylelint checks across the monorepo.        |
| `pnpm changeset`              | Create an interactive Changeset for version bumps.            |
| `pnpm publish-packages`       | Build, lint, test, then version and publish changed packages. |
| `pnpm script:init`            | Initialise template settings via `@icebreakers/monorepo`.     |
| `pnpm script:sync`            | Synchronise dependency and script versions.                   |
| `pnpm script:clean`           | Remove sample packages and generated artifacts.               |

## Template Workflow

- Click “Use this template” on GitHub, or clone the repository and update the remote origin.
- Install dependencies and run `pnpm script:init` to align workspace configuration.
- Remove unused apps/packages or duplicate existing templates to spin up new modules quickly.
- Keep versions aligned via `pnpm script:sync`.

## Release & Versioning

Leverage Changesets plus GitHub Actions for automated versioning:

1. Capture changes with `pnpm changeset`, marking each update as patch, minor, or major.
2. After merging, run `pnpm publish-packages` locally or let CI publish from the `main` branch.
3. Configure `secrets.NPM_TOKEN` in GitHub to allow npm publishing.

## Quality Assurance

- **Code style**: `.editorconfig` enforces two-space indentation and LF line endings, while ESLint and Stylelint maintain consistency across packages.
- **Commit hooks**: Husky and lint-staged run `eslint --fix`, `vitest`, and other checks before commits.
- **Testing & coverage**: Run `pnpm test -- --coverage` to export coverage reports into the `coverage/` directory.
- **Staying current**: Use `npx @icebreakers/monorepo@latest` to upgrade this template when new features ship.

## More Resources

- Documentation: https://monorepo.icebreaker.top/
- Contributing guide: See `CONTRIBUTING.md` for workflow details.
- Code of Conduct: Review `CODE_OF_CONDUCT.md` to understand community expectations.
- Security policy: Follow `SECURITY.md` to report security issues.
- License: Refer to `LICENSE` for the full open-source license text.
