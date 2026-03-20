// @ts-check

import { defineMonorepoLintStagedConfig } from '@icebreakers/monorepo/tooling'

/**
 * Root `lint-staged` config.
 *
 * Loaded from `monorepo.config.ts -> tooling.lintStaged`.
 * The shared helper already wires ESLint, Stylelint and staged typecheck defaults.
 *
 * @type {import('@icebreakers/monorepo/tooling').MonorepoLintStagedConfig}
 */
const config = await defineMonorepoLintStagedConfig()

export default config
