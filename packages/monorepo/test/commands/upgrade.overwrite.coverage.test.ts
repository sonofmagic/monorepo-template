import { Buffer } from 'node:buffer'
import { describe, expect, it, vi } from 'vitest'

describe('upgrade overwrite helpers coverage', () => {
  it('evaluates write intents and processes pending overwrites', async () => {
    const pathExistsMock = vi.fn()
    const statMock = vi.fn()
    const readFileMock = vi.fn()
    const checkboxMock = vi.fn()
    const isFileChangedMock = vi.fn()

    await vi.resetModules()
    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        pathExists: pathExistsMock,
        stat: statMock,
        readFile: readFileMock,
      },
      pathExists: pathExistsMock,
      stat: statMock,
      readFile: readFileMock,
    }))
    vi.doMock('@inquirer/checkbox', () => ({ default: checkboxMock }))
    vi.doMock('@/utils', async () => {
      const actual = await vi.importActual<typeof import('@/utils')>('@/utils')
      return {
        ...actual,
        isFileChanged: isFileChangedMock,
      }
    })

    const { evaluateWriteIntent, scheduleOverwrite, flushPendingOverwrites } = await import('@/commands/upgrade/overwrite')

    pathExistsMock.mockResolvedValueOnce(false)
    const writeIntent = await evaluateWriteIntent('/tmp/a.txt', { source: 'data' })
    expect(writeIntent.type).toBe('write')

    pathExistsMock.mockResolvedValueOnce(true)
    const skipIntent = await evaluateWriteIntent('/tmp/b.txt', { source: 'data', skipOverwrite: true })
    expect(skipIntent).toEqual({ type: 'skip', reason: 'skipOverwrite' })

    pathExistsMock.mockResolvedValueOnce(true)
    statMock.mockRejectedValueOnce(new Error('stat failed'))
    const missingIntent = await evaluateWriteIntent('/tmp/c.txt', { source: 'data' })
    expect(missingIntent.type).toBe('write')

    pathExistsMock.mockResolvedValueOnce(true)
    statMock.mockResolvedValueOnce({ size: 10 })
    const promptIntent = await evaluateWriteIntent('/tmp/d.txt', { source: 'data' })
    expect(promptIntent).toEqual({ type: 'prompt', reason: 'changed' })

    pathExistsMock.mockResolvedValueOnce(true)
    statMock.mockResolvedValueOnce({ size: 4 })
    readFileMock.mockResolvedValueOnce(Buffer.from('data'))
    isFileChangedMock.mockReturnValueOnce(false)
    const identicalIntent = await evaluateWriteIntent('/tmp/e.txt', { source: 'data' })
    expect(identicalIntent).toEqual({ type: 'skip', reason: 'identical' })

    pathExistsMock.mockResolvedValueOnce(true)
    statMock.mockResolvedValueOnce({ size: 4 })
    readFileMock.mockResolvedValueOnce(Buffer.from('diff'))
    isFileChangedMock.mockReturnValueOnce(true)
    const promptIntent2 = await evaluateWriteIntent('/tmp/f.txt', { source: 'data' })
    expect(promptIntent2.type).toBe('prompt')

    const actionMock = vi.fn(async () => {})
    const pending: Array<{ relPath: string, targetPath: string, action: () => Promise<void> }> = []
    await scheduleOverwrite({ type: 'write', reason: 'missing' }, {
      relPath: 'file-a',
      targetPath: '/tmp/a.txt',
      action: actionMock,
      pending,
    })
    expect(actionMock).toHaveBeenCalledTimes(1)

    await scheduleOverwrite({ type: 'prompt', reason: 'changed' }, {
      relPath: 'file-b',
      targetPath: '/tmp/b.txt',
      action: actionMock,
      pending,
    })
    expect(pending).toHaveLength(1)

    checkboxMock.mockResolvedValueOnce(['/tmp/b.txt'])
    await flushPendingOverwrites(pending)
    expect(actionMock).toHaveBeenCalledTimes(2)

    checkboxMock.mockResolvedValueOnce([])
    await flushPendingOverwrites([{
      relPath: 'file-c',
      targetPath: '/tmp/c.txt',
      action: actionMock,
    }])
    expect(actionMock).toHaveBeenCalledTimes(2)
  })
})
