---
outline: [2, 4]
---

# 改进并发布现代 npm 包

刚刚我们发布了一个低质量的 `npm` 包，因为它

1. 没有类型提示
2. 使用了落后的 CJS 语法
3. 没有使用打包器进行构建，导致无法做语法降级，这可能在低版本的浏览器/Nodejs中出现问题
4. 没有写 README 别人根本不知道怎么用
5. 没有单元测试，导致出现问题修改时，容易把原先好的case改坏等等。

为此我们需要提升包的质量，具体的手段如下

此代码的演变用例见 [examples](https://github.com/sonofmagic/monorepo-template/tree/main/apps/website/why/examples)

## 添加 DTS

类型提示其实就是最好的文档，为了让使用者，能在IDE里面直接点出来方法，类型和枚举，我们需要添加它

详见 [DTS](./dts.md)

## 更改为 ESM 格式优先

优先 ESM 格式符合我们面向未来编程的原则。

详见 [ESM vs CJS](./esm-vs-cjs.md)

## 使用 TypeScript 进行编写

既然我们都要使用一份代码，去生成 `cjs` / `esm` / `dts`，那么我们当然可以完全使用 `TypeScript` 进行编写，去生成对应的产物即可

## 使用打包器

## 写一份可读的 README 或者准备一个文档网站

## 添加单元测试
