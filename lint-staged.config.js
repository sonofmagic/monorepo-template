import process from 'node:process'
import { createMonorepoLintStagedConfig, loadMonorepoToolingConfig } from '@icebreakers/monorepo/tooling'

const toolingConfig = await loadMonorepoToolingConfig(process.cwd())

export default createMonorepoLintStagedConfig({
  ...toolingConfig.lintStaged,
  monorepoCommand: toolingConfig.lintStaged?.monorepoCommand ?? 'pnpm exec monorepo',
})
