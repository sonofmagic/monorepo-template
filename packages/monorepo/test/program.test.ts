import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
  vi.resetAllMocks()
})

describe('commander program', () => {
  it('wires each command to the corresponding handler', async () => {
    const upgradeMock = vi.fn(async () => {})
    const initMetadataMock = vi.fn(async () => {})
    const initToolingMock = vi.fn(async () => {})
    const cleanMock = vi.fn(async () => {})
    const mirrorMock = vi.fn(async () => {})
    const verifyCommitMsgMock = vi.fn(() => {})
    const verifyPreCommitMock = vi.fn(() => {})
    const verifyPrePushMock = vi.fn(async () => {})
    const verifyStagedTypecheckMock = vi.fn(() => {})
    const createMock = vi.fn(async () => {})
    const aiTemplateMock = vi.fn(async () => {})
    const syncSkillsMock = vi.fn(async () => ([
      { target: 'codex', dest: '/home/.codex/skills/icebreakers-monorepo-cli' },
    ]))

    const inputMock = vi.fn(async () => 'my-package')
    const selectMock = vi.fn(async () => 'tsdown')

    vi.doMock('@icebreakers/monorepo-templates', async () => {
      const actual = await vi.importActual<typeof import('@icebreakers/monorepo-templates')>('@icebreakers/monorepo-templates')
      return {
        ...actual,
        program: new actual.Command(),
        input: inputMock,
        select: selectMock,
      }
    })
    const aiBatchMock = vi.fn(async () => {})
    const loadTasksMock = vi.fn(async () => ['config-task'])
    const choices = [{ value: 'tsdown', name: 'tsdown template' }]
    const resolveCommandConfigMock = vi.fn(async (name: string) => {
      if (name === 'ai') {
        return {
          output: 'config-agentic.md',
          format: 'md',
          force: false,
          baseDir: 'agentic',
          tasksFile: 'agentic/tasks.json',
        }
      }
      return { choices }
    })

    vi.doMock('@/commands', () => ({
      generateAgenticTemplate: aiTemplateMock,
      generateAgenticTemplates: aiBatchMock,
      loadAgenticTasks: loadTasksMock,
      cleanProjects: cleanMock,
      createNewProject: createMock,
      getCreateChoices: vi.fn(() => choices),
      initMetadata: initMetadataMock,
      initTooling: initToolingMock,
      initToolingTargets: ['commitlint', 'eslint', 'stylelint', 'lint-staged', 'tsconfig', 'vitest'],
      normalizeInitToolingTargets: vi.fn((input: string[]) => input),
      setVscodeBinaryMirror: mirrorMock,
      skillTargets: ['codex', 'claude'],
      syncSkills: syncSkillsMock,
      templateMap: { tsdown: { source: 'tsdown', target: 'packages/tsdown' } },
      upgradeMonorepo: upgradeMock,
      verifyCommitMsg: verifyCommitMsgMock,
      verifyPreCommit: verifyPreCommitMock,
      verifyPrePush: verifyPrePushMock,
      verifyStagedTypecheck: verifyStagedTypecheckMock,
    }))

    vi.doMock('@/commands/create', () => ({
      defaultTemplate: 'tsdown',
      getTemplateMap: vi.fn(() => ({
        tsdown: { source: 'tsdown', target: 'packages/tsdown' },
      })),
    }))
    vi.doMock('@/core/config', () => ({
      resolveCommandConfig: resolveCommandConfigMock,
    }))

    const successMock = vi.fn()
    vi.doMock('@/core/logger', () => ({ logger: { success: successMock, info: vi.fn() } }))

    const { default: program } = await import('@/cli/program')

    await program.parseAsync(['node', 'monorepo', 'workspace', 'upgrade'])
    await program.parseAsync(['node', 'monorepo', 'workspace', 'init'])
    await program.parseAsync(['node', 'monorepo', 'tooling', 'init', 'eslint', 'vitest', '--force'])
    await program.parseAsync(['node', 'monorepo', 'workspace', 'clean', '--yes', '--include-private', '--pinned-version', 'next'])
    await program.parseAsync(['node', 'monorepo', 'env', 'mirror'])
    await program.parseAsync(['node', 'monorepo', 'verify', 'pre-commit'])
    await program.parseAsync(['node', 'monorepo', 'verify', 'commit-msg', '.git/COMMIT_EDITMSG'])
    await program.parseAsync(['node', 'monorepo', 'verify', 'pre-push'])
    await program.parseAsync(['node', 'monorepo', 'verify', 'staged-typecheck', 'packages/monorepo/src/index.ts'])
    await program.parseAsync(['node', 'monorepo', 'ai', 'prompt', 'create', '--output', 'agentic.md', '--force', '--format', 'json'])
    await program.parseAsync(['node', 'monorepo', 'ai', 'prompt', 'new'])
    await program.parseAsync(['node', 'monorepo', 'package', 'create'])
    await program.parseAsync(['node', 'monorepo', 'skills', 'sync', '--codex'])

    expect(upgradeMock).toHaveBeenCalledWith(expect.objectContaining({ cwd: expect.any(String) }))
    expect(initMetadataMock).toHaveBeenCalledWith(expect.any(String))
    expect(cleanMock).toHaveBeenCalledWith(expect.any(String), {
      autoConfirm: true,
      includePrivate: true,
      pinnedVersion: 'next',
    })
    expect(mirrorMock).toHaveBeenCalled()
    expect(verifyPreCommitMock).toHaveBeenCalledWith({ cwd: expect.any(String) })
    expect(verifyCommitMsgMock).toHaveBeenCalledWith({
      cwd: expect.any(String),
      editFile: '.git/COMMIT_EDITMSG',
    })
    expect(verifyPrePushMock).toHaveBeenCalledWith(expect.objectContaining({ cwd: expect.any(String) }))
    expect(verifyStagedTypecheckMock).toHaveBeenCalledWith(['packages/monorepo/src/index.ts'], {
      cwd: expect.any(String),
    })
    expect(aiTemplateMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
      cwd: expect.any(String),
      output: 'agentic.md',
      force: true,
      format: 'json',
      baseDir: 'agentic',
    }))
    expect(loadTasksMock).toHaveBeenCalledWith('agentic/tasks.json', expect.any(String))
    expect(aiBatchMock).toHaveBeenCalledWith(['config-task'], expect.objectContaining({
      cwd: expect.any(String),
      baseDir: 'agentic',
      force: false,
      format: 'md',
    }))
    expect(createMock).toHaveBeenCalledWith({
      name: 'my-package',
      cwd: expect.any(String),
      type: 'tsdown',
    })
    expect(syncSkillsMock).toHaveBeenCalledWith(expect.objectContaining({
      cwd: expect.any(String),
      targets: ['codex'],
    }))
    expect(initToolingMock).toHaveBeenCalledWith(expect.any(String), {
      targets: ['eslint', 'vitest'],
      force: true,
    })
    expect(successMock).toHaveBeenCalledTimes(7)
  })
})
