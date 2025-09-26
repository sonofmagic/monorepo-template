---
"@icebreakers/monorepo": major
---

## 重大更新说明

- 重写 `upgradeMonorepo` 的写入与交互逻辑，统一覆盖策略、支持交互式目标选择，并新增 `package.json` 差异合并与镜像同步并发修复。
- 增强 `syncNpmMirror`、`setReadme`、`setPkgJson`、`setVscodeBinaryMirror` 等关键流程的稳定性，涵盖空包名、缺失 Git 信息以及 VS Code 配置合并等边界场景。
- 为 CLI、命令式入口、工作区工具、镜像配置、Git 客户端与散列工具补充系统化单元测试，将覆盖率提升至语句 99% 以上，确保 2.x 版本行为可验证。
- 依赖清理与工具链调整：基于 Husky 9 和 Turbo 配置优化，所有脚本默认采用 `pnpm exec`，并落地 lint/测试任务的依赖传递策略。
- 重构命令架构：拆分 `core/`、`commands/`、`cli/` 三层结构，CLI 入口仅负责解析参数，命令实现复用核心上下文，配套测试与资产脚本已同步调整。
- 新增配置中心：通过 `monorepo.config.ts`（由 `c12@3.3.0` 解析）即可覆写 create / clean / sync / upgrade / init / mirror 等命令的默认行为，并提供 `defineMonorepoConfig` 辅助函数；模板与快照随之更新。
- 命令行为增强：
  - `create` 支持自定义模板映射、选择项以及自动重命名输出路径。
  - `clean` 新增自动确认、忽略列表与依赖版本钉固选项。
  - `sync` 支持自定义并发、命令模板（含 `{name}` 占位符）与包白名单。
  - `upgrade` 可配置目标文件、脚本覆盖以及是否跳过 Changeset Markdown；同时导出 `setPkgJson` 以便外部复用。
  - `init` 支持按需跳过 README / package.json / Changeset 的写入。
  - `mirror` 允许覆盖 VS Code 终端镜像环境变量。
- 文档与示例更新：在 README 与 assets 中新增配置示例、保留的 `monorepo.config.ts` 模板，以及相应的测试覆盖与快照同步。

> 这是一个破坏性更新，建议在升级到 `@icebreakers/monorepo@2.x` 前阅读对应文档与优化记录，确认流水线脚本、同步流程及 README 初始化逻辑是否符合预期。
