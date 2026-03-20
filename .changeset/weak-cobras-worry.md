---
'@icebreakers/monorepo': patch
'@icebreakers/monorepo-templates': patch
'create-icebreaker': patch
---

Add `tsd` type tests to library workspaces, wire a repository-level `tsd` task into Turbo validation, and fix the server template typecheck regression blocking full workspace checks.
