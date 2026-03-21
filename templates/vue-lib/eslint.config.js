import { createMonorepoEslintConfig } from 'repoctl/tooling'

export default createMonorepoEslintConfig({
  vue: true,
  typescript: true,
  ignores: ['**/fixtures/**'],
})
