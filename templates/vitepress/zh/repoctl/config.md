# 配置文件

repoctl 推荐在仓库根目录使用一个配置文件：

```txt
repoctl.config.ts
```

`monorepo.config.ts` 已不再作为运行时配置入口。迁移旧仓库时请改名为 `repoctl.config.ts`。

repoctl 支持 `ts`、`mts`、`cts`、`js`、`mjs`、`cjs` 等配置文件后缀。新项目优先使用 `repoctl.config.ts`，这样能保留类型提示和更清晰的迁移路径。

## 最小配置

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

设置 `commands.create.defaultTemplate` 后：

```bash
repo new utils
```

会直接按默认模板创建，不再询问模板类型。

## 常用配置

```ts
import { defineMonorepoConfig } from 'repoctl'

export default defineMonorepoConfig({
  commands: {
    init: {
      preset: 'standard',
    },
    create: {
      defaultTemplate: 'tsdown',
    },
    clean: {
      autoConfirm: true,
    },
    upgrade: {
      skipOverwrite: true,
    },
  },
})
```

| 配置                              | 作用                                    |
| --------------------------------- | --------------------------------------- |
| `commands.init.preset`            | 控制初始化默认预设                      |
| `commands.create.defaultTemplate` | 控制 `repo new <name>` 的默认模板       |
| `commands.clean.autoConfirm`      | 清理命令是否默认确认                    |
| `commands.upgrade.skipOverwrite`  | 同步标准资产时是否保留已有 drifted 文件 |

## 查看当前配置

```bash
repo config inspect
repo cfg i --json --out reports/config.json
repo cfg i --markdown --redact --out reports/config.md
```

`--redact` 适合把报告发到 issue、PR 或外部协作渠道。

## 配置的定位

配置文件只负责团队默认值，不建议把一次性命令参数都写进去。

推荐做法：

- 团队长期一致的选择写进 `repoctl.config.ts`。
- 临时行为用命令参数表达，例如 `--dry-run`、`--json`、`--out`。
- 自动化脚本优先使用显式参数，减少隐藏状态。

## 继续阅读

- [执行模型](./execution-model.md)
- [模板与创建](./templates.md)
- [模板资产治理](./template-assets.md)
- [报告与自动化输出](./reports.md)
