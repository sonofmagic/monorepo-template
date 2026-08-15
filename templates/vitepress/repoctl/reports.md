---
outline: deep
---

# Reports and Automation Output

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
