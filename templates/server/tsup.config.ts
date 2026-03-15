import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/node-entry.ts'],
  shims: true,
  format: ['esm'],
  clean: true,
  dts: false,
})
