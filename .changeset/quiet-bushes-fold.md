---
'@icebreakers/monorepo': patch
'repoctl': patch
'@icebreakers/monorepo-templates': patch
---

Allow all default engineering config entrypoints to inherit overrides from `monorepo.config.ts`, including project-level Vitest defaults through `tooling.vitestProject`.
