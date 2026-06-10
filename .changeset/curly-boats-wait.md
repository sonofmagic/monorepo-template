---
"@icebreakers/vue-lib-template": patch
"@icebreakers/monorepo-templates": patch
---

修复 Vue 库模板在新版声明文件插件下缺少 `dist/index.d.ts`，导致类型测试和发布类型入口失效的问题。

修复 Windows 环境准备发布模板资产时未移除源码仓库专用 release tooling 构建步骤的问题。
