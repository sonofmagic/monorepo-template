import { loadMonorepoToolingModule } from './tooling/load-tooling-module.mjs'

const { defineStylelintConfig } = await loadMonorepoToolingModule()

export default await defineStylelintConfig()
