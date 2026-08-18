---
outline: deep
---

# repoctl Execution Model

repoctl is a task layer over pnpm, Turborepo, repository scripts, and managed assets. It coordinates those systems without replacing them.

## Entrypoints

The recommended binary is `repo`. `repoctl` is an equivalent public bin. Generated workspaces also expose `repo:init`, `repo:new`, `repo:doctor`, and `repo:check` root scripts.

## Command Lifecycle

1. Resolve locale from `--lang`, then `REPOCTL_LANG`, then English.
2. Find the pnpm workspace root and load `repoctl.config.ts` when present.
3. Build a deterministic plan from workspace state and command options.
4. Prompt only when the terminal is interactive and the command needs a choice.
5. Execute the plan or emit text, Markdown, or JSON output.
6. Set a non-zero exit code for blocking diagnostics or command failures.

## Output Contracts

Text and Markdown are localized. JSON keys, status values, check IDs, command names, and option names are stable across locales.

## Configuration

Configuration supplies repository defaults. Explicit CLI options take precedence. Non-interactive automation should use `--yes`, explicit template keys, and report output options instead of relying on prompts.
