# repoctl

## 4.0.0

### Major Changes

- 🚀 **Remove the legacy `tsup` and `unbuild` library templates from the repository and scaffolding flow.** [`5a0dae9`](https://github.com/sonofmagic/monorepo-template/commit/5a0dae99cc3c0eef74f88c1c0da01c5f58552042) by @sonofmagic
  - `monorepo new`, `repoctl new`, and `create-icebreaker` no longer offer `tsup` or `unbuild` as built-in template keys. The bundled template asset set and related docs have been updated to standardize on `tsdown` as the only generic TypeScript library template.

### Minor Changes

- ✨ **Add task-first `repoctl` entrypoints such as `init`, `new`, `check`, and `upgrade`, plus compatibility top-level commands for `sync`, `clean`, and `mirror`.** [`72ebd27`](https://github.com/sonofmagic/monorepo-template/commit/72ebd27b7498ee6f9176d984612a0496a201d140) by @sonofmagic

  - Refresh the guided package creation flow to start from user intent, add `init --preset` support, and align package docs, template docs, and create-icebreaker guidance around the new lower-cost onboarding path.

- ✨ **Add the new `repoctl` package as the preferred repo toolchain entrypoint while keeping `@icebreakers/monorepo` published and version-linked for compatibility. Template assets, docs, hooks, and config defaults now prefer `repoctl`, and cleanup/upgrade flows preserve whichever helper package a workspace already uses.** [`eb56ff6`](https://github.com/sonofmagic/monorepo-template/commit/eb56ff644072f18475914c8f2860747d1f96046b) by @sonofmagic

- ✨ **Remove the legacy `sync` CLI command and its related config support from the monorepo toolchain.** [`e7e26eb`](https://github.com/sonofmagic/monorepo-template/commit/e7e26eb0e962ecb9ddbf6a1f69a36e28dedf9302) by @sonofmagic

### Patch Changes

- 🐛 **Support `repoctl.config.*` as the preferred config filename, keep `monorepo.config.*` compatible, and fail fast when both are present in the same workspace.** [`8f4dec9`](https://github.com/sonofmagic/monorepo-template/commit/8f4dec98100f121111ff9ca4d4fe6e8bef001abc) by @sonofmagic

- 🐛 **Prefer `repoctl.config.ts` as the default generated config filename while keeping `monorepo.config.ts` compatible at runtime.** [`b66eccd`](https://github.com/sonofmagic/monorepo-template/commit/b66eccd34209de2713f490351f6f500501e44ef6) by @sonofmagic

- 🐛 **Add `rc` and `repo` bin aliases for the repo toolchain CLI.** [`437e738`](https://github.com/sonofmagic/monorepo-template/commit/437e738e19a9b006a84a32216016b65ed9bcaea0) by @sonofmagic

- 🐛 **Allow all default engineering config entrypoints to inherit overrides from `monorepo.config.ts`, including project-level Vitest defaults through `tooling.vitestProject`.** [`74d49db`](https://github.com/sonofmagic/monorepo-template/commit/74d49db5f1009aa4fe39a65088ff31df3779f301) by @sonofmagic

- 🐛 **Clarify npm package metadata so `repoctl` is presented as the default task-first CLI, while `@icebreakers/monorepo` is described as the underlying engine and compatibility package.** [`2584972`](https://github.com/sonofmagic/monorepo-template/commit/2584972528044fb8b2c5207581ba8b6cddcdbeba) by @sonofmagic
- 📦 **Dependencies** [`9372a11`](https://github.com/sonofmagic/monorepo-template/commit/9372a117c744c073084e439efcefb4a5123b2e64)
  → `@icebreakers/monorepo@4.0.0`
