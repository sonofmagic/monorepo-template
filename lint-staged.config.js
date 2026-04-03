import { loadMonorepoToolingModule } from './tooling/load-tooling-module.mjs'

const { defineLintStagedConfig } = await loadMonorepoToolingModule()

export default await defineLintStagedConfig()
