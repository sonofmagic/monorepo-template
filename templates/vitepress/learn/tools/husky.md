# Husky

Husky connects Git hooks to versioned repository scripts. In a repoctl workspace it is only a trigger: the actual verification lives in `repo verify` so people, CI, and hooks use the same contract.

## Recommended hooks

```sh
# .husky/pre-commit
pnpm exec repo verify pre-commit

# .husky/commit-msg
pnpm exec repo verify commit-msg "$1"

# .husky/pre-push
pnpm exec repo verify pre-push
```

Keep hooks small. A hook should select a repository task, not duplicate lint, typecheck, or build commands that will drift from CI.

## What each hook protects

| Hook         | Purpose                              | Usual scope                                         |
| ------------ | ------------------------------------ | --------------------------------------------------- |
| `pre-commit` | Fast feedback before a commit exists | Staged formatting, lint, and typecheck              |
| `commit-msg` | Enforce the commit message contract  | The pending commit message file                     |
| `pre-push`   | Catch broader integration failures   | Root checks and affected build, test, and tsd tasks |

`repo doctor` reports incomplete Husky and lint-staged configuration. Use `repo upgrade --no-overwrite` to preview managed hook changes before accepting them.

## Install and initialize

```bash
pnpm add -D husky
pnpm exec husky init
```

The initializer creates `.husky/pre-commit`. Replace its generated command with the repository task instead of adding a second tool-specific pipeline.

## Troubleshooting

- Confirm the hook file is executable after a fresh clone.
- Run the command from the hook directly before debugging Git.
- Do not use interactive prompts in a hook.
- Keep network calls and release work out of `pre-commit`.

## Keep Reading

- [lint-staged](./lint-staged.md)
- [Add checks to CI](/tasks/ci)
- [Verification](/tasks/checks)
