# Output formats

repoctl can print to the terminal or write stable artifacts for automation. Pick the format at the command boundary so the same task can serve a person and CI.

## Terminal

The default output is concise and human-readable. It shows the plan, the commands selected, and the final status.

## JSON

Use JSON when another tool needs structured fields:

```bash
repo check --full --dry-run --json --out reports/check-plan.json
```

Keep the file as a CI artifact when a later job needs to inspect the plan.

## Markdown

Use Markdown for code review and support requests:

```bash
repo env support --markdown --redact --out reports/support.md
```

The `--redact` flag removes local paths and sensitive values before sharing the report.

## Common branches

- Need to compare two runs: write both to separate files and compare the JSON.
- Need a safe support bundle: use `repo env support --redact`.
- Need a command plan only: combine `--dry-run` with the desired output format.

## Next

See [reports and output tasks](/tasks/reports) for a complete support workflow.
