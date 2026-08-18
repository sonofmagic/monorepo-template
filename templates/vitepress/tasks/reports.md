---
outline: deep
---

# Reports and Automation Output

## When To Use

Use this task when a person, CI job, or support request needs a durable record of what repoctl found or planned.

## Prerequisites

- Choose a `reports/` directory that is ignored or uploaded as a CI artifact.
- Use `--redact` before sharing environment details outside the repository.

## Smallest Command

```bash
repo env support --markdown --redact --out reports/support.md
```

## Expected Output

The output file contains stable headings and command results that can be attached to a pull request or issue.

## Common Branches

- Another tool consumes the result: use JSON with `--json`.
- You only need to inspect a plan: combine `--dry-run` with the desired format.
- A report contains a local path or token: regenerate it with `--redact`.

repoctl commands expose human-readable text for terminals, Markdown for issues and pull requests, and stable JSON for automation.

## Common Options

- `--json`: emit structured data with stable field names.
- `--markdown`: emit a shareable report.
- `--out <file>`: write output to a file.
- `--redact`: replace local absolute paths.
- `--strict`: treat doctor warnings as failures where supported.

## Environment Commands

```bash
repo env info --json
repo env paths --markdown
repo env snapshot --json --out reports/snapshot.json
repo env support --markdown --redact --out reports/support.md
```

The support bundle combines environment facts, resolved configuration, doctor results, the check plan, and report paths.

## CI Example

```bash
repo doctor --json --out reports/doctor.json
repo check --full --dry-run --json --out reports/check-plan.json
repo env support --markdown --redact --out reports/support.md
```

Upload `reports/` as a CI artifact so failures can be inspected without exposing local paths.

## Choosing A Format

Use JSON when another program consumes the result. Use Markdown when a person will read or paste the report. Locale only changes human-readable strings; JSON field names and status codes stay unchanged.
