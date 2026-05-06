import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  shims: true,
  format: ['esm', 'cjs'],
  clean: true,
  dts: true,
  target: 'node18',
})
