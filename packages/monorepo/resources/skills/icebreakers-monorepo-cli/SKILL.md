---
name: icebreakers-monorepo-cli
description: Use when working with repoctl or @icebreakers/monorepo in this pnpm/turbo monorepo. Covers CLI tasks like workspace upgrade/ws up, init, clean, mirror, skills sync, creating new template packages (tsdown/vitepress/etc), generating agentic prompt templates (repoctl ai prompt create / ai p new), and editing repoctl.config.ts or monorepo.config.ts defaults.
---

# Icebreakers Monorepo Cli

## Overview

Map user requests to the correct `repoctl` CLI command, templates, and configuration defaults.
Prefer `repoctl` in examples, allow `repo` as the short alias, and treat `rc` as a compatibility alias rather than the primary recommendation.

## Quick Workflow

1. Confirm the workspace root (look for `pnpm-workspace.yaml` and `package.json`).
2. Check `repoctl.config.ts` first, then `monorepo.config.ts` for command defaults or overrides.
3. Select the task below and follow the linked reference.

## Tasks

### Create a template package

- Use `repoctl package create [path]` (alias `pkg new`) and pick a template from `references/templates.md`.
- Example: for "create a tsdown app in apps/my-app", run `npx repoctl pkg new apps/my-app` and select `tsdown`.
- For non-interactive defaults, set `commands.create.defaultTemplate` in `repoctl.config.ts` or `monorepo.config.ts`.

### Upgrade or sync monorepo assets

- Use `repoctl workspace upgrade` (`ws up`) and options from `references/commands.md`.

### Generate agentic prompt templates

- Use `repoctl ai prompt create` (`ai p new`) and options from `references/commands.md`.

### Maintenance tasks

- Use `repoctl clean`, `mirror`, `skills sync`, or `init` from `references/commands.md`.
- Confirm destructive actions (clean) and note repo-wide effects.

## References

- `references/commands.md` for CLI options and flags.
- `references/templates.md` for template mapping and placement.
- `references/config.md` for `repoctl.config.ts` / `monorepo.config.ts` defaults.
