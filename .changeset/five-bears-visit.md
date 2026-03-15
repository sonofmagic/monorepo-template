---
'@icebreakers/monorepo': patch
'@icebreakers/monorepo-templates': patch
---

Align template tooling with Vite 8 and stabilize monorepo template workflows.

- add a default export condition for `@icebreakers/monorepo-templates`
- update shipped Vite templates for Vite 8 config expectations
- add standard `build` scripts to the server template
- make monorepo template tests repeatable and remove Vitest 4 warnings
