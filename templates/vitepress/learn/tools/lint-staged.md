# lint-staged

lint-staged runs focused checks against files staged for a commit. It keeps the pre-commit hook quick while preserving the same ESLint, Stylelint, and typecheck rules used elsewhere in the workspace.

## Recommended responsibility

Use lint-staged for checks that can safely operate on selected files. Keep full builds, integration tests, and release checks in `repo check --full` or CI.

```js
// lint-staged.config.js
export default {
  '*.{js,mjs,cjs,ts,tsx,vue}': ['eslint --fix'],
  '*.{css,scss,less,vue}': ['stylelint --fix'],
}
```

repoctl-managed workspaces also route staged TypeScript and Vue files into the appropriate workspace typecheck command. This matters because Vue packages need `vue-tsc`, while TypeScript-only packages use `tsc`.

## Pair it with Husky

```sh
# .husky/pre-commit
pnpm exec repo verify pre-commit
```

The hook selects repoctl's pre-commit workflow. That workflow can call lint-staged without embedding a second copy of the configuration in the hook file.

## Safe fixes

- Use `--fix` only for deterministic formatting and lint repairs.
- Do not stage unrelated generated output from a task.
- Run `pnpm lint` before opening a pull request because it covers more than staged files.
- Test hook behavior from a clean index, not only with already-staged fixes.

## Keep Reading

- [Husky](./husky.md)
- [Verification](/tasks/checks)
- [Add checks to CI](/tasks/ci)
