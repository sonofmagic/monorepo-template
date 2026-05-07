---
"repoctl": patch
"@icebreakers/monorepo": patch
"@icebreakers/monorepo-templates": patch
---

release 流程改为按分支分流：`main` 只发正式包，`alpha`、`beta`、`rc`、`next` 仅以 Changesets pre 模式发布对应 tag 包，并补齐了相关文档说明。
