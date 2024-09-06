---
# https://vitepress.dev/reference/default-theme-home-page
layout: doc
---

# icebreaker's monorepo 模板

## 功能特性

- 强大的 `monorepo` 管理 (`pnpm` + `turborepo`)
- 单元测试 (`vitest`)
- 包括 `cli bin` 全部都是 `typescript`
- 代码规范与质量 (`eslint` + `@icebreakers/eslint-config` + `@icebreakers/stylelint-config`)
- `git` 提交规范 (`husky` + `commitlint` + `lint-staged`)
- `pnpm` 部署 `Docker` 模板
- `Github Action` 自动发布 `npm`, `github release` 包 (`changeset`)
- 配置文件同步升级 `npx @icebreakers/monorepo@latest`

## 如何使用？

## 配置自动发包

[changesets](https://github.com/changesets/changesets)

首先你需要做一些配置：

首先你需要安装 `Github App`: [changeset-bot](https://github.com/apps/changeset-bot)

然后，来到你复制这个模板仓库(`repo`), 上方里的 `Settings` Tab 页面

### Github PR 与发包

选择 `Code and automation` > `Actions` > `General`

然后在右侧 `Workflow permissions` 下方选择: `Read and write permissions`

然后选中 `Allow GitHub Actions to create and approve pull requests`

然后保存即可。

这样 `changeset` 就有权限对你进行 `PR` 和代码版本更新了！

### npm 发包

选择 `Security` > `Secrets and variables` > `Actions`

然后在右侧的 `Repository secrets` 设置你的 `NPM_TOKEN` 这个可以在你的 `npmjs.com` 账号中生成获取

(假如你需要单元测试代码覆盖率，你需要设置 `CODECOV_TOKEN`)

### eslint + stylelint 校验

引用到的规则参考 `https://eslint.icebreaker.top/`

[Github 地址](https://github.com/sonofmagic/eslint-config)

## 配置同步方式

`npx @icebreakers/monorepo@latest`

这个命令会把所有的文件从最新版本，对你本地进行覆盖，你可以从 `git` 暂存区把你不想要的文件剔除

### 参数

`npx @icebreakers/monorepo@latest --raw`

这个命令会从全部文件中去除 `Github` 相关的文件

`npx @icebreakers/monorepo@latest -i`

这个命令会进行命令行选择模式，你可以在这里对想要复制的文件进行筛选

当然你可以同时使用这 `2` 个命令

`npx @icebreakers/monorepo@latest -i --raw`
