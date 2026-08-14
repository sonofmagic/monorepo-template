---
"@icebreakers/monorepo": patch
"@icebreakers/monorepo-templates": patch
---

修复 release CI 未向 repoctl 注入 `GITHUB_TOKEN`，导致 Release PR、tag 和 GitHub Release 编排无法调用 GitHub API。
