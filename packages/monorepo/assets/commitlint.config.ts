import type { MonorepoCommitlintConfig } from '@icebreakers/monorepo/tooling'
import { defineCommitlintConfig } from '@icebreakers/monorepo/tooling'

/**
 * Scaffolded commitlint config.
 *
 * Generated projects can override shared defaults via `monorepo.config.ts -> tooling.commitlint`.
 */
const config: MonorepoCommitlintConfig = await defineCommitlintConfig()

export default config
