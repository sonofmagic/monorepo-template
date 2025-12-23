# 项目优化扫描设计文档

## 优化目标

通过全面扫描 pnpm-turbo-monorepo-template 项目,识别性能、安全、开发体验和工程化方面的优化机会,提升项目整体质量和可维护性。

## 扫描范围

| 范围分类 | 具体内容                            |
| -------- | ----------------------------------- |
| 构建系统 | Turbo、Vite、tsup、unbuild 配置优化 |
| 依赖管理 | pnpm 配置、依赖版本、安全漏洞       |
| 代码质量 | ESLint、Stylelint、TypeScript 配置  |
| 测试覆盖 | Vitest 配置、测试覆盖率             |
| CI/CD    | GitHub Actions 工作流优化           |
| 文档完善 | README、贡献指南、安全政策          |
| 开发体验 | 开发工具链、脚本命令优化            |

## 发现的优化机会

### 一、构建与性能优化

#### 1.1 Turbo 缓存优化

**当前状态**

- Turbo 缓存已为 build、test、lint 任务启用
- dev 和 sync 任务禁用缓存
- 未启用 Turbo Remote Caching

**优化建议**
| 优化项 | 优先级 | 预期收益 |
|--------|--------|---------|
| 启用 Turbo Remote Caching | 高 | 团队协作时构建速度提升 40-60% |
| 优化 outputs 配置精确性 | 中 | 缓存命中率提升 10-15% |
| 添加 inputs 配置 | 中 | 避免不必要的重新构建 |

**实施要点**

- 在 GitHub Actions 中配置 TURBO_TOKEN 和 TURBO_TEAM 环境变量(已注释,可直接启用)
- 为每个任务明确定义 inputs 模式,如源文件、配置文件路径
- 考虑为不同任务设置不同的缓存策略

#### 1.2 Vite 构建优化

**当前状态**

- apps/client 使用 Vite 作为构建工具
- 配置较为基础,缺少性能优化选项

**优化建议**
| 配置项 | 建议值 | 说明 |
|--------|--------|------|
| build.rollupOptions.output.manualChunks | 配置代码分割策略 | 优化包体积和加载性能 |
| build.chunkSizeWarningLimit | 提升至 1000 | 避免误报大包警告 |
| build.minify | 'esbuild' | 保持默认,性能最优 |
| server.hmr | 精细化配置 | 提升开发热更新速度 |

**实施要点**

- 为第三方库(Vue、Router、Pinia)配置独立 chunk
- 为 UI 组件库配置按需加载
- 启用 gzip/brotli 压缩插件

#### 1.3 Bundle 大小监控

**当前状态**

- 缺少构建产物大小监控机制

**优化建议**

- 集成 rollup-plugin-visualizer 或 vite-bundle-visualizer
- 在 CI 中添加 bundle size 检查任务
- 设置包体积阈值告警

### 二、依赖管理优化

#### 2.1 依赖安全审计

**当前状态**

- 已配置 Renovate 自动依赖更新
- 缺少定期安全审计流程

**优化建议**
| 措施 | 实施方式 | 频率 |
|------|---------|------|
| 添加安全审计脚本 | pnpm audit 或 npm audit | 每次 CI 运行 |
| 集成 Snyk/Dependabot | GitHub App | 实时监控 |
| 漏洞修复策略 | 自动创建 PR | 高危立即处理 |

**实施要点**

- 在 package.json 添加 "audit" script
- 在 CI workflow 添加 audit 步骤
- 配置 Renovate 优先处理安全更新

#### 2.2 依赖版本规范

**当前状态**

- 部分依赖使用 ^ 范围版本
- 缺少统一版本管理策略

**优化建议**

- 使用 pnpm workspace catalog 统一管理公共依赖版本
- 生产依赖使用精确版本或 ~ 限定 patch 版本
- 开发依赖使用 ^ 允许 minor 更新

#### 2.3 .npmrc 配置优化

**当前状态**

- 基础配置已就绪
- 部分性能优化选项未启用

**优化建议**
| 配置项 | 建议值 | 说明 |
|--------|--------|------|
| auto-install-peers | true | 自动安装 peer 依赖 |
| strict-peer-dependencies | false | 避免版本冲突导致安装失败 |
| resolution-mode | highest | 优先选择最高版本解决冲突 |
| node-linker | hoisted | 提升性能(默认已是) |

### 三、代码质量优化

#### 3.1 TypeScript 配置增强

**当前状态**

- 基础 strict 模式已启用
- 缺少部分严格检查选项

**优化建议**
| 配置项 | 建议值 | 收益 |
|--------|--------|------|
| noUncheckedIndexedAccess | true | 防止数组索引越界 |
| noPropertyAccessFromIndexSignature | true | 强制使用安全的索引访问 |
| exactOptionalPropertyTypes | true | 区分未定义和可选 |
| noImplicitOverride | true | 要求显式 override 关键字 |

#### 3.2 ESLint 规则优化

**当前状态**

- 使用 @icebreakers/eslint-config 预设配置
- 仅忽略 fixtures 目录

**优化建议**

- 添加 no-console 规则,仅允许 warn/error(生产环境)
- 启用 import 顺序自动排序
- 添加未使用变量检测规则
- 配置文件命名规范检查

#### 3.3 Console 语句清理

**当前状态**

- 代码中存在多处 console.log 调试语句
- 主要集中在示例代码和工具脚本中

**优化建议**
| 位置 | 处理方式 | 优先级 |
|------|---------|--------|
| apps/cli/src/index.ts | 替换为结构化日志库 | 高 |
| apps/client/worker/node-entry.ts | 保留,但使用日志库 | 中 |
| apps/server/src/node-entry.ts | 保留,但使用日志库 | 中 |
| apps/website/why/examples/\* | 保留(示例代码) | 低 |

**实施要点**

- 引入 consola 或 pino 作为日志库
- 为不同环境配置不同日志级别
- 在 lint-staged 中添加 console 检查

### 四、测试覆盖优化

#### 4.1 测试配置优化

**当前状态**

- Vitest 已配置,支持覆盖率生成
- vitest.config.ts 实现了自动项目发现

**优化建议**
| 配置项 | 建议值 | 说明 |
|--------|--------|------|
| coverage.reporter | ['text', 'lcov', 'html'] | 多格式覆盖率报告 |
| coverage.lines | 80 | 设置覆盖率阈值 |
| coverage.functions | 75 | 函数覆盖率阈值 |
| coverage.branches | 70 | 分支覆盖率阈值 |
| testTimeout | 10000 | 统一测试超时时间 |

#### 4.2 测试组织优化

**当前状态**

- 测试文件分散在各 workspace
- 缺少 E2E 测试

**优化建议**

- 为 apps/client 和 apps/server 添加集成测试
- 考虑引入 Playwright 进行 E2E 测试
- 在 CI 中分离单元测试和集成测试任务

### 五、CI/CD 优化

#### 5.1 GitHub Actions 优化

**当前状态**

- ci.yml 在多平台多 Node 版本运行
- release.yml 负责发布流程

**优化建议**
| 优化项 | 实施方式 | 预期收益 |
|--------|---------|---------|
| 缓存优化 | 使用 pnpm store 缓存 | 安装时间减少 50-70% |
| 并行化 | 分离 lint、test、build 任务 | 总时间减少 30-40% |
| 条件执行 | 根据变更文件决定运行范围 | 节省 CI 资源 |
| 超时控制 | 为每个 job 设置合理超时 | 防止卡死 |

**具体实施**

添加依赖缓存优化:

```yaml
- uses: actions/setup-node@v6
  with:
    node-version: ${{ matrix.node-version }}
    cache: pnpm
    cache-dependency-path: pnpm-lock.yaml
```

添加条件执行示例:

```yaml
- name: Check changed files
  id: changes
  uses: dorny/paths-filter@v2
  with:
    filters: |
      apps:
        - 'apps/**'
      packages:
        - 'packages/**'
```

#### 5.2 添加性能基准测试

**优化建议**

- 在 CI 中添加构建时间追踪
- 为关键路径添加性能基准测试
- 使用 hyperfine 或 similar 工具对比性能变化

#### 5.3 发布流程优化

**当前状态**

- 使用 Changesets 管理版本
- NPM_TOKEN 配置已注释

**优化建议**

- 启用 NPM provenance (已配置 NPM_CONFIG_PROVENANCE)
- 添加发布前置检查(类型检查、lint、test)
- 配置发布通知机制

### 六、文档完善

#### 6.1 SECURITY.md 完善

**当前状态**

- 使用 GitHub 模板,内容为占位符
- 未实际定义安全策略

**优化建议**

- 明确支持的版本范围
- 定义漏洞报告流程和响应时间
- 说明安全补丁发布策略
- 添加联系方式

#### 6.2 CONTRIBUTING.md 完善

**当前状态**

- 仅包含 TODO 占位符

**优化建议**

- 详细说明贡献流程
- 定义 PR 标准和审查流程
- 说明本地开发环境搭建
- 添加代码规范和测试要求

#### 6.3 API 文档生成

**优化建议**

- 使用 TypeDoc 为 packages 生成 API 文档
- 集成到 VitePress 文档站点
- 在 CI 中自动发布文档更新

### 七、开发体验优化

#### 7.1 开发工具配置

**优化建议**
| 工具 | 配置文件 | 内容 |
|------|---------|------|
| VSCode | .vscode/settings.json | 编辑器配置、推荐扩展 |
| VSCode | .vscode/extensions.json | 必装和推荐扩展列表 |
| Git | .gitattributes | 已有,考虑添加 LFS 配置 |

**推荐扩展**

- Vue Language Features (Volar)
- ESLint
- Stylelint
- Vitest
- GitLens

#### 7.2 脚本命令优化

**当前状态**

- package.json 包含丰富的脚本命令
- 使用分隔符组织命令

**优化建议**

- 添加 "prebuild" 清理旧构建产物
- 添加 "typecheck" 独立类型检查命令
- 添加 "format" 代码格式化命令
- 添加 "validate" 运行所有检查(lint + test + typecheck)

#### 7.3 调试配置

**优化建议**

- 为 VSCode 添加 .vscode/launch.json
- 配置 Node.js 调试启动项
- 配置浏览器调试启动项

### 八、Docker 优化

#### 8.1 Dockerfile 优化

**当前状态**

- 使用多阶段构建
- 基础镜像为 node:22-alpine

**优化建议**
| 优化项 | 实施方式 | 收益 |
|--------|---------|------|
| 层缓存优化 | 先复制 package.json 再复制源码 | 构建速度提升 |
| 镜像大小 | 使用 distroless 或 alpine | 镜像体积减少 30-50% |
| 安全扫描 | 集成 Trivy 或 Snyk | 提升容器安全性 |
| 健康检查 | 添加 HEALTHCHECK 指令 | 提升运行时可靠性 |

**优化后的构建流程示例**

```dockerfile
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build
```

#### 8.2 .dockerignore 优化

**当前状态**

- 基础配置已有
- 可进一步精细化

**优化建议**
添加更多忽略项:

- .git
- .github
- coverage
- .turbo
- .vitepress/cache
- \*_/_.test.ts
- \*_/_.spec.ts

### 九、Monorepo 特定优化

#### 9.1 Workspace 依赖管理

**优化建议**

- 使用 pnpm workspace protocol 版本号(workspace:\*)
- 审查 workspace 依赖是否合理
- 避免循环依赖

#### 9.2 模板包优化

**当前状态**

- packages 下有多个模板包
- 包括 tsup、tsdown、unbuild、vue-lib 等

**优化建议**

- 统一模板包的测试覆盖率标准
- 为每个模板添加完整的 README
- 确保模板间配置一致性

#### 9.3 包发布策略

**优化建议**

- 明确哪些包需要发布,哪些仅供内部使用
- 为发布包配置完整的 publishConfig
- 确保所有发布包都有 changeset

### 十、性能监控

#### 10.1 构建性能监控

**优化建议**

- 集成 turbo --summarize 输出构建统计
- 在 CI 中记录构建时间趋势
- 为大型 workspace 设置构建时间预警

#### 10.2 运行时性能监控

**优化建议**

- 为 apps/server 集成性能监控(如 Sentry Performance)
- 为 apps/client 配置 Web Vitals 收集
- 定期进行 Lighthouse 审计

## 优化优先级矩阵

| 优化项               | 影响范围 | 实施难度 | 优先级 | 预期工时 |
| -------------------- | -------- | -------- | ------ | -------- |
| Turbo Remote Caching | 全项目   | 低       | P0     | 0.5天    |
| 依赖安全审计         | 全项目   | 低       | P0     | 0.5天    |
| Console 语句清理     | 应用层   | 低       | P1     | 1天      |
| TypeScript 配置增强  | 全项目   | 低       | P1     | 0.5天    |
| CI/CD 优化           | DevOps   | 中       | P1     | 1天      |
| Vite 构建优化        | 前端应用 | 中       | P1     | 1天      |
| 测试覆盖优化         | 全项目   | 中       | P2     | 2天      |
| 文档完善             | 文档     | 低       | P2     | 1天      |
| Docker 优化          | 部署     | 中       | P2     | 1天      |
| Bundle 大小监控      | 前端应用 | 中       | P3     | 0.5天    |
| 性能监控             | 运行时   | 高       | P3     | 2天      |

## 实施路线图

### 第一阶段:快速收益(1周)

1. 启用 Turbo Remote Caching
2. 添加依赖安全审计
3. 完善 TypeScript 配置
4. 清理 console 语句
5. 优化 CI 缓存策略

### 第二阶段:核心优化(2周)

1. Vite 构建优化
2. 测试覆盖率提升
3. ESLint 规则增强
4. 文档补全(SECURITY、CONTRIBUTING)
5. Docker 镜像优化

### 第三阶段:深度优化(3周)

1. E2E 测试引入
2. Bundle 大小监控
3. 性能基准测试
4. API 文档生成
5. 运行时性能监控

## 风险评估

| 风险项                       | 影响 | 概率 | 缓解措施                   |
| ---------------------------- | ---- | ---- | -------------------------- |
| 严格 TS 配置导致大量编译错误 | 高   | 中   | 分步启用,逐个修复          |
| 依赖更新引入不兼容性         | 中   | 低   | Renovate 分批更新,完整测试 |
| CI 优化后任务失败            | 中   | 低   | 在 feature 分支充分验证    |
| Remote Caching 配置错误      | 低   | 低   | 先在小范围试点             |

## 成功指标

| 指标类别   | 具体指标      | 当前值 | 目标值   |
| ---------- | ------------- | ------ | -------- |
| 构建性能   | 全量构建时间  | -      | 减少 30% |
| 代码质量   | ESLint 错误数 | -      | 0        |
| 测试覆盖   | 行覆盖率      | -      | > 80%    |
| 依赖安全   | 高危漏洞数    | -      | 0        |
| CI 效率    | 平均运行时间  | -      | 减少 25% |
| 文档完整性 | 缺失文档项    | 2      | 0        |

## 持续优化建议

1. **定期审查依赖**: 每月运行依赖审计,及时更新安全补丁
2. **监控构建性能**: 在 CI 中记录构建时间,建立性能基线
3. **代码质量门禁**: 在 PR 中强制要求通过所有检查
4. **文档同步更新**: 代码变更时同步更新相关文档
5. **定期技术债务清理**: 每个季度预留时间处理技术债务
