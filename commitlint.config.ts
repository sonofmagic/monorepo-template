import process from 'node:process'
import { createMonorepoCommitlintConfig, loadMonorepoToolingConfig } from '@icebreakers/monorepo/tooling'

const toolingConfig = await loadMonorepoToolingConfig(process.cwd())

export default createMonorepoCommitlintConfig(toolingConfig.commitlint)
