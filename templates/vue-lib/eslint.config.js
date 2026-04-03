import { loadRepoctlToolingModule } from '../../tooling/load-tooling-module.mjs'

const { defineEslintConfig } = await loadRepoctlToolingModule()

export default await defineEslintConfig({
  options: {
    vue: true,
    typescript: true,
    ignores: ['**/fixtures/**'],
  },
})
