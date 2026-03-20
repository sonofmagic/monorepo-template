import { createMonorepoEslintConfig } from '@icebreakers/monorepo/tooling'

export default createMonorepoEslintConfig({
  vue: true,
  typescript: true,
  ignores: ['**/fixtures/**'],
})
