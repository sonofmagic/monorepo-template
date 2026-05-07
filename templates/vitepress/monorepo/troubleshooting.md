# 常见问题排障

repoctl 排障文档已经集中到：

- [repoctl 排障与报告](../repoctl/troubleshooting.md)
- [repoctl 命令速查](../repoctl/commands.md)

## monorepo 知识点：先区分问题类型

排障前先判断问题属于哪一类：

| 类型           | 先看什么                              | 常用命令                                |
| -------------- | ------------------------------------- | --------------------------------------- |
| 仓库结构问题   | 根目录、workspace 文件、Node 版本     | `repo doctor`                           |
| 模板创建问题   | 模板 key、目标目录、创建计划          | `repo templates` / `repo new --dry-run` |
| 提交前校验问题 | staged 文件、workspace 归属、任务路由 | `repo check --dry-run`                  |
| 环境差异问题   | Node、pnpm、Git、CI、路径             | `repo env support --markdown --redact`  |
| 配置冲突问题   | `repoctl.config.ts` 与旧配置文件      | `repo config inspect`                   |

旧页面继续保留为知识点索引，具体排查步骤以后优先维护在 repoctl 分区。
