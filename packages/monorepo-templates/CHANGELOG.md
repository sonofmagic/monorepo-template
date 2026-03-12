# @icebreakers/monorepo-templates

## 0.1.14

### Patch Changes

- 🐛 **deps: upgrade** [`505a29c`](https://github.com/sonofmagic/monorepo-template/commit/505a29c483f47f1ec7e04ff38dea7d331f65c951) by @sonofmagic

## 0.1.13

### Patch Changes

- 🐛 **deps: upgrade** [`d469409`](https://github.com/sonofmagic/monorepo-template/commit/d469409e065962372b1f9da5548e687f80b4ca33) by @sonofmagic

- 🐛 **Rename the staged-file config from `lint-staged.config.js` to `nano-staged.js` and update generated monorepo assets accordingly.** [`2bf7b94`](https://github.com/sonofmagic/monorepo-template/commit/2bf7b94018c8c4dcf0608af0984a24737b330fe5) by @sonofmagic

## 0.1.12

### Patch Changes

- 🐛 **deps: upgrade** [`52c30b0`](https://github.com/sonofmagic/monorepo-template/commit/52c30b0325a36e10f69eb36d90f794623d5ae5e1) by @sonofmagic

## 0.1.11

### Patch Changes

- 🐛 **Improve `monorepo up` AGENTS handling and harden related type checks.** [`80a4318`](https://github.com/sonofmagic/monorepo-template/commit/80a4318faee69830a66902f175cc709962918abe) by @sonofmagic
  - Include `AGENTS.md` in upgrade asset targets.
  - Merge `AGENTS.md` by section instead of blindly overwriting existing content.
  - Fix TypeScript issues in `@icebreakers/monorepo` tests and `@icebreakers/monorepo-templates` scaffold options under `exactOptionalPropertyTypes`.

## 0.1.10

### Patch Changes

- 🐛 **Enforce stricter commit-time quality gates in scaffolded projects.** [`ac7b512`](https://github.com/sonofmagic/monorepo-template/commit/ac7b512e2aa506491381dde0299da2faaa88e375) by @sonofmagic

  - Add Stylelint checks for staged style files (including Vue SFC style blocks) in `lint-staged.config.js`.
  - Update agent rules to require build-first validation, ESLint/Stylelint, TypeScript error fixes, and `tsd` tests for TypeScript libraries before running test suites.

- 🐛 **Remove the deprecated VS Code ESLint lookup flag from template settings and upgrade fixtures.** [`b2e7b9f`](https://github.com/sonofmagic/monorepo-template/commit/b2e7b9fd3f089b3a46215618092b361e4382d06e) by @sonofmagic

## 0.1.9

### Patch Changes

- 🐛 **Replace maintainer email metadata across packages and templates.** [`e3bd746`](https://github.com/sonofmagic/monorepo-template/commit/e3bd7460f2a48ca986b8a3c585be2f9235d5ec0f) by @sonofmagic

## 0.1.8

### Patch Changes

- 🐛 **deps: upgrade** [`408aee2`](https://github.com/sonofmagic/monorepo-template/commit/408aee277da61f071ef0bc57c6afb19e2399b354) by @sonofmagic

## 0.1.7

### Patch Changes

- 🐛 **chore(deps): upgrade** [`3b1f6c9`](https://github.com/sonofmagic/monorepo-template/commit/3b1f6c9b64a8a665d933492014ef9653aacfa000) by @sonofmagic

## 0.1.6

### Patch Changes

- 🐛 **chore(deps): upgrade** [`0001c27`](https://github.com/sonofmagic/monorepo-template/commit/0001c273fef5e8b5ce0b51a4faee53d6f669f0e9) by @sonofmagic

## 0.1.5

### Patch Changes

- 🐛 **chore(deps): upgrade jsdom** [`d8a61a6`](https://github.com/sonofmagic/monorepo-template/commit/d8a61a6accc1f0a9bfefbd8ac3c4a6924ae09f87) by @sonofmagic

## 0.1.4

### Patch Changes

- 🐛 **chore(deps): upgrade** [`10ee9a6`](https://github.com/sonofmagic/monorepo-template/commit/10ee9a6946d607bbbb320ab028a0eb3d9797fe25) by @sonofmagic

## 0.1.3

### Patch Changes

- 🐛 **chore(deps): upgrade** [`2e19f0d`](https://github.com/sonofmagic/monorepo-template/commit/2e19f0d59346c497b35b000d3a2deffd3365f771) by @sonofmagic

## 0.1.2

### Patch Changes

- 🐛 **refactor vue-lib template to library-only layout** [`8258df9`](https://github.com/sonofmagic/monorepo-template/commit/8258df91e300e4cdbc39962495264aa43fe8e019) by @sonofmagic

- 🐛 **refactor scaffolding to share template copy utilities** [`403e513`](https://github.com/sonofmagic/monorepo-template/commit/403e51348ed1a26ab9d8e6f5f2bce3f11f08bf60) by @sonofmagic

## 0.1.1

### Patch Changes

- 🐛 **Consolidate skeleton into assets and scaffold new projects from assets.** [`4e50f39`](https://github.com/sonofmagic/monorepo-template/commit/4e50f39fec14b846a125fb880d4ce8076d51ae26) by @sonofmagic

## 0.1.0

### Minor Changes

- ✨ **新增模板资源包，包含最小根骨架与可选应用/包模板。** [`004f522`](https://github.com/sonofmagic/monorepo-template/commit/004f522ad32e8201860dd36b92900ac529a9ce68) by @sonofmagic

- ✨ **新增模板过滤与 gitignore 工具并集中复用，统一模板复制的忽略规则与文件名转换逻辑。** [`33133d7`](https://github.com/sonofmagic/monorepo-template/commit/33133d725c2575daac6e6db08fa681088009da15) by @sonofmagic

### Patch Changes

- 🐛 **将 commander、inquirer 与 execa 统一放入 monorepo-templates，并用更规范的 Commander 风格重写 create-icebreaker 的 CLI 解析。** [`e85a1df`](https://github.com/sonofmagic/monorepo-template/commit/e85a1df934c705eda24ad553d2c0844b16cb0f24) by @sonofmagic
