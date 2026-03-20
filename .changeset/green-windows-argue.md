---
'@icebreakers/monorepo': patch
'@icebreakers/monorepo-templates': patch
---

Add thin `defineMonorepo*Config()` helpers so config entry files can delegate tooling config loading to `@icebreakers/monorepo/tooling`, and simplify shipped lint-staged and root config templates to use those wrappers.
