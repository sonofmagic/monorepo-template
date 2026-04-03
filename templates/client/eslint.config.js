import { fileURLToPath } from 'node:url'
import { loadRepoctlToolingModule } from '../../tooling/load-tooling-module.mjs'

const { defineEslintConfig } = await loadRepoctlToolingModule()

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
