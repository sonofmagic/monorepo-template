# 新手使用指南

这篇旧入口已经收敛到 repoctl 主线。新读者建议直接阅读：

- [repoctl 快速开始](./repoctl/getting-started.md)
- [repoctl 命令速查](./repoctl/commands.md)
- [repoctl 配置文件](./repoctl/config.md)

## 先这样用

```bash
pnpm add -D repoctl
pnpm exec repo init
pnpm exec repo doctor
pnpm exec repo new
pnpm exec repo check
```

模板生成仓库里可以使用更短的根脚本：

```bash
pnpm run repo:init
pnpm doctor
pnpm new
pnpm check
```

## 知识点保留

理解工具前，先理解这几个边界：

| 命令           | 解决的问题                                            |
| -------------- | ----------------------------------------------------- |
| `repo init`    | 补齐仓库默认脚本、workspace patterns 和基础工具链入口 |
| `repo doctor`  | 判断仓库当前是否可用，并输出可保存的诊断报告          |
| `repo new`     | 从内置模板创建包、应用、服务、文档站或 CLI            |
| `repo check`   | 预览或执行提交前推荐校验                              |
| `repo upgrade` | 同步模板最新标准资产                                  |

如果你是在学习 monorepo 的基础概念，可以继续看 [为什么往 monorepo 方向演进](./monorepo/index.md)。
