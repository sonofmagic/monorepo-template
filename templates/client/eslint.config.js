// @ts-check

import { fileURLToPath } from 'node:url'
import { createMonorepoEslintConfig } from '@icebreakers/monorepo/tooling'

const tailwindEntryPoint = fileURLToPath(new URL('./src/style.css', import.meta.url))

/**
 * Template ESLint config for the Vue client app.
 *
 * Adds Vue + TypeScript support on top of the shared monorepo defaults.
 *
 * @type {import('@icebreakers/monorepo/tooling').MonorepoEslintConfig}
 */
const config = createMonorepoEslintConfig({
  vue: true,
  typescript: true,
  tailwindcss: {
    entryPoint: tailwindEntryPoint,
  },
  ignores: ['**/fixtures/**'],
})

export default config
