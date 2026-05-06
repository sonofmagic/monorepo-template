import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/node-entry.ts'],
  shims: true,
  format: ['esm'],
  clean: true,
  dts: false,
  target: 'node18',
})
