# packages/monorepo clean 命令优化

## 变更说明

优化了 `@icebreakers/monorepo` 包的 `clean` 命令,现在执行清理操作时会自动删除项目根目录下的 `.qoder` 文件夹。

## 修改的文件

### 1. `packages/monorepo/src/commands/clean.ts`

**修改内容**:

- 在 `candidates` 列表中添加了 `.qoder` 目录
- 现在清理操作会同时删除:
  - 用户选择的包目录
  - `README.zh-CN.md` 文件
  - `.qoder` 文件夹 (新增)

**代码变更**:

```typescript
const readmeZh = path.resolve(workspaceDir, 'README.zh-CN.md')
const qoderDir = path.resolve(workspaceDir, '.qoder') // 新增
const candidates = Array.from(new Set([
  ...cleanDirs.filter(Boolean),
  readmeZh,
  qoderDir, // 新增
]))
```

### 2. `packages/monorepo/test/commands/clean.coverage.test.ts`

**修改内容**:

- 更新测试用例以验证 `.qoder` 目录会被删除
- 添加断言确保 `fs.remove` 被正确调用

**代码变更**:

```typescript
expect(removeMock).toHaveBeenCalledWith('/repo/.qoder')
```

## 使用方式

执行清理命令时,`.qoder` 文件夹会自动被删除:

```bash
# 交互式选择要清理的包
pnpm script:clean

# 或使用 monorepo CLI
monorepo clean

# 自动清理所有包(跳过交互)
monorepo clean --yes
```

## 验证

所有测试通过:

- ✅ `test/commands/clean.coverage.test.ts` - 单元测试通过
- ✅ 全部 102 个测试通过
- ✅ Lint 检查通过
- ✅ 构建成功

## 影响范围

- **影响的命令**: `monorepo clean`, `pnpm script:clean`
- **删除的内容**: `.qoder` 文件夹(如果存在)
- **向后兼容**: 完全兼容,不影响现有功能
- **副作用**: 无,`.qoder` 文件夹不存在时会被安全忽略

## 技术细节

`.qoder` 文件夹通常用于存储 AI 助手生成的设计文档、任务记录等临时文件。在清理项目模板时删除这些文件可以:

- 保持项目的干净状态
- 避免将 AI 助手的临时文件带入新项目
- 符合 clean 命令的预期行为

## 相关 Issue

该优化是基于用户反馈,确保项目清理时移除所有非必要的临时文件和缓存目录。
