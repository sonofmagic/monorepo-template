---
'@icebreakers/monorepo': minor
'repoctl': minor
'@icebreakers/monorepo-templates': patch
'create-icebreaker': patch
---

Add the new `repoctl` package as the preferred repo toolchain entrypoint while keeping `@icebreakers/monorepo` published and version-linked for compatibility. Template assets, docs, hooks, and config defaults now prefer `repoctl`, and cleanup/upgrade flows preserve whichever helper package a workspace already uses.
