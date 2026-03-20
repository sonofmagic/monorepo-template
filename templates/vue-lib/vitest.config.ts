import { createMonorepoVitestProjectConfig } from '@icebreakers/monorepo/tooling'
import Vue from '@vitejs/plugin-vue'
import { mergeConfig } from 'vitest/config'
import { sharedConfig } from './vite.shared.config'

export default mergeConfig(sharedConfig, {
  ...createMonorepoVitestProjectConfig({
    environment: 'jsdom',
  }),
  plugins: [Vue()],
})
