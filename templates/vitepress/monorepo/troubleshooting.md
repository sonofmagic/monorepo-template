# 排障指南

这一页不讲原理，直接讲最常见的问题和对应动作。

## 第一反应：先跑 `repo doctor`

如果你不确定问题在哪，先执行：

```bash
pnpm doctor
```

它会优先帮你排这些低成本但高频的问题：

- 当前目录不是仓库根目录
- 缺少 `pnpm-workspace.yaml`
- Node 版本不满足要求
- 根 `package.json` 没装 `repoctl` / `@icebreakers/monorepo`
- 根快捷脚本没同步齐
- `repoctl.config.ts` 与 `monorepo.config.ts` 同时存在
- `.husky/pre-commit` 和 `lint-staged.config.js` 只配了一半

## 常见问题

### 1. 提示当前目录不像 monorepo 根目录

通常是因为你在子包目录里执行了命令，或者根目录缺少这些文件：

```txt
package.json
pnpm-workspace.yaml
```

先回到根目录再执行。

### 2. Node 版本不满足要求

看根 `package.json`：

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

切到满足要求的 Node 版本后，再跑：

```bash
pnpm install
pnpm doctor
```

### 3. `repoctl.config.ts` 和 `monorepo.config.ts` 同时存在

这是明确的冲突状态，不是“都能读”。

处理方式：

- 保留 `repoctl.config.ts`
- 删除 `monorepo.config.ts`

除非你在迁移历史仓库，否则没有必要双持。

### 4. 根脚本没有 `setup` / `new` / `check` / `doctor`

先同步一次标准资产：

```bash
pnpm exec repo upgrade
```

如果你只是不想等，也可以手动把这些脚本加回根 `package.json`。

### 5. 提交前校验没有正常工作

先检查这两个文件是不是同时存在：

```txt
.husky/pre-commit
lint-staged.config.js
```

只存在一个，通常就是半残状态。

可选动作：

```bash
pnpm exec repo upgrade
pnpm check
```

### 6. `repo` 命令不可用

通常是依赖还没安装，或者当前仓库没把 CLI 包放进根依赖。

先执行：

```bash
pnpm install
pnpm doctor
```

如果根本没有安装 CLI 依赖，补一个即可：

```bash
pnpm add -D repoctl
```

## `doctor` 和 `check` 的区别

很多人遇到问题会这两个命令来回试，其实职责不同：

| 命令     | 更像什么   |
| -------- | ---------- |
| `doctor` | 仓库体检   |
| `check`  | 提交前校验 |

如果你怀疑是“仓库架子不完整”，先用 `doctor`。
如果你怀疑是“这次改动过不了 lint / typecheck / test”，先用 `check`。

## 什么时候需要 `upgrade`

下面这些情况，优先考虑 `repo upgrade`：

- 文档里的根脚本在你仓库里没有
- 默认的 Husky / lint-staged / config 资产缺失
- 模板最近更新过，而你的仓库还是旧结构
- 你希望重新同步推荐默认值

## 一个实用排查顺序

大多数问题按这个顺序处理最省时间：

```bash
pnpm install
pnpm doctor
pnpm exec repo upgrade
pnpm doctor
pnpm check
pnpm build
```

思路是：

1. 先把依赖装齐
2. 先修仓库架子问题
3. 再看当前改动的校验问题

## 还有问题时看哪里

- 日常命令边界不清楚：[命令速查](./commands.md)
- 不确定仓库怎么管理：[如何管理 monorepo](./manage.md)
- 发包问题：[发包与变更日志](./publish.md)
