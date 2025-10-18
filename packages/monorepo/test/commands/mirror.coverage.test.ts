import { afterEach, describe, expect, it, vi } from 'vitest'

const ensureFileMock = vi.fn()
const readFileMock = vi.fn()
const writeFileMock = vi.fn()
const resolveCommandConfigMock = vi.fn()
const parseMock = vi.fn()
const stringifyMock = vi.fn(() => '{}')
const setMirrorMock = vi.fn()

vi.mock('fs-extra', () => ({
  __esModule: true,
  default: {
    ensureFile: ensureFileMock,
    readFile: readFileMock,
    writeFile: writeFileMock,
  },
  ensureFile: ensureFileMock,
  readFile: readFileMock,
  writeFile: writeFileMock,
}))

vi.mock('comment-json', () => ({
  parse: parseMock,
  stringify: stringifyMock,
}))

vi.mock('@/core/config', () => ({
  resolveCommandConfig: resolveCommandConfigMock,
}))

vi.mock('@/commands/mirror/utils', () => ({
  setMirror: setMirrorMock,
}))

afterEach(() => {
  ensureFileMock.mockReset()
  readFileMock.mockReset()
  writeFileMock.mockReset()
  resolveCommandConfigMock.mockReset()
  parseMock.mockReset()
  stringifyMock.mockReset()
  setMirrorMock.mockReset()
})

describe('mirror coverage', () => {
  it('applies vscode mirror settings and skips non-object configs', async () => {
    resolveCommandConfigMock
      .mockResolvedValueOnce({
        env: { CUSTOM: 'https://mirror.test' },
      })
      .mockResolvedValueOnce(undefined)

    parseMock
      .mockReturnValueOnce({})
      .mockReturnValueOnce(null)
    readFileMock.mockResolvedValue('{}')
    writeFileMock.mockResolvedValue(undefined)

    const { setVscodeBinaryMirror } = await import('@/commands/mirror/binaryMirror')
    const { setVscodeBinaryMirror: exported } = await import('@/commands/mirror')
    expect(exported).toBe(setVscodeBinaryMirror)

    await setVscodeBinaryMirror('/workspace')

    expect(setMirrorMock).toHaveBeenCalledWith({}, expect.objectContaining({ CUSTOM: 'https://mirror.test' }))
    expect(writeFileMock).toHaveBeenCalledWith(expect.stringMatching(/\.vscode\/settings\.json$/), expect.any(String), 'utf8')

    setMirrorMock.mockClear()
    writeFileMock.mockClear()

    await setVscodeBinaryMirror('/workspace')

    expect(setMirrorMock).not.toHaveBeenCalled()
    expect(writeFileMock).toHaveBeenCalledTimes(1)
  })
})
