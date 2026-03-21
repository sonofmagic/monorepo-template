---
'@icebreakers/monorepo': major
---

Refactor tooling config helpers to use object-style `define*Config` signatures only, and remove the legacy `defineMonorepo*Config` aliases.

Add bundled `@icebreakers/monorepo/tsconfig` exports so repository and consumer `tsconfig.json` files can extend the package by name instead of using relative paths.
