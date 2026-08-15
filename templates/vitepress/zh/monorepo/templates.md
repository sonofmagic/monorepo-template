# 模板速查

模板创建已经收敛到 repoctl 文档：

- [repoctl 模板与创建](../repoctl/templates.md)
- [repoctl 快速开始](../repoctl/getting-started.md)

## monorepo 知识点：模板为什么重要

当仓库里存在多种产物时，模板能把重复选择前置成稳定默认值：

| 产物          | 常见目录                 | 关注点                         |
| ------------- | ------------------------ | ------------------------------ |
| TypeScript 库 | `packages/*`             | exports、types、构建和 tsd     |
| Vue 组件库    | `packages/*`             | SFC、样式校验、类型声明        |
| 应用          | `apps/*`                 | dev、build、部署资产           |
| 服务          | `apps/*`                 | API 入口、运行时类型、环境变量 |
| 文档站        | `apps/*`                 | VitePress 配置、导航、内容结构 |
| CLI           | `apps/*` 或 `packages/*` | bin 入口、参数解析、发布       |

repoctl 的 `repo templates` 和 `repo new` 负责把这些约定落实到文件系统。
