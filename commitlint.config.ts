import type { MonorepoCommitlintConfig } from '@icebreakers/monorepo/tooling'
import { defineMonorepoCommitlintConfig } from '@icebreakers/monorepo/tooling'

/**
 * Root commitlint config.
 *
 * Loaded from `monorepo.config.ts -> tooling.commitlint`.
 * See `defineMonorepoCommitlintConfig()` JSDoc for supported defaults and examples.
 */
const config: MonorepoCommitlintConfig = await defineMonorepoCommitlintConfig()

export default config
