import { defineEslintConfig } from 'repoctl/tooling'

const config = await defineEslintConfig()

export default [
  ...config,
  {
    ignores: [
      'packages/monorepo/test/fixtures/demo/**',
      'templates/vitepress/.vitepress/config.ts.timestamp-*.mjs',
    ],
  },
]
