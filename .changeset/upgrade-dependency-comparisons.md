---
'@icebreakers/monorepo': patch
---

Improve `setPkgJson` so dependency updates skip downgrades by comparing versions with semver, and add test coverage for the new behavior.
