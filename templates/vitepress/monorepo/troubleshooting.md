# Monorepo Troubleshooting

Start by identifying the problem class: workspace discovery, dependency installation, task orchestration, repository policy, or release state.

```bash
repo doctor
repo env support --markdown --redact --out reports/support.md
repo check --full --dry-run
pnpm change status
```

- Workspace discovery failures usually point to `pnpm-workspace.yaml` patterns.
- Missing task output or cache behavior belongs to Turbo task configuration.
- Tooling drift belongs to managed config and `repo upgrade`.
- Release failures require checking both versioning state and registry publication.

Do not overwrite custom files until the diagnostic report and planned changes are understood.
