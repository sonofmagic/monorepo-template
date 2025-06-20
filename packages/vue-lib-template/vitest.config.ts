import { mergeConfig } from 'vitest/config'
import { sharedConfig } from './vite.shared.config'

export default mergeConfig(sharedConfig, {
  test: {
    globals: true,
    testTimeout: 60_000,
    environment: 'jsdom',
  },
})
