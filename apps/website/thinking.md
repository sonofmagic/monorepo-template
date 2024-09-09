# 我对 monorepo 的思考

## 前言

最近自己新开的项目都用了自己的 [monorepo-template](https://github.com/sonofmagic/monorepo-template) 模板来生成，

也对这个模板做了不少的改进，趁这个机会，讲一讲它的一个演变过程，以及我对 `monorepo` 的一些思考。

## 它的由来

为了应对越来越多的发包场景，我创建了 [npm-lib-template](https://github.com/sonofmagic/npm-lib-template) 模板

这是一个 `git` 单仓单 `npm` 包模板，使用 `rollup` 进行打包，然后再发布到 `npm` 和 `github`

随着项目不断地变大，发现在编写包地时候，经常需要去编写对应地文档网站，或者是使用其他包去进行引用，然后再次发包的情况

这种时候，[npm-lib-template](https://github.com/sonofmagic/npm-lib-template) 模板就难以满足我的需求

于是我决定要创建一个 [monorepo-template](https://github.com/sonofmagic/monorepo-template) 项目模板

## 技术选型

### 管理

在 monorepo 的管理上，我使用了 `pnpm` + `turborepo` 的方式，原因是因为它们快

`pnpm` 节省磁盘空间， `turborepo` 有缓存

### 语言与打包

项目使用纯 typescript 来编写，再使用 `tsup` / `unbuild` 进行打包，打出 cjs 和 esm 格式，再通过 package.json 里的字段进行分发

tsx 也很好用，非常适合调试

### 代码规范与质量

使用 eslint 和 stylelint 使用 `@icebreakers/eslint-config` 和 `@icebreakers/stylelint-config` 来进行代码的规范化和格式化

这个是我自己提炼的代码规范包，添加 `.vscode` 来推荐一些插件，和设置一些编辑器选项

然后再通过 `husky` 添加 `git hook`，与 `lint-staged` 配合对提交的代码进行校验，与 `commitlint` 结合，对开发者提交的 `git` 信息进行规范化

### 发包

都使用的 `changesets`，它发布 `monorepo` 非常的好用

### Github 相关

.github 目录下，提供了默认的 CI/CD 流程，还有用户提 issue 时候的模板，只需要少许配置就能自动发 npm 包，打 git tag 和发 github 包

除此之外还有，许多目录下的 md 文档，也是为了 Github 的显示

## 部署

`netlify.toml` 把文档网站部署到 `netlify`
