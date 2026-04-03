import { loadMonorepoToolingModule } from './tooling/load-tooling-module.mjs'

const { defineCommitlintConfig } = await loadMonorepoToolingModule()

export default await defineCommitlintConfig()
