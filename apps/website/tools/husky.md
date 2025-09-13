# Husky

## 1. 什么是 Husky？

**Husky** 是一个用于在 **Git hooks**（如 `pre-commit`、`pre-push`、`commit-msg` 等）中运行脚本的工具。
它的作用是让你在提交代码前或推送代码前，自动执行一些校验、格式化或测试，从而保证代码质量和团队规范。

> 简单来说：**Husky = Git hooks 的管理工具**。

## 2. Husky 有什么用？

常见用途：

1. **代码格式化**
   在提交前运行 `prettier --write .`，确保代码风格一致。
2. **Lint 检查**
   在 `pre-commit` 时执行 `eslint`，防止有 lint 错误的代码被提交。
3. **运行测试**
   在 `pre-push` 时执行 `npm test`，防止未通过测试的代码被推送。
4. **Commit 信息校验**
   在 `commit-msg` hook 中使用 [commitlint](https://github.com/conventional-changelog/commitlint) 强制提交信息符合规范（如 Conventional Commits）。

## 3. 如何使用 Husky？

### 安装

```bash
npm install husky --save-dev
```

### 初始化

```bash
npx husky init
```

这会生成一个 `.husky` 目录，并在里面创建 `pre-commit` 文件，默认内容可能是：

```bash
#!/bin/sh
npm test
```

### 添加 Hook

假设你想在提交前运行 ESLint，可以这样：

```bash
npx husky add .husky/pre-commit "npm run lint"
```

生成的 `.husky/pre-commit` 文件类似：

```bash
#!/bin/sh
npm run lint
```

### 使用 commit-msg 校验提交信息

先装 commitlint：

```bash
npm install @commitlint/{config-conventional,cli} --save-dev
```

创建配置文件 `commitlint.config.js`：

```js
module.exports = { extends: ['@commitlint/config-conventional'] }
```

添加 hook：

```bash
npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"
```

这样，若提交信息不符合规范，会被拦截。

## 4. 和 lint-staged 搭配

通常 Husky 会和 [lint-staged](https://github.com/okonet/lint-staged) 搭配使用：
只检查本次改动的文件，而不是全量检查。

示例：
`package.json` 里加：

```json
{
  "lint-staged": {
    "*.js": "eslint --fix",
    "*.ts": "eslint --fix"
  }
}
```

然后在 `.husky/pre-commit` 文件中写：

```bash
npx lint-staged
```

## 总结

- **Husky** 是一个 Git hooks 工具，用来在 commit、push 等阶段运行脚本。
- 主要用于 **代码质量控制**：lint、格式化、测试、commit message 校验等。
- 使用方式：安装 → 初始化 → 添加 hooks → 编写脚本。
