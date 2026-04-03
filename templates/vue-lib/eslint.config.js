import { ensureToolingBuilt } from '../../tooling/ensure-tooling-built.mjs'

await ensureToolingBuilt()

const { defineEslintConfig } = await import('repoctl/tooling')

export default await defineEslintConfig({
  options: {
    vue: true,
    typescript: true,
    ignores: ['**/fixtures/**'],
  },
})
