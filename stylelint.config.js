// @ts-check

import { defineMonorepoStylelintConfig } from '@icebreakers/monorepo/tooling'

/**
 * Root Stylelint config.
 *
 * Loaded from `monorepo.config.ts -> tooling.stylelint`.
 * Hover `defineMonorepoStylelintConfig()` for the shared defaults and extension points.
 *
 * @type {import('@icebreakers/monorepo/tooling').MonorepoStylelintConfig}
 */
const config = await defineMonorepoStylelintConfig()

export default config
