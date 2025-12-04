# @icebreakers/monorepo

[icebreaker](https://github.com/sonofmagic) 的 `monorepo` 升级同步工具

## 使用方式

```sh
# 安装
pnpm add -D @icebreakers/monorepo@latest
# 升级
npx monorepo up
# 帮助文档
npx monorepo -h
# 生成 Agentic 任务模板
npx monorepo ai template -o agentic-task.md -f
```

`monorepo ai template` 支持批量生成：

```bash
# 基于名称自动落盘到 agentic/checkout.md（默认目录可在 monorepo.config.ts 中设置）
npx monorepo ai template --name checkout

# 使用任务清单一次生成多个文件（tasks.json 为字符串或对象数组）
npx monorepo ai template --tasks agentic/tasks.json --format md -f
```

`agentic/tasks.json` 示例：

```json
[
  "checkout",
  { "name": "payments", "format": "json", "force": true }
]
```

### 配置文件

在工作区根目录下创建 `monorepo.config.ts`（内容可为普通 ESM），即可覆盖每个命令的默认行为。例如：

```ts
// monorepo.config.ts
import { defineMonorepoConfig } from '@icebreakers/monorepo'

export default defineMonorepoConfig({
  commands: {
    ai: {
      output: 'agentic-task.md',
      format: 'md',
      force: true,
      baseDir: 'agentic',
      tasksFile: 'agentic/tasks.json',
    },
    create: {
      defaultTemplate: 'cli',
      renameJson: true,
    },
    clean: {
      autoConfirm: true,
      ignorePackages: ['docs'],
    },
    upgrade: {
      skipOverwrite: true,
      targets: ['.github', 'monorepo.config.ts'],
    },
  },
})
```

目前支持 `create`、`clean`、`sync`、`upgrade`、`init` 与 `mirror` 六类命令的默认参数覆写。

## 文档地址

https://monorepo.icebreaker.top/

## 需求环境

Nodejs >= `v20.11.0`
