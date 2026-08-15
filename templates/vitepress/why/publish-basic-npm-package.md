# Publishing An npm Package

1. Define explicit runtime and type entrypoints.
2. Build the package and run tests against built artifacts.
3. Inspect `pnpm pack` output.
4. Record a change intent and verify the version plan.
5. Publish with provenance and the intended access level.

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm tsd
pnpm test
pnpm pack
pnpm change
```

Never publish template source workspaces that are intentionally marked `private: true`.
