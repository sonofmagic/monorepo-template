# monorepo-template

[![codecov](https://codecov.io/gh/sonofmagic/monorepo-template/branch/main/graph/badge.svg?token=mWA3D53rSl)](https://codecov.io/gh/sonofmagic/monorepo-template)

English | [中文版本](README.zh-CN.md)

> A modern pnpm + Turbo Repo + Changesets starter that helps you bootstrap production-ready monorepos quickly.

## Overview

monorepo-template is a production-oriented pnpm + Turbo monorepo template. It ships with unified build, test, release, linting, and commit conventions, making it ideal for teams maintaining multiple deployable apps alongside reusable packages.

## Key Features

- **Modular Architecture**: Template sources live under `templates/` while reusable tooling lives in `packages/`, keeping responsibilities clear.
- **Centralized Scaffolding Assets**: `@icebreakers/monorepo-templates` packages templates and assets for both `monorepo` and `create-icebreaker`.
- **Unified Toolchain**: pnpm workspaces, Turbo task pipelines, Vitest, and Changesets streamline the entire lifecycle from development to release.
- **Engineering Standards**: ESLint, Stylelint, Husky, and Commitlint keep code quality high and commit messages consistent.
- **Extensible Template**: Helper scripts (`script:init`, `script:sync`, `script:clean`, etc.) from `repoctl` keep dependencies and scaffolding aligned. `repo` is available as a short alias, while `rc` and `@icebreakers/monorepo` remain compatibility entrypoints.
- **CI/CD Ready**: Sample GitHub Actions configuration, Codecov integration, and `secrets.NPM_TOKEN` support automated publishing and coverage reporting.

## Quick Start

1. **Prepare environment**: Ensure Node.js >= 20 and run `corepack enable` so pnpm is available.
2. **Install dependencies**: Run `pnpm install` to fetch every workspace dependency.
3. **Bootstrap repo defaults**: Run `pnpm setup` to apply the recommended workspace metadata and tooling setup.
4. **Create the next package or app**: Run `pnpm new my-package` for the guided flow.
5. **Local development**: Use `pnpm dev` to launch Turbo parallel dev scripts and iterate within each app.
6. **Build and verify**: Run `pnpm check`, `pnpm build`, `pnpm test`, and `pnpm lint`.
7. **Template cleanup (optional)**: Use `pnpm clean:repo` to prune sample packages when personalising the template.

### Bootstrap shortcuts

- Guided repo setup:
  - `pnpm setup`
  - `pnpm new my-package`
  - `pnpm check`
- Direct CLI equivalents:
  - `pnpm exec repoctl setup`
  - `pnpm exec repoctl new my-package`
  - `pnpm exec repoctl check`
- Zero-install cleanup on a fresh clone: `pnpm dlx repoctl@latest clean --yes` (add `--include-private` to keep private packages in scope).
  Short alias: `pnpm dlx repo@latest clean --yes`. `rc` is intentionally not the primary recommendation because short global commands are easier to collide with other CLIs.
- One-liner scaffold: `pnpm create icebreaker` or `npm create icebreaker@latest` enters interactive mode, asks for the target directory, and lets you select which templates to keep. Use `--templates tsdown,vue-hono` or `--templates 1,3` to preselect.

## Repository Layout

```text
templates/
  cli/          # CLI application scaffold
  client/       # Web client (e.g., Vue/React)
  server/       # Server or API layer
  vitepress/    # Static site or documentation portal
  tsdown/       # Library template powered by tsdown
  vue-lib/      # Vue component library template
packages/
  monorepo/           # @icebreakers/monorepo compatibility package
  repoctl/            # preferred repo toolchain entrypoint
  create-icebreaker/  # npm create flow
  monorepo-templates/ # template and asset bundle for npm
```

- `templates/cli`: Sample CLI app scaffold.
- `templates/client`: Sample rich web client application.
- `templates/server`: Entry point for server or API services.
- `templates/vitepress`: Static marketing or documentation site starter.
- `templates/tsdown`: Library template powered by tsdown.
- `templates/vue-lib`: Vue component library template.
- `packages/*`: Reusable packages and scaffolding shared across apps.
- Root configuration files (`turbo.json`, `tsconfig.json`, `eslint.config.js`, etc.) enforce consistent settings across the monorepo.

## Common Scripts

| Command                       | Description                                                          |
| ----------------------------- | -------------------------------------------------------------------- |
| `pnpm install`                | Install workspace dependencies.                                      |
| `pnpm dev`                    | Run every workspace exposing a `dev` script in parallel.             |
| `pnpm build`                  | Execute a repository-wide build through Turbo.                       |
| `pnpm test` / `pnpm test:dev` | Run Vitest once or in watch mode.                                    |
| `pnpm lint`                   | Apply ESLint and Stylelint checks across the monorepo.               |
| `pnpm changeset`              | Create an interactive Changeset for version bumps.                   |
| `pnpm publish-packages`       | Build, lint, test, then version and publish changed packages.        |
| `pnpm setup`                  | Bootstrap recommended workspace metadata and tooling.                |
| `pnpm new <name>`             | Create a new package or app with the guided flow.                    |
| `pnpm check`                  | Run recommended local verification.                                  |
| `pnpm exec repoctl setup`     | Direct CLI equivalent of `pnpm setup`.                               |
| `pnpm exec repoctl new`       | CLI entrypoint for package/app creation.                             |
| `pnpm exec repoctl check`     | CLI entrypoint for local verification.                               |
| `pnpm script:init`            | Initialise template settings via the `repoctl` compatibility script. |
| `pnpm script:sync`            | Synchronise repo assets and helper scripts via `repoctl`.            |
| `pnpm script:clean`           | Remove sample packages and generated artifacts.                      |
| `pnpm script:mirror`          | Apply the VS Code binary mirror compatibility shortcut.              |

## Template Workflow

- Use `pnpm create icebreaker` to scaffold a trimmed workspace in a new directory.
- In an existing workspace, use `pnpm setup`, `pnpm new`, and `pnpm check` as the default maintenance path.
- Install dependencies and start development with `pnpm install` and `pnpm dev`.
- Add or remove apps/packages as your workspace evolves.

## Release & Versioning

Leverage Changesets plus GitHub Actions for automated versioning:

1. Capture changes with `pnpm changeset`, marking each update as patch, minor, or major.
2. After merging, run `pnpm publish-packages` locally or let CI publish from the `main` branch.
3. Configure `secrets.NPM_TOKEN` in GitHub to allow npm publishing.

## Quality Assurance

- **Code style**: `.editorconfig` enforces two-space indentation and LF line endings, while ESLint and Stylelint maintain consistency across packages.
- **Commit hooks**: Husky and lint-staged run staged-file ESLint/Stylelint autofixes before commits.
- **Testing & coverage**: Run `pnpm test -- --coverage` to export coverage reports into the `coverage/` directory.
- **Staying current**: Use `npx repoctl@latest` to upgrade this template when new features ship. If you prefer a shorter command, `npx repo@latest` is also supported.

## More Resources

- Documentation: https://monorepo.icebreaker.top/
- Contributing guide: See `CONTRIBUTING.md` for workflow details.
- Code of Conduct: Review `CODE_OF_CONDUCT.md` to understand community expectations.
- Security policy: Follow `SECURITY.md` to report security issues.
- License: Refer to `LICENSE` for the full open-source license text.
