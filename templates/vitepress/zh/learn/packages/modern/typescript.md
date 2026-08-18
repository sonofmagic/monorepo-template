# 使用 TypeScript 编写代码

既然我们需要写多份文件，然后再发布到 `npm` 包，不如只写一份 `typescript` 文件

然后其他的格式 (`cjs`/`esm`)，还有 `d.ts` 产物都自动生成，这不是就非常方便吗?

## 改造项目

安装 `typescript` 以及完成初始化创建 `tsconfig.json`

```bash
npm i -D typescript # 安装 typescript
npx tsc --init # 创建 tsconfig.json
```

添加 `src` 目录，在里面创建 `index.ts` 文件

```ts
export function sayHello() {
  const message = 'hello world typescript'
  console.log(message)
  return message
}

console.log(`load package icebreaker-npm-basic-package`)
```

## 调整 `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "rootDir": "./src",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true, // 支持 import json
    "strict": true, // 严格模式
    "declaration": true, // 生成 dts
    "declarationMap": true, // dts 的 sourcemap
    "outDir": "./dist", // 生成 dts 的目录
    "sourceMap": true, // 生成 sourcemap
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

更多的配置 https://www.typescriptlang.org/tsconfig/

## 创建 `cjs` 和 `esm` 各自格式的 `tsconfig.json`

:::code-group

```jsonc [tsconfig.esm.json]
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "outDir": "./dist/esm"
  }
}
```

```jsonc [tsconfig.cjs.json]
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node10",
    "outDir": "./dist/cjs"
  }
}
```

:::

## 开始编译

在 `package.json` 的 `scripts` 中添加脚本

```jsonc
{
  "build:cjs": "tsc --project tsconfig.cjs.json && node rename-ext.js dist/cjs .js .cjs && node rename-ext.js dist/cjs .js.map .cjs.map",
  "build:esm": "tsc --project tsconfig.esm.json",
  "build": "npm run build:cjs && npm run build:esm"
}
```

为什么这里还需要执行 `rename-ext`? 因为你安装使用一个 `npm` 包的时候，默认情况下会使用 `package.json` 中的 `type` 字段去决定这个包 `js` 代码模块加载器

通常 `nodejs` 中会存在 `2` 个模块加载器:

- [Modules: CommonJS modules](https://nodejs.org/docs/latest/api/modules.html)
- [Modules: ECMAScript modules](https://nodejs.org/docs/latest/api/esm.html)

假如你声明了 `"type": "module"`，那么 `nodejs` 会使用 `ESM` 模块加载器，去加载这个包下面的所有 `.js`

反之，则使用 `CJS` 模块加载器，去加载这个包下面的所有 `.js`

但是有 `2` 个后缀是特例，`.cjs` 和 `.mjs` , 他们在 `js` 前面加了 `c` 和 `m` 代表指定 `cjs`/`esm` 模块加载器，去加载这个 `js` 代码

而我们这个包，已经被声明了 `"type": "module"`，所以是无法直接运行后缀是 `.js` 的 `cjs` 文件的，必须把后缀从 `.js` 转变为 `.cjs`

## 更改 `package.json` 中模块入口点

```jsonc
{
  "name": "icebreaker-npm-basic-package",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/esm/index.d.ts",
        "default": "./dist/esm/index.js"
      },
      "require": {
        "types": "./dist/cjs/index.d.ts",
        "default": "./dist/cjs/index.cjs"
      }
    }
  },
  "files": [
    "dist" // [!code highlight]
  ]
}
```

给不同的引入方式，设置不同的模块入口，和不同的类型提示。

同时也要注意这里我们添加了 `files` 字段，因为此时 `src` 目录下的源代码是不需要发布到 `npmjs` 上去的

你也可以通过执行 `npm pack --dry-run` 查看当前哪些文件会在发布的时候，被上传到 `npmjs` 上去

## 调试项目

### 利用 `sourcemap` 调试项目

`source map`（源码映射） 是一种用来 把编译/打包/压缩后的代码映射回原始代码 的技术

它是用来解决 生成的代码和原始代码不一样, 无法直接调试源代码，这样一个问题。

使用方式，在打开 `sourcemap` 选项后，生成对应的 `sourcemap` 文件，然后就可以在 `ts` 代码中打上断点，直接调试源代码了。

### 直接运行 `typescript` 调试项目

过去我们使用 `ts-node` 来直接运行 `ts`，随着时代的发展，`ts-node` 已经逐渐被 `tsx` 所取代

当然市面上直接转译运行 `typescript` 的工具还是非常多的，比如 `tsx` 和 `bundle-require` 都是基于 `esbuild`

`jiti` 这种基于 `babel` 的，还有 `swc-node` 这种基于 `swc` 的， `@oxc-node/core` 这种基于 `oxc` 的

当然，在不使用 `emitDecoratorMetadata` 这种 `typescript` 的装饰器的高级用法的情况下，使用 `tsx` 是比较好的选择
