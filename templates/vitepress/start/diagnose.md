---
outline: deep
---

# repoctl Doctor

`repo doctor` diagnoses whether the current pnpm workspace is ready for development and release. It does not rewrite files.

## Statuses

- `pass`: the check is satisfied.
- `warn`: the repository works, but maintenance or consistency needs attention.
- `fail`: a required workspace contract is missing or invalid.

## Checks

Doctor covers the root `package.json`, `pnpm-workspace.yaml`, Node compatibility, the `repoctl` dependency, recommended `repo:*` scripts, `repoctl.config.ts`, commit hooks, workspace pattern coverage, tooling imports, and release configuration.

Check IDs and JSON fields remain stable in every locale.

## Reports

```bash
repo doctor --json
repo doctor --markdown
repo doctor --markdown --redact --out reports/doctor.md
```

`--redact` replaces workspace, current-directory, and home paths before output is shared.

## Strict Mode

```bash
repo doctor --strict
```

Normal mode exits non-zero for failures. Strict mode also treats warnings as blocking, which is useful for CI policy enforcement.

## Language

```bash
repo --lang zh-CN doctor
REPOCTL_LANG=zh-CN repo doctor
```

The explicit option wins over `REPOCTL_LANG`; English is the fixed fallback.
