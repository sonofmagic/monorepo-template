---
'@icebreakers/monorepo': patch
---

Fix staged typecheck workspace resolution so scaffold asset files under `packages/monorepo/assets` resolve back to the real package workspace instead of being treated as executable workspaces themselves.
