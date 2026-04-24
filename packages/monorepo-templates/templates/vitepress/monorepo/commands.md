# 命令速查

这一页只保留高频、实用、容易记错的命令。

## 最推荐的入口

在模板生成后的仓库里，优先使用根脚本：

```bash
pnpm setup
pnpm doctor
pnpm new
pnpm check
```

对应关系如下：

| 根脚本        | 实际等价命令  |
| ------------- | ------------- |
| `pnpm setup`  | `repo setup`  |
| `pnpm doctor` | `repo doctor` |
| `pnpm new`    | `repo new`    |
| `pnpm check`  | `repo check`  |

## 上手四连

### 新仓库

```bash
pnpm install
pnpm doctor
pnpm new
pnpm check
```

### 存量仓库接入

```bash
pnpm install
pnpm exec repo setup
pnpm exec repo doctor
pnpm exec repo upgrade
pnpm exec repo doctor
```

## 顶层命令

### `repo setup`

```bash
repo setup
repo setup --preset minimal
repo setup --preset standard --force
```

用途：

- 初始化当前 workspace 的推荐默认值
- 同步 README / package.json / changeset / tooling 相关基础资产

### `repo doctor`

```bash
repo doctor
```

用途：

- 诊断当前目录是不是可直接开始使用的 monorepo 根目录
- 检查 Node 版本、workspace 文件、CLI 依赖、根脚本、配置冲突、提交链路

### `repo new`

```bash
repo new
repo new sdk --template tsdown
repo new docs --template vitepress
```

用途：

- 交互式或直接创建新的 package / app

### `repo check`

```bash
repo check
repo check --staged
repo check --full
repo check --edit-file .git/COMMIT_EDITMSG
```

用途：

- 运行推荐的本地校验入口
- `--staged` 偏 pre-commit
- `--full` 偏 pre-push
- `--edit-file` 用于 commit message 校验

### `repo upgrade`

```bash
repo upgrade
repo upgrade --core
repo upgrade -i
repo upgrade -s
```

用途：

- 同步仓库标准资产与脚本

常见参数：

- `--core`：只同步核心配置，跳过 GitHub 相关资产
- `-i`：交互式选择
- `-s`：跳过新增，只覆盖已存在文件

### 兼容命令

```bash
repo sync
repo clean --yes
repo mirror
```

- `sync`：兼容入口，本质上仍是升级同步
- `clean`：清理选中的 workspace 包
- `mirror`：设置 VS Code 相关镜像环境变量

## 分组命令

### workspace / ws

```bash
repo workspace upgrade
repo ws up
repo workspace init
repo workspace clean --yes
```

### tooling / tg

```bash
repo tooling init eslint vitest
repo tg init --all --force
```

### package / pkg

```bash
repo package create
repo pkg new
```

### verify / v

```bash
repo verify pre-commit
repo verify pre-push
repo verify commit-msg .git/COMMIT_EDITMSG
repo verify staged-typecheck packages/app/src/main.ts
```

### skills / sk

```bash
repo skills sync --codex
repo sk s --claude
```

### ai / ai p

```bash
repo ai prompt create --name checkout
repo ai p new
repo ai prompt create --tasks agentic/tasks.json -f
```

## `repo`、`repoctl`、`monorepo` 的关系

三者共用同一套 CLI 实现：

```bash
repo doctor
repoctl doctor
monorepo doctor
```

都能用，但推荐顺序是：

1. `pnpm setup / doctor / new / check`
2. `repo ...`
3. `repoctl ...` 或 `monorepo ...` 仅作为兼容入口

## 什么时候用哪个命令

| 你的问题                   | 先用什么       |
| -------------------------- | -------------- |
| 仓库是不是搭对了           | `repo doctor`  |
| 我现在这次改动能不能过校验 | `repo check`   |
| 我要补齐模板最新脚本和配置 | `repo upgrade` |
| 我要新增一个子包           | `repo new`     |
| 我要直接操作更细的模块     | 分组命令       |
