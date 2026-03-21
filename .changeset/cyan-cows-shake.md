---
'@icebreakers/monorepo': patch
'repoctl': patch
---

Support `repoctl.config.*` as the preferred config filename, keep `monorepo.config.*` compatible, and fail fast when both are present in the same workspace.
