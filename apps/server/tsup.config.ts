import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'], // , 'src/cli.ts'],
  shims: true,
  format: ['esm'],
  clean: true,
  dts: false,
  // https://github.com/egoist/tsup/pull/1056
  // https://github.com/egoist/tsup/issues?q=cjsInterop
  // cjsInterop: true,
  // splitting: true,
})
