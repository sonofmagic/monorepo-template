# Turborepo

Turborepo runs the monorepo task graph and caches repeatable work.

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

Root scripts delegate to `turbo run`. Package scripts define the actual build, lint, typecheck, and test commands; `turbo.json` defines dependencies, inputs, outputs, and cache behavior.

Mark generated artifacts as task outputs and declare upstream dependencies such as `build` before tests that consume built packages.
