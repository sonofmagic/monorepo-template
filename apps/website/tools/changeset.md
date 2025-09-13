# Changesets

[Changesets](https://github.com/changesets/changesets)。它帮助你在 **monorepo** 或多包项目中更有条理地维护变更日志（changelog）、版本号升级策略以及自动化发布流程。

## 1. 什么是 Changeset？

- **核心思想**：每一次改动，不直接修改 `package.json` 里的版本号，而是通过写一个 `changeset` 文件（通常放在 `.changeset` 文件夹下）。
- **作用**：
  - 记录每次改动影响了哪些包（哪些需要 bump 版本）。
  - 指定改动类型（`patch`、`minor`、`major`）。
  - 自动生成 **Changelog**。
  - 自动修改 `package.json` 的版本号。
  - 与 CI/CD 集成后，可以实现一键自动发版。

## 2. 如何使用 Changesets？

### 安装

```bash
npm install --save-dev @changesets/cli
```

### 初始化

```bash
npx changeset init
```

会生成一个 `.changeset` 文件夹，里面包含配置文件。

### 添加变更

当你完成某个功能或修复后，运行：

```bash
npx changeset
```

它会问：

1. 哪些包受影响？
2. 这是 **patch**（补丁）、**minor**（新功能）、还是 **major**（重大变更）？
3. 变更的描述是什么？

这会生成一个类似这样的文件：

```yaml
# .changeset/sweet-pandas-sing.md
---
my-package: patch
---

修复了登录时的 bug
```

### 应用版本更新

当积累了多个 changeset 后，可以执行：

```bash
npx changeset version
```

它会根据 changeset 文件：

- 更新对应包的版本号。
- 生成/更新 `CHANGELOG.md`。

### 发布

最后可以发布：

```bash
npx changeset publish
```

会自动调用 `npm publish`，把包发到 npm registry。

## 3. 在 Monorepo 中的优势

- 避免多人协作时冲突：大家都往 `.changeset` 添加文件，不会直接改 `package.json`。
- 统一生成 changelog：自动保证每个版本的改动都被记录。
- 自动化发布：和 GitHub Actions 等 CI 工具结合，可在合并到主分支后自动发版。

## 总结

**Changeset 就是一个版本管理与发版工具**，它通过“先记录再统一处理”的方式，帮助 npm 包（尤其是 monorepo）保持版本升级和 changelog 的一致性与可追溯性。
