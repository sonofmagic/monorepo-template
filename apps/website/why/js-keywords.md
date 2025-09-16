# CJS 和 ESM 关键字/全局变量对比

## 📦 CommonJS (CJS)

CJS 是 Node.js 默认的老模块系统，使用 `require` 和 `module.exports`。

### 核心关键字 / 全局变量

- **`require`**
  用于导入模块，例如：`const fs = require("fs")`
- **`module.exports`**
  导出一个模块的接口对象。
- **`exports`**
  是 `module.exports` 的引用，常用于简写导出。
- **`__filename`**
  当前模块的绝对路径（包含文件名）。
- **`__dirname`**
  当前模块所在目录的绝对路径。
- **`arguments`**
  在函数中依然可用，但不是模块特有的（ESM 中的顶层不再支持）。

### 特点

- 模块加载是 **同步的**（`require` 立即执行）。
- 每个文件就是一个模块，作用域隔离。
- Node.js 原生支持。

## 🌐 ECMAScript Modules (ESM)

ESM 是 JavaScript 官方标准，现代浏览器和 Node.js 都支持（需要 `.mjs` 或 `package.json` 配置 `"type": "module"`）。

### 核心关键字 / 特性

- **`import`**
  用于引入模块：
  - `import fs from "fs"`
  - `import { readFile } from "fs"`

- **`export`**
  导出模块：
  - `export default function() {}`
  - `export const x = 1`

- **`import.meta`**
  提供关于当前模块的元信息（例如：`import.meta.url` 获取模块的文件路径 URL）。
- **`top-level await`**
  在 ESM 顶层作用域中可以直接使用 `await`。

### 特点

- 模块加载是 **异步的**。
- 静态结构，编译时可确定依赖关系。
- 更加标准化，支持 Tree-shaking（构建时优化）。

## 🚧 差异对照表

| 特性             | CommonJS (CJS)               | ECMAScript Modules (ESM)          |
| ---------------- | ---------------------------- | --------------------------------- |
| 导入             | `require()`                  | `import`                          |
| 导出             | `module.exports` / `exports` | `export` / `export default`       |
| 文件扩展名       | `.cjs` / `.js`               | `.mjs` / `.js`                    |
| 文件路径变量     | `__filename`, `__dirname`    | ❌（可用 `import.meta.url` 替代） |
| 模块元信息       | ❌                           | `import.meta`                     |
| 异步顶层 `await` | ❌                           | ✅                                |
| 加载方式         | 同步                         | 异步                              |

---

👉 例如，ESM 中没有 `__filename` 和 `__dirname`，你需要用以下方式替代：

```js
import { dirname } from 'node:path'
// ESM 中获取 __dirname 效果
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

## 📦 CommonJS (CJS) — 清除模块缓存

CJS 使用 `require()` 加载模块时，**会把模块对象缓存在 `require.cache` 里**。如果想清除缓存，可以操作这个对象。

### 关键方式

```js
// 加载模块
const mod = require('./foo.js')

// 清除缓存
delete require.cache[require.resolve('./foo.js')]

// 重新加载
const freshMod = require('./foo.js')
```

- `require.resolve()` 会返回模块的绝对路径，用它作为 key 来删除缓存。
- 删除后，再次 `require()` 会重新执行模块代码。

⚠️ 注意：

- 如果模块被多个文件引用，删除缓存只影响 **当前模块**，依赖树中的引用关系可能导致“旧对象”仍在内存中。
- 所以要真正“重载”模块，有时需要递归删除依赖树的缓存。

## 🌐 ECMAScript Modules (ESM) — 清除模块缓存

ESM 的模块缓存存放在 **`import` 的内部 Module Map** 中，规范里没有暴露直接操作缓存的方法。
不过在 **Node.js 环境** 中，可以通过 **动态导入 (`import()`)** + **带查询参数** 或 **利用 `vm` / Loader Hooks** 来实现类似效果。

### 常用方式 1：加查询参数绕缓存

```js
const mod1 = await import(`./foo.js?update=${Date.now()}`)
const mod2 = await import(`./foo.js?update=${Date.now()}`)
```

- 每次加上不同的 querystring，就会绕过缓存，强制重新加载。

### 常用方式 2：使用 `import()` + `Module.createRequire`

在 Node.js 18+ 里，可以通过 `vm` 的上下文重新加载模块，不过相对复杂。一般开发调试时用 **动态 `import()` 加 query** 就够了。

## 🚧 对比总结

| 功能               | CommonJS (CJS)                            | ECMAScript Modules (ESM)            |
| ------------------ | ----------------------------------------- | ----------------------------------- |
| 缓存位置           | `require.cache`                           | 内部 **Module Map**（不可直接访问） |
| 清除缓存方法       | `delete require.cache[require.resolve()]` | ❌ 无官方 API                       |
| 实际可行的清除方法 | 直接删除缓存并重新 `require()`            | 动态 `import()` 加唯一参数绕过缓存  |
| 典型应用场景       | 热重载、插件系统                          | 热重载、调试时强制刷新模块          |

<!-- 👉 要不要我帮你写一个 **CJS + ESM 通用的“热重载工具函数”**，比如 `reloadModule(path)`，可以自动检测当前运行环境，然后清除缓存并重新加载？这样你写代码时可以直接用，而不用区分 require/import。 -->
