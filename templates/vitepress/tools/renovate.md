# Renovate

Renovate opens dependency update pull requests according to repository policy.

Group related tooling updates, respect pnpm workspace constraints, and let the normal build, lint, typecheck, tsd, and test matrix validate each update. Avoid combining unrelated runtime and tooling upgrades when separate review makes regressions easier to isolate.

repoctl does not replace Renovate. It provides the diagnostic and verification commands that Renovate pull requests can run consistently.
