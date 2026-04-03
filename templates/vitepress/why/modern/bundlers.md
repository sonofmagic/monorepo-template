# 使用打包器

## 选择打包器

一般来说，在不同场景下，需要使用不同的打包器，以下是我的选择:

- `webpack` 我不用，因为打出来的产物代码丑，配置复杂
- `rollup` 我最早用的就是这个，现在不用因为要装的包太多了，而且需要你对打包器有一定的理解，在打包复杂需要高度自定义的场景下使用
- `esbuild` 用的少，直接用不是很方便，但是可以基于它做高度自定义(写插件)
- `vite` 在 Vite 8 中默认基于 `rolldown` + `oxc`，假如你需要构建前端组件，这个就是首选，毕竟你也懒得去自己处理各种各样的样式文件吧，比如打包新版本 `vue` 组件，只能使用这个的库模式进行打包。
- `rolldown`/`tsdown` 适合更偏向库构建和工具链场景，但生态兼容面和迁移经验仍然不如 `vite`/`rollup` 成熟，是否采用要看你的实际约束

当前这个仓库已经把通用类库模板收敛到 `tsdown`，组件库则继续使用 `vite` 库模式。

## tsdown

本项目当前的通用类库模板是 [tsdown](https://github.com/sonofmagic/monorepo-template/tree/main/templates/tsdown)

:::code-group

```ts [tsdown.config.ts]
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  target: 'node18',
})
```

:::

## vite

本项目的模板之一 [vue-lib](https://github.com/sonofmagic/monorepo-template/tree/main/templates/vue-lib)

你可以在 [`vite` 库模式官方文档](https://vite.dev/guide/build.html#library-mode) 来查看打包 `vue` 组件的方式

当然这些都已经被配置在 [vue-lib](https://github.com/sonofmagic/monorepo-template/tree/main/templates/vue-lib) 中了
