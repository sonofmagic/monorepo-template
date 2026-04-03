---
'@icebreakers/monorepo': major
'repoctl': major
'create-icebreaker': major
'@icebreakers/monorepo-templates': major
---

Remove the legacy `tsup` and `unbuild` library templates from the repository and scaffolding flow.

`monorepo new`, `repoctl new`, and `create-icebreaker` no longer offer `tsup` or `unbuild` as built-in template keys. The bundled template asset set and related docs have been updated to standardize on `tsdown` as the only generic TypeScript library template.
