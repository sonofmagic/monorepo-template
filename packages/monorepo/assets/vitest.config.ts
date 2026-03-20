import type { MonorepoVitestConfigResult } from '@icebreakers/monorepo/tooling'
import { defineVitestConfig } from '@icebreakers/monorepo/tooling'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  /**
   * Scaffolded root Vitest workspace config.
   *
   * Generated projects can keep most defaults in `monorepo.config.ts -> tooling.vitest`
   * and only override the final result here when necessary.
   */
  const config: MonorepoVitestConfigResult = await defineVitestConfig()
  return config
})
