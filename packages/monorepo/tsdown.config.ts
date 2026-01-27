import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  shims: true,
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
  inlineOnly: [
    'get-value',
    'defu',
    'is-primitive',
    'isobject',
    'is-plain-object',
    'set-value',
    'pkg-types',
  ],
  inputOptions(options) {
    const baseOnLog = options.onLog
    options.onLog = (level, log, handler) => {
      if (log.code === 'MISSING_EXPORT') {
        return
      }
      if (baseOnLog) {
        return baseOnLog(level, log, handler)
      }
      handler(level, log)
    }
  },
  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_assignment
  target: 'node20',
  // https://github.com/egoist/tsdown/pull/1056
  // https://github.com/egoist/tsdown/issues?q=cjsInterop
  // cjsInterop: true,
  // splitting: true,
})
