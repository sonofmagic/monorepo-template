# 使用打包器

## 选择打包器

一般来说，在不同场景下，需要使用不同的打包器，以下是我的选择:

- `webpack` 我不用，因为打出来的产物代码丑，配置复杂
- `rollup` 我最早用的就是这个，现在不用因为要装的包太多了，而且需要你对打包器有一定的理解，在打包复杂需要高度自定义的场景下使用
- `esbuild` 用的少，直接用不是很方便，但是可以基于它做高度自定义(写插件)
- `tsup` 基于 `esbuild` 的傻瓜无脑式的打包器，非常好用
- `unbuild` 基于 `rollup` 的傻瓜无脑式的打包器，众多 `vite plugin` 源代码的御用打包器，还有基于 `jiti` 的 `stub` 模式，非常好用
- `vite` 基于 `rollup` 的打包器，假如你需要构建前端组件，这个就是首选，毕竟你也懒得去自己处理各种各样的样式文件吧，比如打包新版本 `vue` 组件，只能使用这个的库模式进行打包。
- `rolldown`/`tsdown` 暂时不太稳定，等出正式版本再观望一段时间

所以本篇文章，主要介绍 `tsup` 和 `unbuild` 这两个通用打包器的使用和配置方式，以及 `vite` 库模式进行打包 `vue` 组件，其他的请自行查看对应的文档。

## tsup

本项目的模板之一 [tsup-template](https://github.com/sonofmagic/monorepo-template/tree/main/packages/tsup-template)

:::code-group

```ts [tsup.config.ts]
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'], // , 'src/cli.ts'],
  shims: true,
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  cjsInterop: true,
  splitting: true,
  outExtension({ format }) {
    return {
      js: `.${format === 'esm' ? 'mjs' : 'cjs'}`,
    }
  },
})
```

:::

## unbuild

本项目的模板之一 [unbuild-template](https://github.com/sonofmagic/monorepo-template/tree/main/packages/unbuild-template)

:::code-group

```ts [build.config.ts]
import path from 'node:path'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/index'],
  rollup: {
    inlineDependencies: true,
    emitCJS: true,
    cjsBridge: true,
    dts: {
      respectExternal: false,
    },
  },
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
  declaration: true,
})
```

:::

## vite

本项目的模板之一 [vue-lib-template](https://github.com/sonofmagic/monorepo-template/tree/main/packages/vue-lib-template)

你可以在 [`vite` 库模式官方文档](https://vite.dev/guide/build.html#library-mode) 来查看打包 `vue` 组件的方式

当然这些都已经被配置在 [vue-lib-template](https://github.com/sonofmagic/monorepo-template/tree/main/packages/vue-lib-template) 中了
