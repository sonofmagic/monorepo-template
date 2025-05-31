---
layout: doc
---

# icebreaker's monorepo 模板

## 功能特性

- 强大的 `monorepo` 管理 (`pnpm` + `turborepo`)
- 单元测试框架集成 (`vitest`)
- 全部都是 `typescript`, 包括 `应用` `类库` 与 `cli` 工具
- 代码规范与质量 (`eslint` + `@icebreakers/eslint-config` + `@icebreakers/stylelint-config`)
- `git` 提交规范 (`husky` + `commitlint` + `lint-staged`)
- `pnpm` `Dockerfile` 部署模板
- `Github Action` 自动发布 `npm`, `github release` 包 (`changeset`)
- 配置文件同步升级 `npx @icebreakers/monorepo@latest`

## 如何使用？

首先，访问本模板的 [Github 地址](https://github.com/sonofmagic/monorepo-template)，然后按照一下条件:

- 有 `Github` 账号的，可以登录后，点击右上角的 `Use this template` 按钮

- 没有 `Github` 账号的，可以点击 `Code` 按钮，把这个仓库的源码，或 `clone` 或下载到本地

然后在根目录 (`pnpm-workspace.yaml` 所在的位置) 执行 `pnpm i` 去安装依赖

> 要求 `Nodejs` >= 20，没有 `pnpm` 的，可以使用 `npm i -g pnpm` 来进行安装。
>
> 什么! 你不会连 [`Nodejs`](https://nodejs.org/en) 还没安装吧？

## 清除不必要的代码

执行 `pnpm script:clean` 命令，可以删去大部分的初始 `repo`，只保留一个 `@icebreakers/unbuild-template` 项目作为发包打包模板。

`clean` 命令执行完成之后，再去执行 `pnpm i` 来更新 `pnpm-lock.yaml`, 并提交 `pnpm-lock.yaml` 文件来锁定 `npm` 包的版本。

## 初始化文件

执行 `pnpm script:init` 命令，这个命令会批量修改你关联的配置文件，并生成一份新的 `README.md`

## 模板包介绍

默认模板被放在根目录的 `packages` 和 `apps` 这 `2` 个目录里面

### packages 目录

- `@icebreakers/tsup-template` - [`tsup`](https://www.npmjs.com/package/tsup) 打包的库模板
- `@icebreakers/unbuild-template` - [`unbuild`](https://www.npmjs.com/package/unbuild) 打包的库模板
- `@icebreakers/monorepo` - 本仓库的更新配置服务，可直接根目录执行 `npx @icebreakers/monorepo@latest` 执行远端 `cli` 命令，进行项目依赖升级同步
- `@icebreakers/vue-lib-template` - [`vue3`](https://vuejs.org/) 组件库模板，使用 `vite` 打包

### apps 目录

- `@icebreakers/cli` - 使用 `typescript` 编写的 `cli` 程序模板
- `@icebreakers/website` - 文档网站模板，使用 `vitepress` 搭建，也是 [monorepo.icebreaker.top](https://monorepo.icebreaker.top/) 的源代码
- `@icebreakers/server` - 使用 `hono` 搭建的服务端模板，使用 `typescript` 编写

## 更新包的依赖

在根目录中执行 `pnpm up -rLi` 来进行包的交互式更新，下面是解释:

- `-r` : `recursive` 递归选中所有 `repo`
- `-L` : `latest` 更新到最新
- `-i` : `interactive` 交互式

## 配置自动发包

本项目使用 [changesets](https://github.com/changesets/changesets) 进行包的发布和 `changelog` 的生成

在使用的时候，首先你需要做一些配置：

1. 首先你需要安装 `Github App`: [changeset-bot](https://github.com/apps/changeset-bot)

2. 然后，来到你复制这个模板仓库(`repo`), 上方里的 `Settings` Tab 页面，进行 2 个操作:

### 1. 在 Github 进行 PR 和发包

选择 `Code and automation` > `Actions` > `General`

然后在右侧 `Workflow permissions` 下方选择: `Read and write permissions`

然后选中 `Allow GitHub Actions to create and approve pull requests`

最后，点击下方的保存按钮即可。

这样 `changeset` 就有权限对你进行 `PR` 和代码版本更新了！

### 2. 在 npm 发包

选择 `Security` > `Secrets and variables` > `Actions`

然后在右侧的 `Repository secrets` 设置你的 `NPM_TOKEN` 这个可以在你的 `npmjs.com` 账号中生成获取

(假如你需要单元测试代码覆盖率，你需要设置 `CODECOV_TOKEN`)

## eslint + stylelint 校验

引用到的规则参考 `https://eslint.icebreaker.top/`

[Github 地址](https://github.com/sonofmagic/eslint-config)

## 内置脚本

- `pnpm script:clean` 删去大部分的初始`repo`，只保留一个 `@icebreakers/bar` 项目作为发包打包模板
- `pnpm script:init` 初始化一些 `package.json` 里的字段
- `pnpm script:sync` 使用 `cnpm sync` 功能，把本地所有的包，同步到 [`npmmirror`](https://www.npmmirror.com/) 上，需要安装 `cnpm`
- `pnpm script:mirror` 使用 `cnpm` binary mirror 功能，使用国内二进制下载地址 (使用 vscode 环境变量)

## 创建新的项目

在 `monorepo` 的任意位置，打开命令行，然后执行 `npx monorepo new` 即可进入交互模式创建一个空的类库，

可通过传入 **可选**参数 `path` 进行修改, 比如 `npx monorepo new [path]`, 此时的目录就从 `foo` 变为了 `[path]`

> 命令 `new` 的别名为 `create`, 也可以使用 `npx monorepo create` 来创建新的项目

## 配置同步方式

在根目录下执行: `npx @icebreakers/monorepo@latest`

这个命令会把所有的文件从最新版本，对你本地进行覆盖，你可以从 `git` 暂存区把你不想要的文件剔除

### 参数

`npx @icebreakers/monorepo@latest --raw`

这个命令会从全部文件中去除 `Github` 相关的文件

`npx @icebreakers/monorepo@latest -i`

这个命令会进行命令行选择模式，你可以在这里对想要复制的文件进行筛选

当然你可以同时使用这 `2` 个命令

`npx @icebreakers/monorepo@latest -i --raw`
