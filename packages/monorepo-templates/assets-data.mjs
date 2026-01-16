const coreAssetTargets = [
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

const extraAssetTargets = [
  // renovate
  '.github',
  'LICENSE',
  'renovate.json',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'netlify.toml',
]

export const assetTargets = [...coreAssetTargets, ...extraAssetTargets]

export function getAssetTargets(core = false) {
  return core ? [...coreAssetTargets] : [...assetTargets]
}
