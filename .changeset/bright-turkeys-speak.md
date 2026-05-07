---
"repoctl": patch
"@icebreakers/monorepo": patch
"@icebreakers/monorepo-templates": patch
---

repoctl now ships a publishable `tsconfig.json` entry for direct `extends` usage, and generated templates write that same public entry instead of relying on a local base file.
