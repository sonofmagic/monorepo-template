import Vue from '@vitejs/plugin-vue'
import { defineVitestProjectConfig } from 'repoctl/tooling'
import { mergeConfig } from 'vitest/config'
import { sharedConfig } from './vite.shared.config'

export default mergeConfig(sharedConfig, {
  ...await defineVitestProjectConfig({
    config: {
      environment: 'jsdom',
    },
  }),
  plugins: [Vue()],
})
