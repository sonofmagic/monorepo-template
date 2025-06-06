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
    // 'vitest.workspace.ts',
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
    'tsup-template/src',
    'tsup-template/test',
    'tsup-template/package.json',
    'tsup-template/tsconfig.json',
    'tsup-template/tsup.config.ts',
    'tsup-template/vitest.config.ts',
    // unbuild
    'unbuild-template/src',
    'unbuild-template/test',
    'unbuild-template/package.json',
    'unbuild-template/tsconfig.json',
    'unbuild-template/build.config.ts',
    'unbuild-template/vitest.config.ts',
    // vite lib mode
    'vue-lib-template/lib',
    'vue-lib-template/src',
    'vue-lib-template/test',
    'vue-lib-template/package.json',
    'vue-lib-template/tsconfig.json',
    'vue-lib-template/vite.shared.config.ts',
    'vue-lib-template/vite.config.ts',
    'vue-lib-template/vitest.config.ts',
    'vue-lib-template/eslint.config.js',
    'vue-lib-template/index.html',
    'vue-lib-template/tsconfig.app.json',
    'vue-lib-template/tsconfig.node.json',
    'vue-lib-template/tsconfig.test.json',
  ]
}
