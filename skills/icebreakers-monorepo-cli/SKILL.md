---
name: icebreakers-monorepo-cli
description: Use when working with @icebreakers/monorepo in this pnpm/turbo monorepo. Covers CLI tasks like upgrade/up, init, sync, clean, mirror, creating new template packages (tsdown/tsup/unbuild/vitepress/etc), generating agentic prompt templates (monorepo ai create/new), and editing monorepo.config.ts defaults.
---

# Icebreakers Monorepo Cli

## Overview

Map user requests to the correct `monorepo` CLI command, templates, and configuration defaults.

## Quick Workflow

1. Confirm the workspace root (look for `pnpm-workspace.yaml` and `package.json`).
2. Check `monorepo.config.ts` for command defaults or overrides.
3. Select the task below and follow the linked reference.

## Tasks

### Create a template package

- Use `monorepo new [path]` (alias `create`) and pick a template from `references/templates.md`.
- Example: for "create a tsdown app in apps/my-app", run `npx monorepo new apps/my-app` and select `tsdown`.
- For non-interactive defaults, set `commands.create.defaultTemplate` in `monorepo.config.ts`.

### Upgrade or sync monorepo assets

- Use `monorepo up` (`upgrade`) and options from `references/commands.md`.

### Generate agentic prompt templates

- Use `monorepo ai create` (`ai new`) and options from `references/commands.md`.

### Maintenance tasks

- Use `monorepo clean`, `sync`, `mirror`, or `init` from `references/commands.md`.
- Confirm destructive actions (clean) and note repo-wide effects.

## References

- `references/commands.md` for CLI options and flags.
- `references/templates.md` for template mapping and placement.
- `references/config.md` for `monorepo.config.ts` defaults.
