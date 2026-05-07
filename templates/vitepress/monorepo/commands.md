# 命令速查

repoctl 现在是这套文档的主线。完整命令说明请阅读：

- [repoctl 命令速查](../repoctl/commands.md)
- [repoctl 模板与创建](../repoctl/templates.md)
- [repoctl 排障与报告](../repoctl/troubleshooting.md)

## monorepo 知识点：为什么要统一命令入口

monorepo 的难点通常不是“能不能跑某个工具”，而是团队成员是否能稳定地用同一套入口完成日常动作。

repoctl 把命令分成三层：

| 层级     | 示例                                         | 适合场景             |
| -------- | -------------------------------------------- | -------------------- |
| 根脚本   | `pnpm run repo:doctor` / `pnpm run repo:new` | 日常开发和团队教程   |
| 主 CLI   | `pnpm exec repo doctor`                      | CI、脚本、排障和文档 |
| 分组命令 | `repo ws ls` / `repo env support`            | 维护者和自动化       |

保留这个旧页面，是为了让已有链接继续可用，同时把读者导向新的 repoctl 命令文档。
