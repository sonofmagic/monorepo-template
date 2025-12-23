---
"@icebreakers/monorepo": patch
---

feat(clean): 自动删除 .qoder 文件夹

优化 `clean` 命令,现在执行清理操作时会自动删除项目根目录下的 `.qoder` 文件夹。

**变更内容**:
- 在清理候选列表中添加 `.qoder` 目录
- 更新相关测试用例以验证新功能

**影响范围**:
- `monorepo clean` 命令
- `pnpm script:clean` 命令

`.qoder` 文件夹通常用于存储 AI 助手生成的临时文件和设计文档,在清理项目模板时删除这些文件有助于保持项目的干净状态。
