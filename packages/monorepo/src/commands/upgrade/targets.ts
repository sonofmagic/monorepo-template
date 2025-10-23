/**
 * 根据 core 模式返回需要同步的资产目录。
 * core=true 时仅包含最小集，便于内联到其他项目。
 */
export function getAssetTargets(core?: boolean) {
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
    'monorepo.config.ts',
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
  if (!core) {
    // renovate
    list.push('.github', 'LICENSE', 'renovate.json', 'SECURITY.md', 'CODE_OF_CONDUCT.md', 'CONTRIBUTING.md', 'netlify.toml')
  }
  return list
}
