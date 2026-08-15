---
outline: [2, 4]
---

# 如何复用 js 代码

我们知道，不论在什么编程语言里，复用代码最简单的方案就是 `复制粘贴`

然而，复制粘贴会导致代码冗余、难以维护，修改一处逻辑时易漏改其它处，增加出错概率，违背“不要重复自己”（DRY）原则。

假如人人写代码都复制粘贴，这会造成一个工程化的地狱，后期维护成本急剧升高。

为此我们需要有效利用 `模块化` 的思路，去提炼，拆分，复用我们写的代码。

## **代码的模块化**

在现代 `JavaScript` 开发中，**模块化**不仅是一种组织代码的结构化方式，更是实现高效代码复用的核心前提。

### 模块化是复用的基础

1. **明确边界，职责单一**
   模块化将一个大程序拆分为职责清晰、相互独立的功能块（模块）。每个模块完成一个单一任务，这种**高内聚、低耦合**的结构，为复用提供了天然的土壤。

2. **清晰的导入导出机制**
   通过标准的 `export` 和 `import`（或 `CommonJS` 的 `module.exports` / `require`），开发者可以在不同文件、不同项目中复用相同模块，而无需复制粘贴代码。

3. **便于维护与测试**
   模块是可单独测试、维护的最小单元。模块化设计使得一个功能变化不会影响其他模块，增强了系统的稳定性和可扩展性。

4. **为构建通用库打下基础**
   工具函数库（如 `lodash/es-toolkit`）、业务中间件、配置模块、数据处理逻辑等，都是基于模块化原则设计的。只有当代码被封装为模块，它才可能被提取、封装、共享、发布。

### 模块化让复用从被动到主动

非模块化时代的“复用”往往是：

- 复制粘贴代码
- 修改适配不同上下文

而模块化之后，“复用”变成了：

- 明确接口，按需引入
- 参数化、配置化、可扩展

这不仅是形式上的进步，更是软件工程层面的范式跃迁。

### js 模块的典型格式

- **ES Modules（现代浏览器/现代 Node.js）**：标准、推荐，使用 `import` / `export`
- **CommonJS（传统 Node.js）**：使用 `require` / `module.exports`
- **UMD / IIFE / SystemJS / AMD**：一些老式模块化兼容方案，仍用于一些库的打包格式

#### ES Modules (ESM)

目前大部分新的 `npm` 包都使用这个格式发包，

它最大的特点是，使用 `export` / `import` 将功能函数、类、常量等分别放入独立 `.js` 文件中，动态引入的使用 `import()` 进行引入

```js
// utils/math.js
export function add(a, b) {
  return a + b
}

export function multiply(a, b) {
  return a * b
}
```

```js
// main.js
import { add, multiply } from './utils/math'

console.log(add(2, 3)) // 5
console.log(multiply(2, 3)) // 6
```

**这是目前的主流，也是未来的方向**

注意事项：

- 在浏览器中引入，需要使用 `<script type="module">`
- 在 `Node.js` 中需要 `package.json` 设置 `"type": "module"`

---

#### CommonJS (CJS)

在 `ESM` 规范没有被确立之前的社区模块化方案，低版本 `Node.js` 环境使用，高版本 `Node.js` 同时兼容 `CJS` 和 `ESM` 2 种模块化方案和加载策略

最大的特点为，使用 `require` / `module.exports`(`commonjs2`) / `exports`(`commonjs`) 进行模块化

```js
// utils/math.js
function add(a, b) {
  return a + b
}
module.exports = { add }
```

```js
// app.js
const { add } = require('./utils/math.js')

console.log(add(5, 10))
```

新的包不会使用这个格式，目前这个格式的 `npm` 包，也正在逐步向 `ESM` 格式进行迁移

#### AMD (Asynchronous Module Definition)

AMD 是 RequireJS 推广的模块格式，支持异步加载模块，适用于浏览器。

```js
define('myLib', [], () => {
  function hello() {
    return 'Hello from AMD'
  }

  return {
    hello
  }
})
```

**已经过时，不要使用!**

#### UMD （Universal Module Definition）

UMD 是为了同时兼容 CommonJS、AMD 和浏览器环境而设计的模块格式。

```js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory)
  }
  else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory()
  }
  else {
    // Browser global
    root.myLib = factory()
  }
}(this, () => {
  // 模块内容
  function hello() {
    return 'Hello from UMD'
  }

  return {
    hello
  }
}))
```

通常在你使用 `vite` 的 `lib` 模式的时候，除了会打一个 `ESM` 包之外，也会打一个 `UMD` 的包，用于 `CDN` + `SSR` 场景下使用。

#### IIFE （Immediately Invoked Function Expression）

IIFE 是立即执行函数表达式，常用于浏览器中，通常暴露到 `window` 上（无模块系统时的“模拟模块”方式）。

https://developer.mozilla.org/en-US/docs/Glossary/IIFE

```js
(function () {
  function hello() {
    console.log('Hello from IIFE')
  }

  // 暴露到全局
  window.myLib = {
    hello
  }
})()
```

#### SystemJS / System.register

`System` 是由 `ES6 Module Loader` 提出的一种格式，现代打包工具（如 `Rollup`）可以输出此格式，用于运行时动态加载 `ES Modules`。

`SystemJS` 就是帮助你在不支持原生 `ESM` 格式的浏览器上(比如IE11)，使用 `ESM` 格式

```js
System.register(['./constants'], (exports) => {
  return {
    execute() {
      function hello() {
        console.log('Hello from System')
      }

      exports('hello', hello)
    }
  }
})
```

加载方式（需要 `SystemJS` 库）：

```html
<script src="https://cdn.jsdelivr.net/npm/systemjs/dist/system.js"></script>
<script>
  System.import('/path/to/your-module.js').then(({ hello }) => hello())
</script>
```

比如 `@vitejs/plugin-legacy` 这个浏览器降级兼容方案，就是使用 `SystemJS` 在老旧的浏览器里面，加载 `ESM` 格式，从而进行兼容的。

#### 参考链接

- [rollupjs](https://rollupjs.org/configuration-options/#output-format)
- [webpackjs](https://webpack.js.org/configuration/output/#module-definition-systems-1)
- [esbuild](https://esbuild.github.io/api/#format)
- [swc](https://swc.rs/docs/configuration/modules)
- [babel](https://babeljs.io/docs/babel-preset-env#modules)
- [typescript](https://www.typescriptlang.org/tsconfig/#module)

## 一些复用方式

### **利用路径 alias 复用代码**

在纯 JS 工程中，如果使用构建工具如 Vite / Webpack，可以配置别名路径：

```js
// vite.config.js
export default {
  resolve: {
    alias: {
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
}
```

然后在代码中：

```js
import { add } from '@utils/math.js'
```

但是这种方式，仅在构建工具中生效，假如一个项目不用任何的构建工具，这个方案就不行了。

### **发布为 npm 本地包 / 私有包 / 公共包**

绝大部的场景都应该使用这个方案，来达到跨项目复用代码的目的。

这也是官方和社区推荐的方案。

接下来让我们开始 `npm` 包发布的旅程吧！
