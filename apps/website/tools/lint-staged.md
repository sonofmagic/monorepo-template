# lint-staged

## 1. 什么是 lint-staged？

**lint-staged** 是一个工具，主要功能是：
在 **Git 暂存区（staged）里的文件** 上运行你指定的 linters 或脚本。

👉 它和 **Husky** 搭配使用最常见：

- Husky 负责触发 Git hooks（比如 `pre-commit`）。
- lint-staged 负责只对 **本次提交涉及的文件** 进行检查和修复。

这样就避免了对整个项目运行 lint/format，节省时间。

## 2. lint-staged 有什么用？

- **提高性能**：只检查本次改动的文件，而不是全量跑 `eslint` 或 `prettier`。
- **保证提交质量**：阻止不符合规范的代码进入仓库。
- **常见场景**：
  - 运行 ESLint 自动修复：`eslint --fix`
  - 运行 Prettier 格式化：`prettier --write`
  - 运行 TypeScript 编译检查：`tsc --noEmit`
  - 优化图片、转换 Markdown 等自定义脚本

## 3. 如何使用 lint-staged？

### 安装

```bash
npm install lint-staged --save-dev
```

### 配置

lint-staged 支持在 `package.json`、`.lintstagedrc` 或 `lint-staged.config.js` 中配置。

最简单的方式：在 `package.json` 加上：

```json
{
  "lint-staged": {
    "*.js": "eslint --fix",
    "*.ts": "eslint --fix",
    "*.{js,ts,json,css,md}": "prettier --write"
  }
}
```

### 结合 Husky

一般在 `.husky/pre-commit` 中加：

```bash
npx lint-staged
```

这样在提交时，lint-staged 会自动处理已暂存的文件。

## 4. 示例工作流

假设你改了两个文件：

- `src/app.js`
- `docs/readme.md`

然后执行 `git add . && git commit -m "feat: add app"`

在 `pre-commit` hook 中，lint-staged 会只对这两个文件运行配置的命令，比如：

- `eslint --fix src/app.js`
- `prettier --write docs/readme.md`

最终确保这两个文件在提交之前符合规范。

## 总结

- **lint-staged = 只在 staged 文件上运行 lint/脚本的工具**。
- 优点：快、精准，避免全量检查。
- 常和 **Husky** 搭配，用于 `pre-commit`。
