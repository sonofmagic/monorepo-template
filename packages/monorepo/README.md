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
npx monorepo ai create -o agentic-task.md -f
# 或使用别名
npx monorepo ai new --name checkout
# 同步技能到全局目录
npx monorepo skills sync
# 仅同步指定目标
npx monorepo skills sync --codex
npx monorepo skills sync --claude
```

`monorepo ai create`（别名 `ai new`）默认会把模板写入 `agentic/prompts/<timestamp>/prompt.md`，每次都会建一个以时间命名的目录，并在命令行提示可修改该目录名称，方便追加截图等素材；也可以通过参数自定义路径。

`@icebreakers/monorepo` 在运行时会从 `@icebreakers/monorepo-templates` 读取模板、骨架与升级资产。

`monorepo skills sync` 会将包内 `resources/skills/icebreakers-monorepo-cli` 同步到 `~/.codex/skills/icebreakers-monorepo-cli` 或 `~/.claude/skills/icebreakers-monorepo-cli`；未指定目标时会交互选择。

`monorepo ai create` 支持批量生成：

```bash
# 基于名称自动落盘到 agentic/prompts/checkout.md（默认目录可在 monorepo.config.ts 中设置）
npx monorepo ai create --name checkout

# 使用任务清单一次生成多个文件（tasks.json 为字符串或对象数组）
npx monorepo ai create --tasks agentic/tasks.json --format md -f
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
      baseDir: 'agentic/custom-prompts',
      format: 'json',
      force: true,
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

目前支持 `ai`、`create`、`clean`、`sync`、`upgrade`、`init` 与 `mirror` 七类命令的默认参数覆写。

## 文档地址

https://monorepo.icebreaker.top/

## 需求环境

Nodejs >= `v20.11.0`
