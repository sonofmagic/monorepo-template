---
description: repoctl 文档站的知识库入口，汇总 monorepo 管理、现代 npm 包和 JavaScript 模块化基础。
---

# 知识库

知识库用于解释 repoctl 背后的工程背景。这里不放命令速查，而是回答为什么要这样组织仓库、包、构建和发布流程。

## 1. monorepo 主题

| 页面                                               | 适合解决的问题                     |
| -------------------------------------------------- | ---------------------------------- |
| [为什么往 monorepo 方向演进](../monorepo/index.md) | 判断多包仓库是否值得合并管理       |
| [如何管理 monorepo](../monorepo/manage.md)         | 理解 workspace、任务编排和依赖边界 |
| [发包与变更日志](../monorepo/publish.md)           | 设计 changeset、版本和发布链路     |
| [monorepo 命令参考](../monorepo/commands.md)       | 查看通用 monorepo 操作命令         |
| [monorepo 模板体系](../monorepo/templates.md)      | 理解模板如何减少重复初始化         |
| [monorepo 排障](../monorepo/troubleshooting.md)    | 排查依赖、构建、类型和发布问题     |

## 2. 现代 npm 包主题

| 页面                                                   | 适合解决的问题                     |
| ------------------------------------------------------ | ---------------------------------- |
| [如何复用 js 代码](../why/how-to-reuse-js-code.md)     | 从复制文件演进到发布包             |
| [什么是 npm 包](../why/what-is-npm-package.md)         | 理解 package.json、入口和安装方式  |
| [如何发布 npm 包](../why/publish-basic-npm-package.md) | 走通最小 npm 发布流程              |
| [改进并发布现代 npm 包](../why/index.md)               | 把普通包升级成更规范的现代包       |
| [现代包指南](../why/modern/index.md)                   | 汇总类型、入口、模块格式和构建工具 |

## 3. 阅读顺序

如果你第一次接触 monorepo，建议按下面顺序阅读：

```txt
为什么 monorepo
  -> 如何管理 monorepo
  -> 什么是 npm 包
  -> 现代包指南
  -> 发包与变更日志
```

如果你已经在维护仓库，可以直接从具体问题进入：

| 你遇到的问题                  | 建议入口                                        |
| ----------------------------- | ----------------------------------------------- |
| workspace 包互相引用不清楚    | [如何管理 monorepo](../monorepo/manage.md)      |
| 不确定 CJS、ESM、types 怎么配 | [现代包指南](../why/modern/index.md)            |
| 发布后使用方拿不到类型        | [类型声明](../why/modern/dts.md)                |
| 包入口太多、导入路径混乱      | [包入口](../why/modern/package-entry-points.md) |
| CI 和发版流程容易漂移         | [发包与变更日志](../monorepo/publish.md)        |
