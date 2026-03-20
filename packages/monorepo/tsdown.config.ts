import { defineConfig } from 'tsdown'

const pkgTypesMissingExportIds = [
  'CompilerOptions',
  'TypeAcquisition',
]

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts', 'src/tooling-entry.ts'],
  shims: true,
  format: ['esm'],
  clean: true,
  dts: true,
  deps: {
    onlyBundle: ['defu', 'is-primitive', 'isobject', 'is-plain-object', 'pkg-types'],
  },
  inputOptions(options) {
    const baseOnLog = options.onLog
    options.onLog = (level, log, handler) => {
      const isPkgTypesMissingExport = log.code === 'MISSING_EXPORT'
        && typeof log.id === 'string'
        && log.id.includes('pkg-types/dist/index.d.mts')
        && typeof log.exporter === 'string'
        && log.exporter.includes('typescript/lib/typescript.d.ts')
        && typeof log.message === 'string'
        && pkgTypesMissingExportIds.some(name => log.message.includes(`"${name}" is not exported`))

      if (isPkgTypesMissingExport) {
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
