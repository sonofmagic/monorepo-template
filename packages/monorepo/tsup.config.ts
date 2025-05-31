import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'], // ,],
  shims: true,
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_assignment
  target: 'node16',
  // https://github.com/egoist/tsup/pull/1056
  // https://github.com/egoist/tsup/issues?q=cjsInterop
  // cjsInterop: true,
  // splitting: true,
})
