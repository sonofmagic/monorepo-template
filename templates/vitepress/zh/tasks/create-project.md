# 创建包或应用

当 workspace 已经准备好，需要创建新的包、应用、服务、CLI 或文档站时，使用这个任务页。

## 前置条件

- 在 workspace 根目录运行过 `repo doctor`。
- 确认包名和目标目录。
- 使用 `repo templates` 查看可用模板键。

## 最小命令

```bash
repo new <name> --template <template>
```

例如：

```bash
repo new shared-config --template package
```

只想查看文件计划时，加入 `--dry-run`，不会写入文件。

## 预期结果

repoctl 会输出选中的模板、目标目录和将要创建的文件。确认后，新项目加入 workspace，包元数据可以直接进入仓库校验。

## 常见分支

- 模板键不存在：先运行 `repo templates`，选择已安装的键。
- 目标目录已存在：换一个名称，或检查现有项目后再决定是否覆盖。
- 需要自定义共享文件：先创建项目，再通过[受管模板资产](/zh/reference/template-assets)同步公共文件。

## 下一步

运行[校验](/zh/tasks/checks)，再把新项目加入 [CI 工作流](/zh/tasks/ci)。
