# create-repo

`create-repo` 是 `create-icebreaker` 的 repo 品牌入口，方便用户用不同包管理器的 create 语法快速创建项目。

## 使用方式

```sh
npm create repo@latest
pnpm create repo
yarn create repo
```

这些命令会进入和 `create-icebreaker` 相同的脚手架流程：选择目标目录、选择保留模板，并在完成后提示 `pnpm setup` / `pnpm new` / `pnpm check` 等 repoctl onboarding 步骤。
