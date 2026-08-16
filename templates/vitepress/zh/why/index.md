# 包的演进

一个可发布的 npm 包不只是源代码目录。消费者依赖它的运行时格式、类型声明、入口点、发布文件和兼容性承诺。这里按这些公开边界整理现代包的基础知识。

## 先从消费者开始

在选择打包器或模块格式前，先回答：

- 消费者使用 ESM、CommonJS，还是两者都需要？
- 包发布运行时代码、类型、CLI、配置预设还是资源？
- 需要支持哪些 Node 版本？
- 对外只暴露一个入口，还是需要明确的子路径？

这些答案定义了包的边界。工具链应该实现边界，而不是替代边界决策。

## 推荐目录

```text
src/          源代码
dist/         生成的 ESM、CommonJS 与声明文件
package.json  公开 metadata 与 exports 映射
README.md     安装和使用契约
```

使用 `files` 控制发布内容，并在发布前执行 `npm pack --dry-run` 检查实际 tarball。

## 专题

- [ESM 与 CommonJS](./modern/esm-vs-cjs.md)
- [类型声明](./modern/dts.md)
- [包入口](./modern/package-entry-points.md)
- [构建工具](./modern/bundlers.md)
- [TypeScript](./modern/typescript.md)

## 继续阅读

- [什么是 npm 包](./what-is-npm-package.md)
- [发布 npm 包](./publish-basic-npm-package.md)
