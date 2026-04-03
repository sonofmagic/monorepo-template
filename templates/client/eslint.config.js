import { fileURLToPath } from 'node:url'
import { ensureToolingBuilt } from '../../tooling/ensure-tooling-built.mjs'

await ensureToolingBuilt()

const { defineEslintConfig } = await import('repoctl/tooling')

const tailwindEntryPoint = fileURLToPath(new URL('./src/style.css', import.meta.url))

export default await defineEslintConfig({
  options: {
    vue: true,
    typescript: true,
    tailwindcss: {
      entryPoint: tailwindEntryPoint,
    },
    ignores: ['**/fixtures/**'],
  },
})
