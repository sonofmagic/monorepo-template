import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

describe('skills sync command', () => {
  it('throws when source skills directory is missing', async () => {
    const pathExistsMock = vi.fn(async () => false)
    const removeMock = vi.fn(async () => {})
    const ensureDirMock = vi.fn(async () => {})
    const copyMock = vi.fn(async () => {})
    const checkboxMock = vi.fn(async () => [])

    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        pathExists: pathExistsMock,
        remove: removeMock,
        ensureDir: ensureDirMock,
        copy: copyMock,
      },
      pathExists: pathExistsMock,
      remove: removeMock,
      ensureDir: ensureDirMock,
      copy: copyMock,
    }))
    vi.doMock('@inquirer/checkbox', () => ({
      __esModule: true,
      default: checkboxMock,
    }))
    vi.doMock('node:os', () => ({
      __esModule: true,
      default: { homedir: () => '/home' },
      homedir: () => '/home',
    }))

    const { syncSkills } = await import('@/commands/skills')

    await expect(syncSkills({ cwd: '/repo' })).rejects.toThrow('未找到技能目录')
    expect(pathExistsMock).toHaveBeenCalledWith(expect.stringMatching(/resources[\\/]skills[\\/]icebreakers-monorepo-cli$/))
    expect(checkboxMock).not.toHaveBeenCalled()
    expect(removeMock).not.toHaveBeenCalled()
    expect(copyMock).not.toHaveBeenCalled()
  })

  it('syncs to explicit targets without prompting', async () => {
    const pathExistsMock = vi.fn(async () => true)
    const removeMock = vi.fn(async () => {})
    const ensureDirMock = vi.fn(async () => {})
    const copyMock = vi.fn(async () => {})
    const checkboxMock = vi.fn(async () => [])

    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        pathExists: pathExistsMock,
        remove: removeMock,
        ensureDir: ensureDirMock,
        copy: copyMock,
      },
      pathExists: pathExistsMock,
      remove: removeMock,
      ensureDir: ensureDirMock,
      copy: copyMock,
    }))
    vi.doMock('@inquirer/checkbox', () => ({
      __esModule: true,
      default: checkboxMock,
    }))
    vi.doMock('node:os', () => ({
      __esModule: true,
      default: { homedir: () => '/home' },
      homedir: () => '/home',
    }))

    const { syncSkills } = await import('@/commands/skills')
    const results = await syncSkills({ cwd: '/repo', targets: ['codex', 'claude'] })

    expect(checkboxMock).not.toHaveBeenCalled()
    expect(removeMock).toHaveBeenCalledWith('/home/.codex/skills/icebreakers-monorepo-cli')
    expect(removeMock).toHaveBeenCalledWith('/home/.claude/skills/icebreakers-monorepo-cli')
    expect(ensureDirMock).toHaveBeenCalledWith('/home/.codex/skills')
    expect(ensureDirMock).toHaveBeenCalledWith('/home/.claude/skills')
    expect(copyMock).toHaveBeenCalledWith(expect.stringMatching(/resources[\\/]skills[\\/]icebreakers-monorepo-cli$/), '/home/.codex/skills/icebreakers-monorepo-cli')
    expect(copyMock).toHaveBeenCalledWith(expect.stringMatching(/resources[\\/]skills[\\/]icebreakers-monorepo-cli$/), '/home/.claude/skills/icebreakers-monorepo-cli')
    expect(results).toEqual([
      { target: 'codex', dest: '/home/.codex/skills/icebreakers-monorepo-cli' },
      { target: 'claude', dest: '/home/.claude/skills/icebreakers-monorepo-cli' },
    ])
  })

  it('prompts for targets when none provided', async () => {
    const pathExistsMock = vi.fn(async () => true)
    const removeMock = vi.fn(async () => {})
    const ensureDirMock = vi.fn(async () => {})
    const copyMock = vi.fn(async () => {})
    const checkboxMock = vi.fn(async () => ['claude'])

    vi.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        pathExists: pathExistsMock,
        remove: removeMock,
        ensureDir: ensureDirMock,
        copy: copyMock,
      },
      pathExists: pathExistsMock,
      remove: removeMock,
      ensureDir: ensureDirMock,
      copy: copyMock,
    }))
    vi.doMock('@inquirer/checkbox', () => ({
      __esModule: true,
      default: checkboxMock,
    }))
    vi.doMock('node:os', () => ({
      __esModule: true,
      default: { homedir: () => '/home' },
      homedir: () => '/home',
    }))

    const { syncSkills } = await import('@/commands/skills')
    const results = await syncSkills({ cwd: '/repo' })

    expect(checkboxMock).toHaveBeenCalledTimes(1)
    const [promptOptions] = checkboxMock.mock.calls[0] ?? []
    expect(promptOptions).toEqual({
      message: '请选择需要同步的技能目标',
      choices: [
        { name: 'codex', value: 'codex', checked: true },
        { name: 'claude', value: 'claude', checked: true },
      ],
    })
    expect(copyMock).toHaveBeenCalledTimes(1)
    expect(copyMock).toHaveBeenCalledWith(expect.stringMatching(/resources[\\/]skills[\\/]icebreakers-monorepo-cli$/), '/home/.claude/skills/icebreakers-monorepo-cli')
    expect(results).toEqual([
      { target: 'claude', dest: '/home/.claude/skills/icebreakers-monorepo-cli' },
    ])
  })
})
