# @icebreakers/monorepo

[icebreaker](https://github.com/sonofmagic) 的 `monorepo` 升级同步工具

## 使用方式

```sh
# 安装
pnpm add -D @icebreakers/monorepo@latest
# 升级
npx monorepo up
# 帮助文档
npx monorepo -h
```

### 配置文件

在工作区根目录下创建 `monorepo.config.ts`（内容可为普通 ESM），即可覆盖每个命令的默认行为。例如：

```ts
// monorepo.config.ts
import { defineMonorepoConfig } from '@icebreakers/monorepo'

export default defineMonorepoConfig({
  commands: {
    create: {
      defaultTemplate: 'cli',
      renameJson: true,
    },
    clean: {
      autoConfirm: true,
      ignorePackages: ['docs'],
    },
    upgrade: {
      skipOverwrite: true,
      targets: ['.github', 'monorepo.config.ts'],
    },
  },
})
```

目前支持 `create`、`clean`、`sync`、`upgrade`、`init` 与 `mirror` 六类命令的默认参数覆写。

## 文档地址

https://monorepo.icebreaker.top/

## 需求环境

Nodejs >= `v20.11.0`
