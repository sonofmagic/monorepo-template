# ESM vs CJS

在 Node.js 中，ESM（ECMAScript Modules）和 CJS（CommonJS）是两种模块系统。ESM 是 JavaScript 官方标准的模块系统，而 CJS 是 Node.js 最初采用的模块系统。

## ESM 相对 CJS 的优势

### 1. **官方标准化**

- **ESM 是 ECMAScript 的官方模块规范**，跨平台和跨环境（如浏览器、Deno）都支持。
- 更有利于代码的可移植性和与未来标准兼容。

### 2. **静态分析能力更强**

- ESM 使用 `import` / `export`，**在解析阶段即可确定依赖关系**，这让：
  - Tree Shaking（去除无用代码）成为可能。
  - 更好地进行工具分析（如 Webpack、Rollup）。

### 3. **支持异步加载**

- ESM 模块加载是**异步的**，允许更灵活的模块加载策略（尤其适合在浏览器环境或网络环境下）。
- 支持 `import()` 动态导入，可以实现按需加载。

### 4. **更好的模块作用域**

- 每个 ESM 模块都有自己的作用域，**默认是严格模式**（`use strict`），无需显式声明。
- 避免了 CJS 中的某些副作用或全局变量污染问题。

### 5. **顶层 `await` 支持**

- 在支持的环境下，ESM 模块可以使用**顶层 await**，这在处理异步初始化逻辑时非常方便。

### 6. **统一生态趋势**

- 越来越多的现代 JavaScript 项目和库采用 ESM，比如 Vite、ESBuild、Deno 等工具链优先支持 ESM。

---

## 对比小结

| 特性              | ESM                   | CommonJS (CJS)               |
| ----------------- | --------------------- | ---------------------------- |
| 模块语法          | `import` / `export`   | `require` / `module.exports` |
| 加载方式          | 静态分析 + 异步加载   | 运行时同步加载               |
| 标准化            | 是（ECMAScript 标准） | 否（Node.js 专有）           |
| Tree Shaking 支持 | ✅                    | ❌                           |
| 顶层 await 支持   | ✅（Node.js ≥ 14.8）  | ❌                           |
| 浏览器支持        | ✅                    | ❌                           |
| 动态导入          | `import()`            | `require()`                  |

---

## 使用 ESM 的注意事项（在 Node.js 中）

- `package.json` 中需要设置 `"type": "module"`。
- 文件扩展名必须为 `.mjs` 或 `.js`（视 `type` 而定）。
- `__filename`、`__dirname` 等 Node.js CJS 特有变量不可直接使用（需 `import.meta.url` 代替, 高版本 `Nodejs` 可以使用 `import.meta.dirname` 和 `import.meta.filename`）。

---

## 适合使用 ESM 的场景

- 对于新项目，不论是前端还是服务端，你应该始终使用 `ESM`。
- 需要兼容浏览器或打包工具的项目
- 有 `Tree Shaking` 需求的库开发

## esm 中使用 require

在 `esm` 格式中的 `js` 中使用 `require` 会报错

```sh
ReferenceError: require is not defined in ES module scope, you can use import instead
```

另外也有一种适用于 `nodejs` 的 `esm` 中使用 `require` 做法:

```js
import { createRequire } from 'node:module'

const require = createRequire(import.meta.filename)

const { sayHello } = require('icebreaker-npm-basic-package')

sayHello()
```
