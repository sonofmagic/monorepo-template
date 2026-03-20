import { fileURLToPath } from 'node:url'
import { createMonorepoEslintConfig } from '@icebreakers/monorepo/tooling'

const tailwindEntryPoint = fileURLToPath(new URL('./src/style.css', import.meta.url))

export default createMonorepoEslintConfig({
  vue: true,
  typescript: true,
  tailwindcss: {
    entryPoint: tailwindEntryPoint,
  },
  ignores: ['**/fixtures/**'],
})
