# 输出格式

repoctl 可以输出到终端，也可以保存为供自动化使用的稳定产物。选择命令边界的输出格式，同一项任务就能服务人和 CI。

## 终端

默认输出适合人阅读，会显示计划、选中的命令和最终状态。

## JSON

其他工具需要结构化字段时使用 JSON：

```bash
repo check --full --dry-run --json --out reports/check-plan.json
```

后续 job 需要检查计划时，可以把文件作为 CI 产物保存。

## Markdown

代码评审和支持请求适合使用 Markdown：

```bash
repo env support --markdown --redact --out reports/support.md
```

`--redact` 会在分享前移除本地路径和敏感值。

## 常见分支

- 需要比较两次运行：分别写入不同文件，再比较 JSON。
- 需要安全的排障包：使用 `repo env support --redact`。
- 只需要命令计划：把 `--dry-run` 和目标输出格式一起使用。

## 下一步

完整支持流程请看[报告与输出任务](/zh/tasks/reports)。
