import process from 'node:process'
import { createMonorepoEslintConfig, loadMonorepoToolingConfig } from '@icebreakers/monorepo/tooling'

const toolingConfig = await loadMonorepoToolingConfig(process.cwd())

export default createMonorepoEslintConfig(toolingConfig.eslint)
