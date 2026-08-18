# Release packages

Use this task when a change is ready to version and publish. Keep the release plan reviewable before any registry write.

## Prerequisites

- `repo doctor` reports a valid package manager and release configuration.
- The working tree is clean except for the intended changes.
- Every publishable change has a changeset or the repository's chosen intent file.

## Smallest command

```bash
repo release --dry-run
```

Review the package groups, versions, changelog entries, and publish commands. Run the same command without `--dry-run` only after the plan is approved.

## Expected result

The release report names the packages that will change, the version decisions, and each subprocess that will run. A successful release also completes the configured post-publish hooks.

## Common branches

- Missing intent: add a changeset and rerun the plan.
- Fixed group mismatch: inspect the package relationships before editing versions.
- Registry authentication failure: refresh the local token and rerun the publish step; do not commit credentials.

## Next

Read [publishing and changelogs](/learn/monorepo/publish) for repository policy and [reports and output](/tasks/reports) for CI artifacts.
