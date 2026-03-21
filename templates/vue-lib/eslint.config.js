import { defineEslintConfig } from 'repoctl/tooling'

export default await defineEslintConfig({
  config: {
    vue: true,
    typescript: true,
    ignores: ['**/fixtures/**'],
  },
})
