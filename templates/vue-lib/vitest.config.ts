import Vue from '@vitejs/plugin-vue'
import { mergeConfig } from 'vitest/config'
import { ensureToolingBuilt } from '../../tooling/ensure-tooling-built.mjs'
import { sharedConfig } from './vite.shared.config'

await ensureToolingBuilt()

const { defineVitestProjectConfig } = await import('repoctl/tooling')

export default mergeConfig(sharedConfig, {
  ...await defineVitestProjectConfig({
    options: {
      environment: 'jsdom',
    },
  }),
  plugins: [Vue()],
})
