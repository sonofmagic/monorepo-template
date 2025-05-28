export function getAssetTargets(raw?: boolean) {
  const list: string[] = [
    '.changeset',
    '.husky',
    '.vscode',
    '.editorconfig',
    '.gitattributes',
    '.gitignore',
    '.npmrc',
    'commitlint.config.ts',
    'eslint.config.js',
    'lint-staged.config.js',
    'stylelint.config.js',
    'package.json',
    // pnpm
    'pnpm-workspace.yaml',
    // base tsconfig
    'tsconfig.json',
    // turbo
    'turbo.json',
    // vitest
    'vitest.config.ts',
    'vitest.workspace.ts',
    // #region docker
    'Dockerfile',
    '.dockerignore',
    // #endregion
  ]
  if (!raw) {
    // renovate
    list.push('.github', 'LICENSE', 'renovate.json', 'SECURITY.md', 'CODE_OF_CONDUCT.md', 'CONTRIBUTING.md', 'netlify.toml')
  }
  return list
}

export function getTemplateTargets() {
  return [
    // tsup
    'bar/src',
    'bar/test',
    'bar/package.json',
    'bar/tsconfig.json',
    'bar/tsup.config.ts',
    'bar/vitest.config.ts',
    // unbuild
    'foo/src',
    'foo/test',
    'foo/package.json',
    'foo/tsconfig.json',
    'foo/build.config.ts',
    'foo/vitest.config.ts',
    // vite lib mode
    'vue-ui/lib',
    'vue-ui/src',
    'vue-ui/test',
    'vue-ui/package.json',
    'vue-ui/tsconfig.json',
    'vue-ui/vite.shared.config.ts',
    'vue-ui/vite.config.ts',
    'vue-ui/vitest.config.ts',
    'vue-ui/eslint.config.js',
    'vue-ui/index.html',
    'vue-ui/tsconfig.app.json',
    'vue-ui/tsconfig.node.json',
    'vue-ui/tsconfig.test.json',
  ]
}
