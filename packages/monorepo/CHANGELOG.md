# @icebreakers/monorepo

## 3.0.0

### Major Changes

- [`bddd7c2`](https://github.com/sonofmagic/monorepo-template/commit/bddd7c2e140e9c50a8a7051a9f489470e9e416b0) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Adopted `@inquirer/prompts@8.0.0` which is ESM-only and enforces `Node >=23.5.0 || ^22.13.0 || ^21.7.0 || ^20.12.0`. Users must upgrade Node before updating to this release.

## 2.2.0

### Minor Changes

- [`df74551`](https://github.com/sonofmagic/monorepo-template/commit/df745515f7adabcae2ee95611d0e1727de3582bb) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 优化智能提示

## 2.1.6

### Patch Changes

- [`25fb7d7`](https://github.com/sonofmagic/monorepo-template/commit/25fb7d76cd906a0ead3ef352467d030603a165bd) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 2.1.5

### Patch Changes

- [`b9bd4fb`](https://github.com/sonofmagic/monorepo-template/commit/b9bd4fb54b2d5b0cc0d12f2cd18d8409e9e327b1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 2.1.4

### Patch Changes

- [`bba3ccc`](https://github.com/sonofmagic/monorepo-template/commit/bba3ccca25aa8abbef0dcfb3c06711f8d9ef4419) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 2.1.3

### Patch Changes

- [`4608802`](https://github.com/sonofmagic/monorepo-template/commit/46088022d2f874e9dea2092744bf0706d0d43f44) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 2.1.2

### Patch Changes

- [`a198e74`](https://github.com/sonofmagic/monorepo-template/commit/a198e74280f00464176c04cc70911da6386bd95a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Handle pnpm `catalog:` version specifiers during `monorepo up` so catalog-managed dependencies are preserved without semver parsing errors.

## 2.1.1

### Patch Changes

- [`6d97e86`](https://github.com/sonofmagic/monorepo-template/commit/6d97e86ebbe8001ce916857d2a07a8f4447a6c78) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add tsdown template and expose it via monorepo create choices

- [`0f4d105`](https://github.com/sonofmagic/monorepo-template/commit/0f4d105052b61bf29909dbe29f3f49c841792f20) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: scaffolded packages now inherit repository, bugs, and author metadata from the current git remote

- [`f5a7a60`](https://github.com/sonofmagic/monorepo-template/commit/f5a7a6029d546e7bf21e6d6636eefe426bacc4af) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: migrate shared Vitest setup and templates to Vitest v4

## 2.1.0

### Minor Changes

- [`fc82dd5`](https://github.com/sonofmagic/monorepo-template/commit/fc82dd57d4dc83b8f0dde664cc54525da51fd1db) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Drop the legacy `--raw`/`--minimal-assets` upgrade flags in favor of the concise `-c/--core` switch and align documentation accordingly.

## 2.0.12

### Patch Changes

- [`6c67c57`](https://github.com/sonofmagic/monorepo-template/commit/6c67c57c4b5225571c100918ee32dcc0bd8fc9d9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 2.0.11

### Patch Changes

- [`57c5818`](https://github.com/sonofmagic/monorepo-template/commit/57c5818634227b88a9652fa00f850cb659a7864a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Unifies the gitignore renaming logic under shared utilities, improving consistency across publish, create, and upgrade flows.

## 2.0.10

### Patch Changes

- [`37506a4`](https://github.com/sonofmagic/monorepo-template/commit/37506a4be5fe245cd87dc357b882faeebf57cde4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Add a diff-aware overwrite selection to `monorepo up`, prompting once for all changed files and refactoring the upgrade helpers for reuse.

## 2.0.9

### Patch Changes

- [`ace9269`](https://github.com/sonofmagic/monorepo-template/commit/ace926931e6d2bf97f8086ec9b32ac1999ddd56c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Improve `setPkgJson` so dependency updates skip downgrades by comparing versions with semver, and add test coverage for the new behavior.

## 2.0.8

### Patch Changes

- [`b685002`](https://github.com/sonofmagic/monorepo-template/commit/b68500259af733e37ae0301ebb1678ceffae3e6d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Improve unit test coverage for CLI helpers and template packages.

## 2.0.7

### Patch Changes

- [`30bdd3c`](https://github.com/sonofmagic/monorepo-template/commit/30bdd3c16c134457cea74d449db01d881115e656) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 2.0.6

### Patch Changes

- [`a035f9c`](https://github.com/sonofmagic/monorepo-template/commit/a035f9c800b6daadfb17b0a5247db5caba6343a0) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 2.0.5

### Patch Changes

- [`2f4987f`](https://github.com/sonofmagic/monorepo-template/commit/2f4987f0124835aa5285ea81dc156c83dae77e9c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 2.0.3

### Patch Changes

- [`49056aa`](https://github.com/sonofmagic/monorepo-template/commit/49056aa67b665c823f120ef07a0223ca257358bc) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 2.0.2

### Patch Changes

- [`6d347ad`](https://github.com/sonofmagic/monorepo-template/commit/6d347ad1c9ec669878871ca9c1a0c5a153d8d0d1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 2.0.1

### Patch Changes

- [`b1e3200`](https://github.com/sonofmagic/monorepo-template/commit/b1e3200f2e19afb3a5b6c50f68a26d927089548e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 2.0.0

### Major Changes

- [`51bc3dd`](https://github.com/sonofmagic/monorepo-template/commit/51bc3dd0d244190606d8402f28eafce30b9b933e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - ## 重大更新说明

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

## 1.2.4

### Patch Changes

- [`484d3c8`](https://github.com/sonofmagic/monorepo-template/commit/484d3c82438c13758e3300c6db6888cda9277232) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.2.3

### Patch Changes

- [`91c6377`](https://github.com/sonofmagic/monorepo-template/commit/91c637727429b22968cf69457737ce5bded7c9b4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: remove big dts file

## 1.2.2

### Patch Changes

- [`d1550ae`](https://github.com/sonofmagic/monorepo-template/commit/d1550ae5cdf73dbe06adcd47a61ce3dbce3d5acb) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade eslint

## 1.2.1

### Patch Changes

- [`7498c4a`](https://github.com/sonofmagic/monorepo-template/commit/7498c4a52d2cd3f98284814d6fad35eb1b17c201) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: template copy to files

## 1.2.0

### Minor Changes

- [`35f403a`](https://github.com/sonofmagic/monorepo-template/commit/35f403a366f8a1c6eb20c1baee352bdcc36789b0) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加 server , client, cli 模板

## 1.1.8

### Patch Changes

- [`2f0b860`](https://github.com/sonofmagic/monorepo-template/commit/2f0b8601872bfa4f94a94d03c71d1a0ed9eb0c18) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.1.7

### Patch Changes

- [`aecf565`](https://github.com/sonofmagic/monorepo-template/commit/aecf56513a4f14de48696780cb0714fc052469ba) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.1.6

### Patch Changes

- [`5059f6b`](https://github.com/sonofmagic/monorepo-template/commit/5059f6b0f97bf454440d342a580b88c10848b91e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.1.5

### Patch Changes

- [`f178672`](https://github.com/sonofmagic/monorepo-template/commit/f17867218f8a7943449a966377ff63648dd8655d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade deps

## 1.1.4

### Patch Changes

- [`0acee04`](https://github.com/sonofmagic/monorepo-template/commit/0acee046bcab6c6799e03a08809e033ef9a3b287) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 升级 `@icebreakers/eslint-config` 到 `1.4.0`, 添加 `tailwindcss@4` 支持

## 1.1.3

### Patch Changes

- [`f3c12f7`](https://github.com/sonofmagic/monorepo-template/commit/f3c12f7f45b25a8afb189bf29b15ae0fe77862af) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade setup-node from 4 to 5

## 1.1.2

### Patch Changes

- [`2a13f92`](https://github.com/sonofmagic/monorepo-template/commit/2a13f9202c5af268ca22a57f81321c8f275819ae) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 升级 pnpm 版本

## 1.1.1

### Patch Changes

- [`83860a8`](https://github.com/sonofmagic/monorepo-template/commit/83860a89994c764ed310eeb1d1c955f2a28b5ac4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - docs: update

## 1.1.0

### Minor Changes

- [`660f406`](https://github.com/sonofmagic/monorepo-template/commit/660f4060ce9d2d41fa881b8e163c18d44497ab01) Thanks [@sonofmagic](https://github.com/sonofmagic)! - refactor: @icebreakers/monorepo

## 1.0.17

### Patch Changes

- [`23ae5a0`](https://github.com/sonofmagic/monorepo-template/commit/23ae5a094904e2cb149f8861bf040091e61cb59e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 增强 clean 命令

## 1.0.15

### Patch Changes

- [`f612395`](https://github.com/sonofmagic/monorepo-template/commit/f6123958f4236bad3296f7bf8cb5c952fb04bd48) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.0.14

### Patch Changes

- [`547cbef`](https://github.com/sonofmagic/monorepo-template/commit/547cbef27ce7b11776cd7aae1542aa8d296487b2) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(vue-lib-template): add tailwindcss

## 1.0.12

### Patch Changes

- [`8da3534`](https://github.com/sonofmagic/monorepo-template/commit/8da3534256ef4733194d9bb94c0d4970426d53d2) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 更新 vue 模板

## 1.0.11

### Patch Changes

- [`05c5606`](https://github.com/sonofmagic/monorepo-template/commit/05c560648e2cd82412fb82c9a2d8279c96a21bcc) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: add skip-overwrite options and commitlint script

## 1.0.7

### Patch Changes

- [`db3001f`](https://github.com/sonofmagic/monorepo-template/commit/db3001fcb45bd74d00e80d9cd08e6bfd86d8a4a1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade version

## 1.0.6

### Patch Changes

- [`e40bab0`](https://github.com/sonofmagic/monorepo-template/commit/e40bab0eb958bd73906b070a35c8a241916f0402) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- [`ddc7d98`](https://github.com/sonofmagic/monorepo-template/commit/ddc7d981ee84c11999beaa9aa05cfeeb41177d7b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

## 1.0.5

### Patch Changes

- [`50dedac`](https://github.com/sonofmagic/monorepo-template/commit/50dedac2185884cc02601c3c04931341da2f3691) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

## 1.0.4

### Patch Changes

- [`9cee86b`](https://github.com/sonofmagic/monorepo-template/commit/9cee86bc713a00ec604be7472cc4b96cf709c94a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

## 1.0.3

### Patch Changes

- [`89a3797`](https://github.com/sonofmagic/monorepo-template/commit/89a37976c96fb48d205b328e880fec6db1251114) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: sync deps

## 1.0.2

### Patch Changes

- [`2d476ca`](https://github.com/sonofmagic/monorepo-template/commit/2d476ca3ed97a783641bef6c18463adee8f9a6e5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: rename template

## 1.0.1

### Patch Changes

- [`5b0f078`](https://github.com/sonofmagic/monorepo-template/commit/5b0f07808fca25560f36d87b3e0f992e005ac0dc) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: add setChangeset for `script:init`

## 1.0.0

### Major Changes

- [`4e4e97d`](https://github.com/sonofmagic/monorepo-template/commit/4e4e97d59f81e32066b31e2737c948db86e2acca) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore!: 提升依赖最低需要 nodejs@20 版本

## 0.7.9

### Patch Changes

- [`98c85fd`](https://github.com/sonofmagic/monorepo-template/commit/98c85fd3528a0714699411772202b8d7a5aaa195) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 默认 new 模板更改 unbuild，同时使用 stub 进行多个项目进行链接

## 0.7.3

### Patch Changes

- [`e329a9a`](https://github.com/sonofmagic/monorepo-template/commit/e329a9a649ba60dc7b825920fbce17ec5977dedb) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: add vitest.workspace.ts vitest vscode plugin

## 0.7.2

### Patch Changes

- [`6e613a1`](https://github.com/sonofmagic/monorepo-template/commit/6e613a1eba65014d19855a3eb5da31c356feb767) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat!: upgrade pnpm from 9 -> 10

## 0.7.1

### Patch Changes

- [`8f81cac`](https://github.com/sonofmagic/monorepo-template/commit/8f81cacd86041462f1ffe62f45793a7c95ae6be8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 0.7.0

### Minor Changes

- [`33139f4`](https://github.com/sonofmagic/monorepo-template/commit/33139f4da024f87127e4242e2e8b812658235c73) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: confirmOverwrite default true

## 0.6.23

### Patch Changes

- [`a7a62de`](https://github.com/sonofmagic/monorepo-template/commit/a7a62de070cae2485f374827d571a3465e2de32d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 0.6.19

### Patch Changes

- [`96576d1`](https://github.com/sonofmagic/monorepo-template/commit/96576d1b107066f7c46f2ab458dc2e4ea1a4f593) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 0.6.18

### Patch Changes

- [`3f25923`](https://github.com/sonofmagic/monorepo-template/commit/3f259234ed2e2cdf0069ab647511fd29327b3d1e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 0.6.17

### Patch Changes

- [`a4aa3e9`](https://github.com/sonofmagic/monorepo-template/commit/a4aa3e9e201668bcc116e495f8fb5d90d9e59826) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: sonar issue

## 0.6.14

### Patch Changes

- [`ee96d2f`](https://github.com/sonofmagic/monorepo-template/commit/ee96d2f76f1ea2bc8ff5b899e119f1a045ee8702) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加 command 的 description

## 0.6.13

### Patch Changes

- [`0196b4a`](https://github.com/sonofmagic/monorepo-template/commit/0196b4a79fd51577e6aadfeb0239c00a49b9fbb3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 0.6.3

### Patch Changes

- [`1b1f95e`](https://github.com/sonofmagic/monorepo-template/commit/1b1f95e6f67666b95c3844187a030a942e514ae1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 默认不覆盖 workspace: 注册的包，cnpm sync 的时候，默认跳过 root 的包，只包括那些 workspace

## 0.5.0

### Minor Changes

- [`5b9a48f`](https://github.com/sonofmagic/monorepo-template/commit/5b9a48f0037aed5fc29520cbc91b5be59e647ee3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 内置整个 cli 功能，去除 scripts/monorepo 相关功能

## 0.4.6

### Patch Changes

- [`d85811a`](https://github.com/sonofmagic/monorepo-template/commit/d85811a60ef85df3beb2a2e0c9bdb332d1656e6a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: github action ci/pr error
