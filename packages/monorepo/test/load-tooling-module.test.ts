import { describe, expect, it, vi } from 'vitest'
import { createToolingModuleLoader, isRecoverableToolingLoadError } from '../../../tooling/load-tooling-module.mjs'

describe('load-tooling-module', () => {
  it('treats missing module errors as recoverable', () => {
    const moduleMissingError = Object.assign(new Error('Cannot find module'), {
      code: 'ERR_MODULE_NOT_FOUND',
    })

    expect(isRecoverableToolingLoadError(moduleMissingError)).toBe(true)
    expect(isRecoverableToolingLoadError(new Error('No such file or directory'))).toBe(true)
    expect(isRecoverableToolingLoadError(new Error('Unexpected token'))).toBe(false)
  })

  it('retries once after a recoverable import failure', async () => {
    const ensureBuilt = vi.fn(async () => {})
    const importModule = vi.fn()
      .mockRejectedValueOnce(Object.assign(new Error('Cannot find module'), {
        code: 'ERR_MODULE_NOT_FOUND',
      }))
      .mockResolvedValueOnce({ defineEslintConfig: vi.fn() })
    const loadToolingModule = createToolingModuleLoader({
      ensureBuilt,
      importModule,
    })

    const result = await loadToolingModule('/tmp/tooling-entry.mjs')

    expect(result).toEqual({ defineEslintConfig: expect.any(Function) })
    expect(ensureBuilt).toHaveBeenCalledTimes(2)
    expect(importModule).toHaveBeenNthCalledWith(1, '/tmp/tooling-entry.mjs')
    expect(importModule).toHaveBeenNthCalledWith(2, '/tmp/tooling-entry.mjs', true)
  })

  it('does not swallow non-recoverable import failures', async () => {
    const syntaxError = new Error('Unexpected token export')
    const loadToolingModule = createToolingModuleLoader({
      ensureBuilt: vi.fn(async () => {}),
      importModule: vi.fn(async () => {
        throw syntaxError
      }),
    })

    await expect(loadToolingModule('/tmp/tooling-entry.mjs')).rejects.toBe(syntaxError)
  })
})
