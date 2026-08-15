# Husky

Husky connects repository scripts to Git hooks. repoctl-managed workspaces use it as a thin entrypoint, keeping verification logic in versioned commands.

```sh
# .husky/pre-commit
pnpm exec repo verify pre-commit
```

Use `commit-msg` for commitlint and `pre-push` for broader build and test verification. Hooks should remain fast enough for local work and should not contain duplicated task logic.

`repo doctor` reports when Husky and lint-staged are only partially configured. `repo upgrade` can synchronize the managed defaults.
