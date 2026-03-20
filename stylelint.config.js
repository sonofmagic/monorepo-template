import process from 'node:process'
import { createMonorepoStylelintConfig, loadMonorepoToolingConfig } from '@icebreakers/monorepo/tooling'

const toolingConfig = await loadMonorepoToolingConfig(process.cwd())

export default createMonorepoStylelintConfig(toolingConfig.stylelint)
