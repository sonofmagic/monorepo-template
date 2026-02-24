import { fileURLToPath } from 'node:url'
import { icebreaker } from '@icebreakers/eslint-config'

const tailwindEntryPoint = fileURLToPath(new URL('./src/style.css', import.meta.url))

export default icebreaker(
  {
    vue: true,
    typescript: true,
    tailwindcss: {
      entryPoint: tailwindEntryPoint,
    },
    ignores: ['**/fixtures/**'],
  },
)
