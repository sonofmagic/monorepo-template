---
"@icebreakers/monorepo": patch
"@icebreakers/monorepo-templates": patch
---

Enforce stricter commit-time quality gates in scaffolded projects.

- Add Stylelint checks for staged style files (including Vue SFC style blocks) in `lint-staged.config.js`.
- Update agent rules to require build-first validation, ESLint/Stylelint, TypeScript error fixes, and `tsd` tests for TypeScript libraries before running test suites.
