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
    'ui/lib',
    'ui/src',
    'ui/test',
    'ui/package.json',
    'ui/tsconfig.json',
    'ui/vite.shared.config.ts',
    'ui/vite.config.ts',
    'ui/vitest.config.ts',
    'ui/eslint.config.js',
    'ui/index.html',
    'ui/tsconfig.app.json',
    'ui/tsconfig.node.json',
    'ui/tsconfig.test.json',
  ]
}
