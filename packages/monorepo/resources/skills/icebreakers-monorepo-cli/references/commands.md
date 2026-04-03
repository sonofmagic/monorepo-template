# Commands

## workspace upgrade (alias: ws up)

Purpose: sync monorepo assets and scripts into the workspace.
Usage:

- npx repoctl workspace upgrade
- npx repoctl ws up
  Options:
- --interactive: prompt for overwrites
- --core: sync core config only (skip GitHub assets)
- --outDir <dir>: write to another directory
- --skip-overwrite: never overwrite existing files

## workspace init (alias: ws init)

Purpose: initialize workspace metadata such as README, package.json, changeset, and issue template.
Usage:

- npx repoctl workspace init
- npx repoctl ws init

## tooling init (alias: tg init)

Purpose: generate tooling config files plus matching devDependencies.
Usage:

- npx repoctl tooling init
- npx repoctl tooling init eslint tsconfig vitest
- npx repoctl tg init --all
  Options:
- --all: generate every built-in tooling config
- --force: overwrite existing tooling config files
  Notes:
- Built-in tooling targets: commitlint, eslint, stylelint, lint-staged, tsconfig, vitest
- Generated files also update root package.json devDependencies

## workspace clean (alias: ws clean)

Purpose: remove selected packages and update the repo helper package version.
Usage:

- npx repoctl workspace clean
- npx repoctl ws clean
  Options:
- --yes: auto confirm
- --include-private
- --pinned-version <version>

## env mirror (alias: e m)

Purpose: set VSCode binary mirror env.
Usage:

- npx repoctl env mirror
- npx repoctl e m

## skills sync

Purpose: sync built-in skill files into global Codex or Claude directories.
Usage:

- npx repoctl skills sync
- npx repoctl skills sync --codex
- npx repoctl skills sync --claude
- npx repoctl skills sync --all

## ai prompt create (aliases: ai p create, ai p new)

Purpose: generate agentic prompt templates.
Usage:

- npx repoctl ai prompt create
- npx repoctl ai p new --name checkout
- npx repoctl ai prompt create --tasks agentic/tasks.json --format md -f
  Options:
- --output <path>
- --force
- --format <md|json>
- --dir <path>
- --name <name>
- --tasks <file>
  Notes:
- If no --output or --name is set, it prompts for a folder and writes to
  agentic/prompts/<timestamp>/prompt.md.
- If --tasks is used, it expects a JSON array of strings or objects.

## package create (alias: pkg new)

Purpose: create a new package from a template.
Usage:

- npx repoctl package create [path]
- npx repoctl pkg new [path]
  Notes:
- Prompts for a template choice unless defaults are set in repoctl.config.ts or monorepo.config.ts.
