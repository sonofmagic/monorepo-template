---
description: 说明 repoctl 的 JSON、Markdown、out、redact、env info、env snapshot 和 env support 报告能力。
---

# 报告与自动化输出

repoctl 的报告能力用于把本地上下文变成可保存、可脱敏、可给脚本读取的文件。它适合 CI artifact、issue 模板、编辑器集成和跨机器排障。

## 1. 通用输出参数

| 参数           | 支持命令示例                            | 作用                           |
| -------------- | --------------------------------------- | ------------------------------ |
| `--json`       | `doctor`、`check`、`templates`、`env`   | 输出结构化数据                 |
| `--markdown`   | `doctor`、`check`、`templates`、`env`   | 输出便于阅读和粘贴的报告       |
| `--out <file>` | 多数报告命令                            | 把输出写入文件                 |
| `--redact`     | `doctor`、`check`、`env`                | 脱敏本机路径                   |
| `--strict`     | `doctor`、`env snapshot`、`env support` | 有 fail 或 warn 时返回失败状态 |

## 2. env 子命令

| 命令                | 内容                                         | 适合用途         |
| ------------------- | -------------------------------------------- | ---------------- |
| `repo env info`     | cwd、workspace、Node、pnpm、包数量等环境摘要 | 快速确认环境     |
| `repo env paths`    | 关键路径和建议报告路径                       | 统一报告落盘位置 |
| `repo env snapshot` | 环境、doctor 和 check plan                   | CI 快照          |
| `repo env support`  | 环境、路径、配置、doctor 和 check plan       | 完整排障包       |
| `repo env mirror`   | VS Code binary mirror 设置                   | 国内网络环境优化 |

常用组合：

```bash
repo env info --json --out reports/env.json
repo env snapshot --markdown --redact --out reports/snapshot.md
repo env support --markdown --redact --out reports/support.md
```

## 3. CI artifact 示例

```bash
repo doctor --json --out reports/doctor.json
repo check --full --json --out reports/check-plan.json
repo env support --markdown --redact --out reports/support.md
```

建议把 `reports/` 上传为 artifact。这样 CI 失败时，不需要重新询问维护者使用了什么 Node、pnpm、workspace 根目录和校验计划。

## 4. issue 排障模板

当你需要把问题交给同事或维护者时，可以先生成 Markdown：

```bash
repo env support --markdown --redact --out reports/support.md
```

然后在 issue 里附上：

| 内容          | 来源              |
| ------------- | ----------------- |
| 环境摘要      | `env info`        |
| 配置命中情况  | `config inspect`  |
| doctor 失败项 | `doctor`          |
| check 计划    | `check --dry-run` |
| 推荐报告路径  | `env paths`       |

## 5. 什么时候使用 JSON

JSON 适合机器判断，不适合人工长时间阅读：

```bash
repo doctor --json --out reports/doctor.json
repo templates --check --json --out reports/templates.json
repo new docs --template vitepress --json --out plans/docs.json
```

常见消费方式：

| 目标                | 使用方式                             |
| ------------------- | ------------------------------------ |
| CI 判断是否有阻塞项 | 读取 `doctor.summary.fail`           |
| 编辑器展示模板列表  | 读取 `repo templates --json`         |
| 预览创建结果        | 读取 `repo new --json`               |
| 审计模板健康状态    | 读取 `repo templates --check --json` |

## 6. 什么时候使用 Markdown

Markdown 适合给人看，尤其适合 PR、issue 和协作文档：

```bash
repo doctor --markdown --redact --out reports/doctor.md
repo check --markdown --redact --out reports/check-plan.md
repo templates --markdown --out docs/templates.md
```

如果报告要离开本机，默认加 `--redact`。
