# js 文件的各种后缀

下面用一张“速查表”+要点说明，把这些扩展名分别讲清楚，并说明各自**在什么情况下会被当作可执行模块加载**，以及**谁来消费它**。

## 速查表

| 扩展名  | 语义                                               | 由谁执行/消费                                        | 何时被当作“可运行的模块”加载                                                                                                                                                                                                      |
| ------- | -------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.js`   | JavaScript 源码（CJS 或 ESM，取决于上下文）        | Node、浏览器、打包器                                 | **Node**：受 `package.json` 的 `"type"` 影响——`"type":"module"` 时按 **ESM** 解析，否则按 **CommonJS**。**浏览器**：始终当作 JS，是否是模块取决于 `<script type="module">`（ESM）还是普通 `<script>`（经典脚本）。                |
| `.cjs`  | JavaScript（**强制 CommonJS**）                    | Node、打包器                                         | **Node**：始终按 **CommonJS** 加载，与 `package.json` 的 `"type"` 无关。                                                                                                                                                          |
| `.mjs`  | JavaScript（**强制 ESM**）                         | Node、浏览器、打包器                                 | **Node**：始终按 **ESM** 加载。**浏览器**：当作普通 JS 文件；是否作为模块取决于 `<script type="module">`。                                                                                                                        |
| `.ts`   | TypeScript 源码（模块语义由编译目标/解析策略决定） | **TS 编译器/工具链**（tsc、ts-node、tsx、Vite 等）   | 不是原生可执行；需经编译或运行时加载器将其转成 `.js`。在 TS 的 `moduleResolution`=NodeNext/Node16 下，`.ts` 的产物会遵循对应的 CJS/ESM 规则。                                                                                     |
| `.cts`  | TypeScript，**指定生成 CommonJS**                  | TS 编译器/工具链                                     | 同上；不由 Node 直接执行。编译后产出 `.cjs/.js`（CJS 语义），并可生成 `.d.cts`。                                                                                                                                                  |
| `.mts`  | TypeScript，**指定生成 ESM**                       | TS 编译器/工具链                                     | 同上；不由 Node 直接执行。编译后产出 `.mjs/.js`（ESM 语义），并可生成 `.d.mts`。                                                                                                                                                  |
| `.d.ts` | **类型声明文件**（仅类型，无运行时）               | TypeScript 编译器、编辑器/语言服务、打包器的类型阶段 | **永不执行**。仅在类型检查/智能提示/发布类型时被“读取”。若包的 `package.json` 有 `"types": "index.d.ts"`（或在 `exports` 的 `types`/ `typesVersions` 配置），TS 会用它做类型来源。也存在 `.d.mts` / `.d.cts` 变体以对应 ESM/CJS。 |

# 关键规则与细节

1. **Node.js 如何决定 CJS vs ESM（针对 `.js`）**
   - 在某个包目录（有 `package.json`）下：
     - `package.json` 有 `"type": "module"` → 该目录内的 **`.js`** 默认视作 **ESM**。
     - 否则（默认 `"type":"commonjs"`）→ **`.js`** 默认视作 **CommonJS**。

   - **`.mjs` 一律 ESM，`.cjs` 一律 CJS**，不受 `"type"` 影响。
   - 混合项目的常见做法：`"type":"module"` + 把需要 CJS 的文件命名为 `.cjs`；或反之。

2. **浏览器如何加载**
   - 浏览器不关心 `.mjs/.cjs` 这些“Node 语义”扩展名本身；它看的是 `<script>` 标签：
     - `<script type="module" src="...">` → ESM 模式（支持 `import`）。
     - `<script src="...">` → 经典脚本（全局作用域，无模块语义）。

   - 资源的 **MIME 类型** 需正确（如 `text/javascript`）；文件扩展名不是决定性因素。

3. **TypeScript 文件（`.ts/.mts/.cts`）何时“会被加载”？**
   - **Node 原生不会执行 TS**。你需要：
     - 先用 **`tsc`** 编译为 `.js/.mjs/.cjs` 再由 Node 加载；或
     - 使用运行时加载器/执行器（如 **ts-node、tsx、Bun** 或打包器 dev server）在内存里**即时转译**后再交给 JS 运行时执行。

   - **`.mts` / `.cts` 的意义**：在 TS 4.7+ 的 `moduleResolution: "NodeNext"/"Node16"` 下，明确告知“这是要编译成 ESM/CJS 的 TS 文件”。这能避免仅用 `.ts` 时的二义性。
   - 生成声明文件时会对应地产生 `.d.mts` / `.d.cts`。

4. **`.d.ts`（与 `.d.mts/.d.cts`）何时被“读取”**
   - **只在类型系统中使用**：编译（`tsc`）、编辑器智能提示、类型检查、`npm publish` 时作为类型入口。
   - 定位方式：
     - 包内 `package.json` 的 `"types"` / `"typings"` 字段；
     - `exports` 的 `types`（或 `typesVersions`）；
     - `typeRoots`、`types`、三斜线指令 `/// <reference types="...">`；
     - `@types/*` 包（DefinitelyTyped）。

   - **运行时绝不加载/执行**。

5. **打包器（Vite、Webpack、Rollup、esbuild）**
   - 都把 **`.mjs` 当 ESM**、**`.cjs` 当 CJS**。
   - 会通过插件/内置加载 TS（把 `.ts/.mts/.cts` 转成 JS）。
   - 会遵守 `exports`/`module`/`main`/`type` 等字段来选择入口与格式。
   - 对于 Node 产物，常见是同时发布 ESM 与 CJS 两套构建（双包架构），并提供相应的 `.d.ts`。

## 示例

**Node + `"type":"module"` 情况：**

```txt
pkg/
  package.json  // { "type": "module" }
  index.js      // 按 ESM 解析
  legacy.cjs    // 按 CJS 解析
  util.mjs      // 按 ESM 解析
```

**TypeScript 在 NodeNext 下的布局：**

```txt
src/
  index.mts     // 编译为 ESM（.mjs）；会配套生成 index.d.mts（若开启声明）
  loader.cts    // 编译为 CJS（.cjs）；会配套生成 loader.d.cts
  types.d.ts    // 仅类型，运行时不参与
```

**浏览器：**

```html
<!-- 经典脚本（非模块） -->
<script src="/app.js"></script>

<!-- ESM 模块 -->
<script type="module" src="/main.js"></script>
```

## 实战建议

- **库作者**：建议产出 **双格式**（CJS+ESM）与**类型声明**，并在 `package.json` 设置：
  - `"type": "module"`（若以 ESM 为主），再提供 CJS 入口（`.cjs`）；
  - 使用 `exports` 指定 `import`/`require` 条目与 `types`。

- **应用作者**：统一风格更省心。若全量 ESM，就：
  - `"type":"module"` + 统一 `.js/.mjs`（或 TS 中用 `.mts`）；
  - 依赖里若有 CJS 包，让打包器或 Node 的兼容层处理。

- **TS 工程**：用 **`moduleResolution: "NodeNext"`**，并用 `.mts/.cts` 明确产物语义；发布时别忘了 `.d.ts`/`.d.mts/.d.cts`。
