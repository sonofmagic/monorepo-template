---
layout: doc
---

# icebreaker's monorepo 模板

这套模板的目标很直接：用一套尽量短、尽量稳定的命令，把 `pnpm + Turborepo + TypeScript + 工程化校验 + changesets` 串成一个真正能落地的 monorepo 起步架子。

如果你只想知道最简单怎么用，先记住下面这 5 步。

## 先这样用

```bash
pnpm install
pnpm setup
pnpm doctor
pnpm new
pnpm check
```

- `pnpm install`：安装整个 workspace 的依赖。
- `pnpm setup`：同步当前仓库推荐的基础元信息和工具链配置。
- `pnpm doctor`：检查你是不是站在正确的仓库根目录、Node 版本对不对、根脚本齐不齐、配置文件有没有冲突、提交链路是否完整。
- `pnpm new`：创建一个新的 package 或 app。
- `pnpm check`：执行推荐的本地校验，适合提交前快速确认。

> 模板生成后的仓库优先推荐使用这些根脚本；底层实际对应的还是 `repo` CLI。`repoctl` 和 `@icebreakers/monorepo` 继续兼容，但不再是主文档入口。

## 最小心智模型

这个模板故意只保留三层命令入口：

| 层级     | 推荐写法                                                 | 适合什么场景                             |
| -------- | -------------------------------------------------------- | ---------------------------------------- |
| 根脚本   | `pnpm setup` / `pnpm new` / `pnpm doctor` / `pnpm check` | 新人日常使用，最短、最不容易记错         |
| 主 CLI   | `pnpm exec repo ...`                                     | 需要明确调用 CLI，或仓库还没同步根脚本时 |
| 分组命令 | `repo ws up` / `repo tg init` / `repo skills sync`       | 已经熟悉命令体系，想走更细粒度入口       |

简单理解：

- 想上手，用 `pnpm ...`
- 想看清楚实际做的是哪个命令，用 `repo ...`
- 想做高级操作，再看分组命令

## 最常用的命令

### 1. 仓库初始化与新建

```bash
pnpm setup
pnpm new my-package
pnpm new my-app --template client
```

- `setup` 是老仓库接入模板标准资产的第一步。
- `new` 支持交互式选择，也支持 `--template` 直接指定模板。
- 如果在 `repoctl.config.ts` 中设置了 `commands.create.defaultTemplate`，那么 `repo new foo` 会直接创建，不再多问一次模板。

### 2. 诊断、校验、同步

```bash
pnpm doctor
pnpm check
pnpm exec repo upgrade
```

- `doctor` 看“仓库能不能顺利开始使用”
- `check` 看“当前改动能不能顺利提交”
- `upgrade` 看“模板最新的标准资产要不要同步进来”

这三个命令不要混着理解：

| 命令      | 解决的问题                                           |
| --------- | ---------------------------------------------------- |
| `doctor`  | 当前目录是不是一个正确、完整、可用的 monorepo 根目录 |
| `check`   | 当前提交前校验是否能过                               |
| `upgrade` | 我要不要把最新模板里的脚本、配置、工作流同步过来     |

## 你现在拿到的基础架子

| 目录                  | 作用                                           |
| --------------------- | ---------------------------------------------- |
| `templates/cli`       | TypeScript CLI 模板                            |
| `templates/client`    | Vue 3 + Vite 客户端模板                        |
| `templates/server`    | Hono 服务端模板                                |
| `templates/tsdown`    | 使用 `tsdown` 的 TypeScript 类库模板           |
| `templates/vue-lib`   | Vue 组件库模板                                 |
| `templates/vitepress` | 文档站模板                                     |
| `packages/monorepo`   | 真正的 CLI 核心实现、升级逻辑、tooling wrapper |
| `packages/repoctl`    | 面向使用者的默认包名与入口封装                 |

## 推荐上手路径

### 场景 1：你刚用模板创建了一个新仓库

```bash
pnpm install
pnpm doctor
pnpm new
pnpm check
pnpm build
```

这时通常不需要先跑 `upgrade`，因为模板本身已经是新生成的。

### 场景 2：你把 `repoctl` 接进一个已有仓库

```bash
pnpm install
pnpm exec repo setup
pnpm exec repo doctor
pnpm exec repo upgrade
pnpm exec repo doctor
```

这里先 `doctor` 一次，是为了看现在缺什么；`upgrade` 之后再跑一次，可以确认问题是不是已经被修平。

## 配置文件约定

推荐只使用一个配置文件：

```txt
repoctl.config.ts
```

兼容旧文件名：

```txt
monorepo.config.ts
```

但两者不能同时存在。现在 CLI 会明确拒绝加载冲突配置，`repo doctor` 也会直接把这个问题标红。

最小示例：

```ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    create: {
      defaultTemplate: 'tsdown',
    },
    upgrade: {
      skipOverwrite: true,
    },
  },
})
```

## 默认质量门禁

模板默认鼓励你走这条链路：

1. `pnpm build`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm tsd`
5. `pnpm test`

如果仓库保留了默认的 `.husky` 与 `lint-staged.config.js`：

- `pre-commit` 会聚焦 staged 文件
- 样式文件会跑 `stylelint`
- JS / TS / Vue 会跑 `eslint`
- TS / Vue 相关文件会按 workspace 跑 `typecheck`
- `pre-push` 会补跑整仓的 `lint`、`typecheck`，以及受影响包的 `build` / `test` / `tsd`

## 下一步看哪里

- 想理解为什么这套模板这样拆：[为什么往 monorepo 方向演进](./monorepo/index.md)
- 想看真实的日常管理方式：[如何管理 monorepo](./monorepo/manage.md)
- 想要最完整的命令速查：[命令速查](./monorepo/commands.md)
- 命令报错了怎么处理：[排障指南](./monorepo/troubleshooting.md)
- 要发包和生成 changelog：[发包与变更日志](./monorepo/publish.md)

## 兼容命令说明

下面这些命令依然可用：

```bash
pnpm exec repoctl doctor
pnpm exec repoctl new
pnpm exec monorepo doctor
pnpm exec monorepo ws up
```

只是文档不再优先推荐它们。现在主入口统一收口到：

- `repo`
- 以及生成仓库里的 `pnpm setup / pnpm new / pnpm doctor / pnpm check`
