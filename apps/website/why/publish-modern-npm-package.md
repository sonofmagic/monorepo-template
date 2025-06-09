---
outline: [2, 4]
---

# 改进并发布现代 npm 包

## 提升包的质量

### 添加 dts

#### dts 是什么

你安装使用刚刚自己发的包的时候，有没有注意到，你的 `IDE` 没有出现任何的智能提示

这是因为你没有为你的包提供任何的 `dts`, 也就是 `xxx.d.ts` 文件

下面这 2 个标志想必大家在 `npmjs` 进行搜索的时候都见到过。

<img width="40" src="./assets/npm-ts.svg" />

这个标志代表这个包发布的时候，本身包里面就自己提供了 `dts`，这个需要在打包生成出 `dts` 之后，在 `package.json` 中，通过 `types` 字段指定了 `dts` 的位置

比如我发的所有包 [weapp-tailwindcss](https://www.npmjs.com/package/weapp-tailwindcss), [weapp-vite](https://www.npmjs.com/package/weapp-vite), [modern-ahocorasick](https://www.npmjs.com/package/modern-ahocorasick) 等等...

<img width="40" src="./assets/npm-dt.svg" />

这个标志代表这个包发布的时候，本身包里面没有 `dts`，但是有好心人给他写了 `dts`，并发布到了 `@types/*` 这个作用域下了，所以这个包等同于也有 `dts`，而且 `vscode` 也在发现你安装了这样的包之后，也会去下载 `@types/*` 这样的包，当然更好的方式是你要显式安装 `@types` 包

举个例子，比如 [lodash](https://www.npmjs.com/package/lodash) 和 [@types/lodash](https://www.npmjs.com/package/@types/lodash)，点击 [lodash](https://www.npmjs.com/package/lodash) `npm` 主页面的这个标志，就直接跳转到 [@types/lodash](https://www.npmjs.com/package/@types/lodash)

> [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 这个是微软的仓库，用于发布管理所有的 `@types` 包

这里就需要提到包的质量判断标准，一般来说呈现下面的趋势:

<div class="flex justify-center">
<div class="flex items-center border p-6">

<img class="w-12" src="./assets/npm-ts.svg" />
<div class="text-5xl mx-5">></div>
<img class="w-12" src="./assets/npm-dt.svg" />
<div class="text-5xl mx-5">></div>
<div>什么标志都没有的包</div>
</div>
</div>

### 更改为 esm 格式优先

#### 为什么?

详见 [ESM vs CJS](./esm-vs-cjs.md)

### 使用 TypeScript 进行编写

### 使用打包器

### 写一份可读的 README 或者准备一个文档网站

### 添加单元测试
