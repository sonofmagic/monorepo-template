# 模板速查

内置模板由 `@icebreakers/monorepo-templates` 维护，CLI、脚手架和文档都复用同一份模板元数据。

## 模板列表

| Key           | Category | Source                | Default target     | Description                         |
| ------------- | -------- | --------------------- | ------------------ | ----------------------------------- |
| `tsdown`      | library  | `templates/tsdown`    | `packages/tsdown`  | 使用 tsdown 构建的 TypeScript 库包  |
| `vue-lib`     | library  | `templates/vue-lib`   | `packages/vue-lib` | Vue 3 组件库模板，适合沉淀可复用 UI |
| `vue-hono`    | app      | `templates/client`    | `apps/client`      | Vue 3 + Hono 的前后端一体应用模板   |
| `hono-server` | service  | `templates/server`    | `apps/server`      | Hono API 服务模板                   |
| `vitepress`   | docs     | `templates/vitepress` | `apps/website`     | VitePress 文档站模板                |
| `cli`         | tool     | `templates/cli`       | `apps/cli`         | TypeScript 命令行工具模板           |

## 查看模板

```bash
repo templates
repo templates tsdown
repo templates --category library
```

需要给脚本读取时：

```bash
repo templates --json
repo templates tsdown --json
```

需要同步文档片段时：

```bash
repo templates --markdown
repo templates tsdown --markdown
repo templates --markdown --out docs/templates.md
```

## 创建前预览

```bash
repo new sdk --template tsdown --dry-run
repo new website --template vitepress --dry-run
```

`--dry-run` 不写入磁盘，只展示模板、源目录、目标目录、package name 和输出的 package json 文件。

显式传入的 `--template` 会先校验。模板 key 拼错时，命令会失败并提示相近 key，而不是静默回退到默认模板。

## 健康检查

```bash
repo templates --check
repo templates --check --json
```

模板健康检查会确认：

- 模板 source / target 没有重复。
- 每个模板 source 目录都存在。
- 每个模板根目录都有 `package.json`。
- 每个模板都有 category 和 description。
- 模板源目录里没有会被脚手架过滤掉的临时或生成文件。
