# Command Reference

This page focuses on high-value repoctl commands and options.

## Main Entry

```bash
pnpm exec repo setup
pnpm exec repo doctor
pnpm exec repo templates
pnpm exec repo new
pnpm exec repo check
```

Generated repositories also expose:

```bash
pnpm setup
pnpm doctor
pnpm new
pnpm check
```

## `repo setup`

```bash
repo setup
repo setup --yes
repo setup --preset minimal
repo setup --preset standard --force
repo setup --overwrite
```

Use it to initialize recommended workspace defaults. It skips existing managed files by default, appends missing workspace patterns, and supports non-interactive CI usage with `--yes`.

## `repo doctor`

```bash
repo doctor
repo doctor --strict
repo doctor --json --out reports/doctor.json
repo doctor --markdown --redact --out reports/doctor.md
```

Use it to check root workspace files, Node compatibility, CLI dependency presence, root scripts, config conflicts, and commit hooks.

`--strict` treats warnings as failures. `--redact` removes local absolute paths from shareable reports.

## `repo templates`

```bash
repo templates
repo templates tsdown
repo templates --category library
repo templates --check
repo templates --json
repo templates --markdown --out docs/templates.md
```

Use it to discover built-in template keys, inspect metadata, verify template health, or generate machine-readable output.

## `repo new`

```bash
repo new
repo new sdk --template tsdown
repo new docs --template vitepress
repo new docs --template vitepress --dry-run
repo new docs --template vitepress --json --out plans/docs.json
```

Use it to create packages and apps. Explicit template keys are validated first; invalid keys fail with suggestions instead of silently falling back.

## `repo check`

```bash
repo check
repo check --staged
repo check --full
repo check --edit-file .git/COMMIT_EDITMSG
repo check --dry-run
repo check --json --out reports/check-plan.json
repo check --markdown --redact --out reports/check-plan.md
```

Use it to preview or run the recommended local verification flow. `--staged` is closer to pre-commit; `--full` is closer to pre-push.

## `repo upgrade`

```bash
repo upgrade
repo upgrade --yes
repo upgrade --overwrite
repo upgrade --no-overwrite
repo upgrade --core
repo upgrade -i
repo upgrade -s
```

Use it to sync standard assets and scripts. `--core` skips GitHub-related assets. `--no-overwrite` preserves changed files.

## Grouped Commands

```bash
repo ws ls
repo ws ls --json --out reports/workspaces.json
repo ws up
repo tg init --all
repo verify pre-commit
repo verify pre-push
repo env support --markdown --redact --out reports/support.md
repo config inspect
repo skills sync --codex
```

## Keep Reading

- [Workflows and CI](./workflows.md)
- [Troubleshooting](./troubleshooting.md)
- [Command Aliases](./aliases.md)
