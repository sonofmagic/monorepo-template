import Vue from '@vitejs/plugin-vue'
import { mergeConfig } from 'vitest/config'
import { loadRepoctlToolingModule } from '../../tooling/load-tooling-module.mjs'
import { sharedConfig } from './vite.shared.config'

const { defineVitestProjectConfig } = await loadRepoctlToolingModule()

export default mergeConfig(sharedConfig, {
  ...await defineVitestProjectConfig({
    options: {
      environment: 'jsdom',
    },
  }),
  plugins: [Vue()],
})
