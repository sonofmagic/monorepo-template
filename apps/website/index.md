---
# https://vitepress.dev/reference/default-theme-home-page
layout: doc

# hero:
#   name: "icebreaker's monorepo"
#   text: "auto upgrade monorepo"
#   tagline: My great project tagline
#   actions:
#     - theme: brand
#       text: Markdown Examples
#       link: /markdown-examples
#     - theme: alt
#       text: API Examples
#       link: /api-examples

# features:
#   - title: Feature A
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature B
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature C
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---

# icebreaker's monorepo 模板

## 功能特性

- 功能强大的 `monorepo` (`pnpm` + `turborepo`)
- 单元测试 (`vitest`)
- 全部都是 `typescript`, 包括 `cli bin`
- 代码规范与质量 (`eslint` + `@icebreakers/eslint-config`)
- `git` 提交规范 (`husky` + `commitlint` + `lint-staged`)
- `pnpm` 部署 `Docker` 模板
- `Github Action` 自动发布 `npm`, `github release` 包 (`changeset`)
- 配置文件可控升级 `@icebreakers/monorepo`

## eslint

引用到的规则参考 `https://eslint.icebreaker.top/`

[Github 地址](https://github.com/sonofmagic/eslint-config)

## 升级方式

`npx @icebreakers/monorepo@latest`

这个命令会把所有的文件从最新版本，对你本地进行覆盖，你可以从 `git` 暂存区把你不想要的文件剔除

### 参数

`npx @icebreakers/monorepo@latest --raw`

这个命令会从全部文件中去除 `Github` 相关的文件

`npx @icebreakers/monorepo@latest -i`

这个命令会进行命令行选择模式，你可以在这里对想要复制的文件进行筛选

当然你可以同时使用这 `2` 个命令

`npx @icebreakers/monorepo@latest -i --raw`
