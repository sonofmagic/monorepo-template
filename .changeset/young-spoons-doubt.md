---
'@icebreakers/monorepo': patch
'@icebreakers/monorepo-templates': patch
---

Improve `monorepo up` AGENTS handling and harden related type checks.

- Include `AGENTS.md` in upgrade asset targets.
- Merge `AGENTS.md` by section instead of blindly overwriting existing content.
- Fix TypeScript issues in `@icebreakers/monorepo` tests and `@icebreakers/monorepo-templates` scaffold options under `exactOptionalPropertyTypes`.
