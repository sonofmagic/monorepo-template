// @ts-check

import { defineLintStagedConfig } from '@icebreakers/monorepo/tooling'

/**
 * Scaffolded `lint-staged` config.
 *
 * Generated projects inherit the shared staged lint + staged typecheck pipeline.
 *
 * @type {import('@icebreakers/monorepo/tooling').MonorepoLintStagedConfig}
 */
const config = await defineLintStagedConfig()

export default config
