# create-icebreaker

## 1.0.0

### Major Changes

- 🚀 **Remove the legacy `tsup` and `unbuild` library templates from the repository and scaffolding flow.** [`5a0dae9`](https://github.com/sonofmagic/monorepo-template/commit/5a0dae99cc3c0eef74f88c1c0da01c5f58552042) by @sonofmagic
  - `monorepo new`, `repoctl new`, and `create-icebreaker` no longer offer `tsup` or `unbuild` as built-in template keys. The bundled template asset set and related docs have been updated to standardize on `tsdown` as the only generic TypeScript library template.

### Patch Changes

- 🐛 **Align scaffold completion guidance with the repoctl onboarding flow and add package-local Vitest coverage for the generated next-step output.** [`ca711b1`](https://github.com/sonofmagic/monorepo-template/commit/ca711b1b12fb65f3c9dd223b04443af2981d84a7) by @sonofmagic

- 🐛 **Add task-first `repoctl` entrypoints such as `init`, `new`, `check`, and `upgrade`, plus compatibility top-level commands for `sync`, `clean`, and `mirror`.** [`72ebd27`](https://github.com/sonofmagic/monorepo-template/commit/72ebd27b7498ee6f9176d984612a0496a201d140) by @sonofmagic

  - Refresh the guided package creation flow to start from user intent, add `init --preset` support, and align package docs, template docs, and create-icebreaker guidance around the new lower-cost onboarding path.

- 🐛 **Add the new `repoctl` package as the preferred repo toolchain entrypoint while keeping `@icebreakers/monorepo` published and version-linked for compatibility. Template assets, docs, hooks, and config defaults now prefer `repoctl`, and cleanup/upgrade flows preserve whichever helper package a workspace already uses.** [`eb56ff6`](https://github.com/sonofmagic/monorepo-template/commit/eb56ff644072f18475914c8f2860747d1f96046b) by @sonofmagic

- 🐛 **Add `tsd` type tests to library workspaces, wire a repository-level `tsd` task into Turbo validation, and fix the server template typecheck regression blocking full workspace checks.** [`15d7ac1`](https://github.com/sonofmagic/monorepo-template/commit/15d7ac1a2ef24a68ace40b2c41af2e491bb27a9f) by @sonofmagic
- 📦 **Dependencies** [`eb56ff6`](https://github.com/sonofmagic/monorepo-template/commit/eb56ff644072f18475914c8f2860747d1f96046b)
  → `@icebreakers/monorepo-templates@1.0.0`

## 0.1.16

### Patch Changes

- 📦 **Dependencies** [`8056ffa`](https://github.com/sonofmagic/monorepo-template/commit/8056ffa380c765dae04de22ae21951216154ce8b)
  → `@icebreakers/monorepo-templates@0.1.16`

## 0.1.15

### Patch Changes

- 📦 **Dependencies** [`454e65b`](https://github.com/sonofmagic/monorepo-template/commit/454e65b29e92dd7951261a28128cf8977bc5f290)
  → `@icebreakers/monorepo-templates@0.1.15`

## 0.1.14

### Patch Changes

- 📦 **Dependencies** [`505a29c`](https://github.com/sonofmagic/monorepo-template/commit/505a29c483f47f1ec7e04ff38dea7d331f65c951)
  → `@icebreakers/monorepo-templates@0.1.14`

## 0.1.13

### Patch Changes

- 📦 **Dependencies** [`d469409`](https://github.com/sonofmagic/monorepo-template/commit/d469409e065962372b1f9da5548e687f80b4ca33)
  → `@icebreakers/monorepo-templates@0.1.13`

## 0.1.12

### Patch Changes

- 📦 **Dependencies** [`52c30b0`](https://github.com/sonofmagic/monorepo-template/commit/52c30b0325a36e10f69eb36d90f794623d5ae5e1)
  → `@icebreakers/monorepo-templates@0.1.12`

## 0.1.11

### Patch Changes

- 📦 **Dependencies** [`80a4318`](https://github.com/sonofmagic/monorepo-template/commit/80a4318faee69830a66902f175cc709962918abe)
  → `@icebreakers/monorepo-templates@0.1.11`

## 0.1.10

### Patch Changes

- 📦 **Dependencies** [`ac7b512`](https://github.com/sonofmagic/monorepo-template/commit/ac7b512e2aa506491381dde0299da2faaa88e375)
  → `@icebreakers/monorepo-templates@0.1.10`

## 0.1.9

### Patch Changes

- 🐛 **Replace maintainer email metadata across packages and templates.** [`e3bd746`](https://github.com/sonofmagic/monorepo-template/commit/e3bd7460f2a48ca986b8a3c585be2f9235d5ec0f) by @sonofmagic
- 📦 **Dependencies** [`e3bd746`](https://github.com/sonofmagic/monorepo-template/commit/e3bd7460f2a48ca986b8a3c585be2f9235d5ec0f)
  → `@icebreakers/monorepo-templates@0.1.9`

## 0.1.8

### Patch Changes

- 📦 **Dependencies** [`408aee2`](https://github.com/sonofmagic/monorepo-template/commit/408aee277da61f071ef0bc57c6afb19e2399b354)
  → `@icebreakers/monorepo-templates@0.1.8`

## 0.1.7

### Patch Changes

- 📦 **Dependencies** [`3b1f6c9`](https://github.com/sonofmagic/monorepo-template/commit/3b1f6c9b64a8a665d933492014ef9653aacfa000)
  → `@icebreakers/monorepo-templates@0.1.7`

## 0.1.6

### Patch Changes

- 📦 **Dependencies** [`0001c27`](https://github.com/sonofmagic/monorepo-template/commit/0001c273fef5e8b5ce0b51a4faee53d6f669f0e9)
  → `@icebreakers/monorepo-templates@0.1.6`

## 0.1.5

### Patch Changes

- 📦 **Dependencies** [`d8a61a6`](https://github.com/sonofmagic/monorepo-template/commit/d8a61a6accc1f0a9bfefbd8ac3c4a6924ae09f87)
  → `@icebreakers/monorepo-templates@0.1.5`

## 0.1.4

### Patch Changes

- 📦 **Dependencies** [`10ee9a6`](https://github.com/sonofmagic/monorepo-template/commit/10ee9a6946d607bbbb320ab028a0eb3d9797fe25)
  → `@icebreakers/monorepo-templates@0.1.4`

## 0.1.3

### Patch Changes

- 📦 **Dependencies** [`2e19f0d`](https://github.com/sonofmagic/monorepo-template/commit/2e19f0d59346c497b35b000d3a2deffd3365f771)
  → `@icebreakers/monorepo-templates@0.1.3`

## 0.1.2

### Patch Changes

- 🐛 **refactor scaffolding to share template copy utilities** [`403e513`](https://github.com/sonofmagic/monorepo-template/commit/403e51348ed1a26ab9d8e6f5f2bce3f11f08bf60) by @sonofmagic
- 📦 **Dependencies** [`8258df9`](https://github.com/sonofmagic/monorepo-template/commit/8258df91e300e4cdbc39962495264aa43fe8e019)
  → `@icebreakers/monorepo-templates@0.1.2`

## 0.1.1

### Patch Changes

- 🐛 **Consolidate skeleton into assets and scaffold new projects from assets.** [`4e50f39`](https://github.com/sonofmagic/monorepo-template/commit/4e50f39fec14b846a125fb880d4ce8076d51ae26) by @sonofmagic
- 📦 **Dependencies** [`4e50f39`](https://github.com/sonofmagic/monorepo-template/commit/4e50f39fec14b846a125fb880d4ce8076d51ae26)
  → `@icebreakers/monorepo-templates@0.1.1`

## 0.1.0

### Minor Changes

- ✨ **新增交互式初始化流程，支持模板选择裁剪，并提供 npm 模板源（默认，可用 `--source git` 切换）。** [`004f522`](https://github.com/sonofmagic/monorepo-template/commit/004f522ad32e8201860dd36b92900ac529a9ce68) by @sonofmagic

### Patch Changes

- 🐛 **将 commander、inquirer 与 execa 统一放入 monorepo-templates，并用更规范的 Commander 风格重写 create-icebreaker 的 CLI 解析。** [`e85a1df`](https://github.com/sonofmagic/monorepo-template/commit/e85a1df934c705eda24ad553d2c0844b16cb0f24) by @sonofmagic

- 🐛 **新增模板过滤与 gitignore 工具并集中复用，统一模板复制的忽略规则与文件名转换逻辑。** [`33133d7`](https://github.com/sonofmagic/monorepo-template/commit/33133d725c2575daac6e6db08fa681088009da15) by @sonofmagic
- 📦 **Dependencies** [`e85a1df`](https://github.com/sonofmagic/monorepo-template/commit/e85a1df934c705eda24ad553d2c0844b16cb0f24)
  → `@icebreakers/monorepo-templates@0.1.0`
