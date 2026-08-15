---
outline: [2, 4]
---

# package.json 中的 entry point 字段

在 `package.json` 中，定义模块的入口点 (`entry point`) 字段是及其重要的

## package.json 代码示例

```jsonc
{
  "name": "icebreaker-npm-basic-package",
  "version": "1.0.0",
  "type": "module",
  "main": "./index.cjs", // CommonJS 主入口（用于 Node require）
  "module": "./index.mjs", // 非标准，但很多构建工具支持（ESM）
  "types": "./index.d.ts", // TypeScript 类型定义
  "exports": {
    ".": {
      "types": "./index.d.ts", // TypeScript 类型定义
      "require": "./index.cjs", // Node require 使用 CommonJS
      "import": "./index.mjs" // Node import 使用 ESM
    }
  }
}
```

### 📝 字段说明：

| 字段               | 说明                                             |
| ------------------ | ------------------------------------------------ |
| `"type": "module"` | 默认将 `.js` 文件视为 ESM                        |
| `"main"`           | Node 中 `require('pkg')` 会使用 CommonJS 文件    |
| `"module"`         | 给打包工具提供 ESM 入口，非标准，但有用          |
| `"exports"`        | 更现代且明确的方式，指明模块格式，兼容 Node >=12 |
| `"types"`          | 给 TypeScript 指明类型定义文件的位置             |

---

官方文档: [package-entry-points](https://nodejs.org/api/packages.html#package-entry-points)

## 为什么说 module 是非标准的?

在 `package.json` 中，`"module"` 字段是一个 **非标准的字段**，但在现代前端工具（如 Webpack、Rollup、Vite 等）中被广泛使用，用于指向 **ES Module 格式的入口文件**，以便这些工具能够做更好的静态分析与 tree-shaking。

下面是不同工具/环境下可能会读取 `"module"` 字段的情况：

---

### ✅ **什么情况下会加载 `"module"` 字段？**

#### **打包工具（Webpack、Rollup、Vite、Snowpack, Parcel 等）**

- 当你使用这些工具打包代码时，它们会优先尝试读取：
  1. `"exports"` 字段（如果存在，优先于其他字段）
  2. `"module"` 字段（通常表示 ESM 格式）
  3. `"main"` 字段（通常表示 CommonJS 格式）

示例：

```js
// 在 Webpack 中引入某个 npm 包时，如果该包的 package.json 有 module 字段
// Webpack 会优先使用这个字段所指向的 ESM 文件
import foo from 'icebreaker-npm-basic-package'
```

> `Vite、Snowpack, Parcel` 这些工具天生以 ESM 为主，会优先读取 `"module"` 字段。

---

### 🚫 **不会加载 `"module"` 字段的情况**

#### **Node.js 本身**

- Node.js 并不识别 `"module"` 字段，加载模块时它依赖的是：
  - `"type"` 字段（决定是否为 ESM 模式）
  - `"main"` 字段（默认入口）
  - 或者直接通过 `"exports"` 字段（推荐现代做法）

例如，在你的 `package.json` 中：

```json
{
  "type": "module",
  "main": "index.cjs",
  "module": "index.js"
}
```

- 你运行 `node .` 时，Node 会根据 `"main"` 加载 `index.cjs`
- 如果你运行 `node index.js`，它会根据文件扩展名和 `"type": "module"` 以 ESM 模式运行，但并不会自动从 `"module"` 字段寻找入口

---

### 推荐现代做法（如要兼容多种环境）：

可以使用 `exports` 字段更明确地配置入口文件：

```jsonc
{
  "exports": {
    ".": {
      "types": "./index.d.ts",
      "require": "./index.cjs",
      "import": "./index.js"
    },
    "./xxx": {
      "types": "./xxx.d.ts",
      "require": "./xxx.cjs",
      "import": "./xxx.js"
    }
  }
}
```

这样，Node.js 和打包工具都能正确识别和区分 ESM 和 CommonJS。

---

### 总结：

| 环境/工具      | 是否使用 `"module"` 字段 | 说明                          |
| -------------- | ------------------------ | ----------------------------- |
| Node.js        | ❌ 不会使用              | 使用 `"main"` 或 `"exports"`  |
| Webpack/Rollup | ✅ 会使用                | 优先用来加载 ESM 版本         |
| Vite/Snowpack  | ✅ 会使用                | 用于选择 ESM 格式             |
| TypeScript     | ❌ 不直接使用            | 会用 `"types"` 字段找类型声明 |
