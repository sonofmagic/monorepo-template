import type { MonorepoConfig } from '../types'
import { loadMonorepoConfigDetails } from '../core/config'

export interface ConfigInspection {
  cwd: string
  file: string | null
  config: MonorepoConfig
}

export async function inspectMonorepoConfig(cwd: string): Promise<ConfigInspection> {
  const { file, config } = await loadMonorepoConfigDetails(cwd)
  return {
    cwd,
    file,
    config,
  }
}
