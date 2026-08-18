# 第一次运行

这是最小的完整 repoctl 流程。它先做一次可审查的变更，保存证据，再给出下一步。

## 安装

```bash
pnpm add -D repoctl
```

## 初始化

```bash
pnpm exec repo init
```

接受写入前先检查计划。如果仓库已有自己的约定，先阅读接入指南，再决定是否替换文件。

## 诊断

```bash
pnpm exec repo doctor
```

报告会检查仓库根目录、包管理器、workspace 结构、任务运行器、hooks 和发布元数据。先修复第一个阻塞项，再重新执行命令。

## 规划校验

```bash
pnpm exec repo check --dry-run
```

这会列出 lint、类型检查、构建、测试和包检查将要执行的命令。确认计划符合仓库约定后，再执行完整校验。

## 下一步

- 新建仓库：[创建包或应用](/zh/tasks/create-project)。
- 已有仓库：[接入已有 workspace](/zh/tasks/adopt-existing)。
- 配置 CI：[把校验加入 CI](/zh/tasks/ci)。
