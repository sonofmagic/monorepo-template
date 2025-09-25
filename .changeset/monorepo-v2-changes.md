---
"@icebreakers/monorepo": major
---

## 重大更新说明

- 重写 `upgradeMonorepo` 的写入与交互逻辑，统一覆盖策略、支持交互式目标选择，并新增 `package.json` 差异合并与镜像同步并发修复。
- 增强 `syncNpmMirror`、`setReadme`、`setPkgJson`、`setVscodeBinaryMirror` 等关键流程的稳定性，涵盖空包名、缺失 Git 信息以及 VS Code 配置合并等边界场景。
- 为 CLI、命令式入口、工作区工具、镜像配置、Git 客户端与散列工具补充系统化单元测试，将覆盖率提升至语句 99% 以上，确保 2.x 版本行为可验证。
- 依赖清理与工具链调整：基于 Husky 9 和 Turbo 配置优化，所有脚本默认采用 `pnpm exec`，并落地 lint/测试任务的依赖传递策略。

> 这是一个破坏性更新，建议在升级到 `@icebreakers/monorepo@2.x` 前阅读对应文档与优化记录，确认流水线脚本、同步流程及 README 初始化逻辑是否符合预期。
