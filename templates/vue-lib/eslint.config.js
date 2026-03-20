// @ts-check

import { createMonorepoEslintConfig } from '@icebreakers/monorepo/tooling'

/**
 * Template ESLint config for the Vue library package.
 *
 * Extends the shared monorepo defaults with Vue-specific linting presets.
 *
 * @type {import('@icebreakers/monorepo/tooling').MonorepoEslintConfig}
 */
const config = createMonorepoEslintConfig({
  vue: true,
  typescript: true,
  ignores: ['**/fixtures/**'],
})

export default config
