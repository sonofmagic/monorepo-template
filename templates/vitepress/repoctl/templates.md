# 模板与创建

repoctl 的模板由 `@icebreakers/monorepo-templates` 维护。CLI、脚手架和文档都复用同一份模板元数据。

## 内置模板

| Key           | Category | 默认目录           | 适合场景                    |
| ------------- | -------- | ------------------ | --------------------------- |
| `tsdown`      | library  | `packages/tsdown`  | TypeScript 库包             |
| `vue-lib`     | library  | `packages/vue-lib` | Vue 3 组件库                |
| `vue-hono`    | app      | `apps/client`      | Vue 3 + Hono 前后端一体应用 |
| `hono-server` | service  | `apps/server`      | Hono API 服务               |
| `vitepress`   | docs     | `apps/website`     | VitePress 文档站            |
| `cli`         | tool     | `apps/cli`         | TypeScript 命令行工具       |

## 查看模板

```bash
repo templates
repo templates tsdown
repo templates --category library
repo templates --json
repo templates --markdown --out docs/templates.md
```

## 创建模板

```bash
repo new sdk --template tsdown
repo new ui --template vue-lib
repo new api --template hono-server
repo new website --template vitepress
repo new toolbox --template cli
```

普通名字会自动放到模板约定的目录里，例如库包进入 `packages/`，应用进入 `apps/`。如果你传入带 `/` 的路径，例如 `packages/shared-utils`，repoctl 会尊重这个路径。

## 创建前预览

```bash
repo new website --template vitepress --dry-run
repo new website --template vitepress --json
repo new website --template vitepress --json --out plans/website.json
```

`--dry-run` 不写入磁盘，只展示模板、源目录、目标目录、package name 和输出文件。

`--json` 输出同一份创建计划的结构化数据，隐含 `--dry-run`。

`--out <file>` 可以把文本或 JSON 预览写入文件，也隐含 `--dry-run`。

## 固化默认模板

```ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    create: {
      defaultTemplate: 'tsdown',
    },
  },
})
```

之后：

```bash
repo new utils
```

会直接创建 `tsdown` 库包。

## 检查模板健康状态

```bash
repo templates --check
repo templates --check --json
```

模板检查会确认：

- 模板 source 和 target 没有重复。
- 每个模板 source 目录都存在。
- 每个模板根目录都有 `package.json`。
- 每个模板都有 category 和 description。
- 模板源目录里没有会被脚手架过滤掉的临时或生成文件。
