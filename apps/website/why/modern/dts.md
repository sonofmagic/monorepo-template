# 添加 dts

## `.d.ts` 文件是什么

在 TypeScript 中，`.d.ts` 文件是 **类型声明文件**，全称是 **"declaration file"**。它的主要作用是为 JavaScript 代码或没有类型定义的 TypeScript 代码提供类型信息。

你安装使用刚刚自己发的包的时候，有没有注意到，你的 `IDE` 没有出现任何的智能提示

这是因为你没有为你的包提供任何的 `dts`, 也就是 `xxx.d.ts` 文件

下面这 2 个标志想必大家在 `npmjs` 进行搜索的时候都见到过。

<img width="40" src="../assets/npm-ts.svg" />

这个标志代表这个包发布的时候，本身包里面就自己提供了 `dts`，这个需要在打包生成出 `dts` 之后，在 `package.json` 中，通过 `types` 字段指定了 `dts` 的位置

比如我发的所有包 [weapp-tailwindcss](https://www.npmjs.com/package/weapp-tailwindcss), [weapp-vite](https://www.npmjs.com/package/weapp-vite), [modern-ahocorasick](https://www.npmjs.com/package/modern-ahocorasick) 等等...

<img width="40" src="../assets/npm-dt.svg" />

这个标志代表这个包发布的时候，本身包里面没有 `dts`，但是有好心人给他写了 `dts`，并发布到了 `@types/*` 这个作用域下了，所以这个包等同于也有 `dts`，而且 `vscode` 也在发现你安装了这样的包之后，也会去下载 `@types/*` 这样的包，当然更好的方式是你要显式安装 `@types` 包

举个例子，比如 [lodash](https://www.npmjs.com/package/lodash) 和 [@types/lodash](https://www.npmjs.com/package/@types/lodash)，点击 [lodash](https://www.npmjs.com/package/lodash) `npm` 主页面的这个标志，就直接跳转到 [@types/lodash](https://www.npmjs.com/package/@types/lodash)

> [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 这个是微软的仓库，用于发布管理所有的 `@types` 包

这里就需要提到包的质量判断标准，一般来说呈现下面的趋势:

<div class="flex justify-center">
<div class="flex items-center border p-6">

<img class="w-12" src="../assets/npm-ts.svg" />
<div class="text-5xl mx-5">></div>
<img class="w-12" src="../assets/npm-dt.svg" />
<div class="text-5xl mx-5">></div>
<div>什么标志都没有的包</div>
</div>
</div>

---

### `.d.ts` 文件的作用

- **描述模块或库的类型结构**，使 TypeScript 可以进行类型检查和代码补全。
- **为 JavaScript 库提供类型支持**，例如 jQuery、Lodash、React 等第三方库。
- **声明全局变量、模块、类、接口、函数等**，而不提供实际实现。

---

### 举个简单例子

假设你有一个 JavaScript 文件 `math.js`：

```js
// math.js
function add(a, b) {
  return a + b
}
```

你可以写一个 `.d.ts` 文件来告诉 TypeScript 这个模块的类型：

```ts
// math.d.ts
declare function add(a: number, b: number): number
```

这样你在 TypeScript 中使用 `add` 函数时就能获得类型检查和智能提示了。

---

### 使用场景

1. **第三方库没有内置类型定义时**
   - 可以使用 DefinitelyTyped 的类型库（安装例如 `@types/lodash`）；
   - 或者自己写 `.d.ts` 文件。

2. **为已有的 JS 代码添加类型支持**
   - 特别是在从 JS 项目逐步迁移到 TS 时。

3. **定义公共 API 接口或模块类型**
   - 比如声明一个共享的接口模块 `types.d.ts`，全项目通用。

---

### 类型声明的获取方式

- 手动编写 `.d.ts`
- 自动生成（例如通过 `tsc --declaration`）
- 安装类型定义包：
  ```
  npm install --save-dev @types/express
  ```
