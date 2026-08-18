import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  shims: true,
  format: ['esm', 'cjs'],
  clean: true,
  dts: true,
  target: 'node18',
  cjsInterop: true,
  outExtensions({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs',
    }
  },
})
