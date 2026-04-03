import { defineEslintConfig } from 'repoctl/tooling'

const config = await defineEslintConfig()

export default [
  ...config,
  {
    ignores: [
      'templates/vitepress/.vitepress/config.ts.timestamp-*.mjs',
    ],
  },
]
