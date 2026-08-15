# lint-staged

lint-staged runs checks only for files included in the next commit.

The repository policy routes JavaScript, TypeScript, and Vue files through ESLint, style files through Stylelint, and TypeScript or Vue files to the owning workspace's typecheck script.

```bash
pnpm exec repo verify pre-commit
pnpm exec repo verify staged-typecheck <files...>
```

Vue workspaces should use `vue-tsc`; plain TypeScript workspaces should use `tsc`. Keep the routing in `lint-staged.config.js` so local hooks and CI can share the same contract.
