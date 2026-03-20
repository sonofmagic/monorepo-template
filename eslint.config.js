// @ts-check

import { defineMonorepoEslintConfig } from '@icebreakers/monorepo/tooling'

/**
 * Root ESLint flat config.
 *
 * Loaded from `monorepo.config.ts -> tooling.eslint`.
 * Hover `defineMonorepoEslintConfig()` or `MonorepoEslintConfig` for full defaults and usage notes.
 *
 * @type {import('@icebreakers/monorepo/tooling').MonorepoEslintConfig}
 */
const config = await defineMonorepoEslintConfig()

export default config
