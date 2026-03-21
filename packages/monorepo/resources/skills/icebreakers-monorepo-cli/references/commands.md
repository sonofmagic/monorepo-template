# Commands

## upgrade (alias: up)

Purpose: sync monorepo assets and scripts into the workspace.
Usage:

- npx repoctl up
- npx repoctl upgrade
  Options:
- --interactive: prompt for overwrites
- --core: sync core config only (skip GitHub assets)
- --outDir <dir>: write to another directory
- --skip-overwrite: never overwrite existing files

## init

Purpose: initialize package.json and README.md.
Usage:

- npx repoctl init

## sync

Purpose: sync workspace packages to npmmirror.
Usage:

- npx repoctl sync

## clean

Purpose: remove selected packages and update the repo helper package version.
Usage:

- npx repoctl clean
  Options:
- --yes: auto confirm
- --include-private
- --pinned-version <version>

## mirror

Purpose: set VSCode binary mirror env.
Usage:

- npx repoctl mirror

## ai create (alias: ai new)

Purpose: generate agentic prompt templates.
Usage:

- npx repoctl ai create
- npx repoctl ai create --name checkout
- npx repoctl ai create --tasks agentic/tasks.json --format md -f
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

## new (alias: create)

Purpose: create a new package from a template.
Usage:

- npx repoctl new [path]
  Notes:
- Prompts for a template choice unless defaults are set in repoctl.config.ts or monorepo.config.ts.
