import type { MonorepoVitestProjectConfigResult } from '@icebreakers/monorepo/tooling'
import { createMonorepoVitestProjectConfig } from '@icebreakers/monorepo/tooling'
import Vue from '@vitejs/plugin-vue'
import { mergeConfig } from 'vitest/config'
import { sharedConfig } from './vite.shared.config'

/**
 * Template Vitest config for the Vue component library.
 *
 * Merges the shared Vite config with project-level test defaults and jsdom runtime.
 */
const projectConfig: MonorepoVitestProjectConfigResult = createMonorepoVitestProjectConfig({
  environment: 'jsdom',
})

export default mergeConfig(sharedConfig, {
  ...projectConfig,
  plugins: [Vue()],
})
