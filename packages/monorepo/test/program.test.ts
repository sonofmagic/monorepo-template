import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
  vi.resetAllMocks()
})

describe('commander program', () => {
  it('wires each command to the corresponding handler', async () => {
    const upgradeMock = vi.fn(async () => {})
    const initMock = vi.fn(async () => {})
    const initMetadataMock = vi.fn(async () => {})
    const initToolingMock = vi.fn(async () => {})
    const doctorMock = vi.fn(async () => ({
      cwd: '/repo',
      workspaceDir: '/repo',
      packageCount: 1,
      checks: [],
      summary: { pass: 7, warn: 0, fail: 0 },
    }))
    const runRecommendedCheckMock = vi.fn(async () => {})
    const cleanMock = vi.fn(async () => {})
    const mirrorMock = vi.fn(async () => {})
    const verifyCommitMsgMock = vi.fn(() => {})
    const verifyPreCommitMock = vi.fn(() => {})
    const verifyPrePushMock = vi.fn(async () => {})
    const verifyStagedTypecheckMock = vi.fn(() => {})
    const runCreateFlowMock = vi.fn(async () => {})
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
      createNewProject: vi.fn(async () => {}),
      getCreateChoices: vi.fn(() => choices),
      init: initMock,
      initMetadata: initMetadataMock,
      initTooling: initToolingMock,
      initToolingTargets: ['commitlint', 'eslint', 'stylelint', 'lint-staged', 'tsconfig', 'vitest'],
      normalizeInitToolingTargets: vi.fn((input: string[]) => input),
      runDoctor: doctorMock,
      runRecommendedCheck: runRecommendedCheckMock,
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
    vi.doMock('@/cli/commands/package/create-flow', () => ({
      runCreateFlow: runCreateFlowMock,
    }))
    vi.doMock('@/core/config', () => ({
      resolveCommandConfig: resolveCommandConfigMock,
    }))

    const successMock = vi.fn()
    const infoMock = vi.fn()
    const warnMock = vi.fn()
    const errorMock = vi.fn()
    const logMock = vi.fn()
    vi.doMock('@/core/logger', () => ({
      logger: {
        success: successMock,
        info: infoMock,
        warn: warnMock,
        error: errorMock,
        log: logMock,
      },
    }))

    const { default: program } = await import('@/cli/program')

    await program.parseAsync(['node', 'repo', 'setup', '--preset', 'minimal'])
    await program.parseAsync(['node', 'repo', 'new', 'demo', '--template', 'tsdown'])
    await program.parseAsync(['node', 'repo', 'check', '--full'])
    await program.parseAsync(['node', 'repo', 'doctor'])
    await program.parseAsync(['node', 'repo', 'upgrade'])
    await program.parseAsync(['node', 'repo', 'sync'])
    await program.parseAsync(['node', 'repo', 'clean', '--yes', '--include-private', '--pinned-version', 'canary'])
    await program.parseAsync(['node', 'repo', 'mirror'])
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

    expect(initMock).toHaveBeenCalledWith(expect.any(String), { preset: 'minimal' })
    expect(runCreateFlowMock).toHaveBeenNthCalledWith(1, expect.any(String), 'demo', { template: 'tsdown' })
    expect(runRecommendedCheckMock).toHaveBeenCalledWith({
      cwd: expect.any(String),
      full: true,
      staged: undefined,
      editFile: undefined,
    })
    expect(doctorMock).toHaveBeenCalledWith(expect.any(String))
    expect(upgradeMock).toHaveBeenCalledWith(expect.objectContaining({ cwd: expect.any(String) }))
    expect(initMetadataMock).toHaveBeenCalledWith(expect.any(String))
    expect(cleanMock).toHaveBeenCalledWith(expect.any(String), {
      autoConfirm: true,
      includePrivate: true,
      pinnedVersion: 'canary',
    })
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
    expect(runCreateFlowMock).toHaveBeenNthCalledWith(2, expect.any(String), undefined, { template: undefined })
    expect(syncSkillsMock).toHaveBeenCalledWith(expect.objectContaining({
      cwd: expect.any(String),
      targets: ['codex'],
    }))
    expect(initToolingMock).toHaveBeenCalledWith(expect.any(String), {
      targets: ['eslint', 'vitest'],
      force: true,
    })
    expect(successMock).toHaveBeenCalledTimes(15)
    expect(infoMock).toHaveBeenCalledWith('next: run `pnpm install` and `pnpm build`')
    expect(infoMock).toHaveBeenCalledWith('next: run `pnpm install` and start the new workspace package')
    expect(warnMock).not.toHaveBeenCalled()
    expect(errorMock).not.toHaveBeenCalled()
    expect(logMock).toHaveBeenCalled()
  })

  it('marks the process as failed when doctor finds blocking issues', async () => {
    const doctorMock = vi.fn(async () => ({
      cwd: '/repo',
      workspaceDir: '/repo',
      packageCount: 0,
      checks: [],
      summary: { pass: 2, warn: 1, fail: 1 },
    }))

    vi.doMock('@icebreakers/monorepo-templates', async () => {
      const actual = await vi.importActual<typeof import('@icebreakers/monorepo-templates')>('@icebreakers/monorepo-templates')
      return {
        ...actual,
        program: new actual.Command(),
      }
    })
    vi.doMock('@/commands', () => ({
      cleanProjects: vi.fn(async () => {}),
      createNewProject: vi.fn(async () => {}),
      createTimestampFolderName: vi.fn(() => 'timestamp'),
      defaultAgenticBaseDir: 'agentic',
      generateAgenticTemplate: vi.fn(async () => {}),
      generateAgenticTemplates: vi.fn(async () => {}),
      getCreateChoices: vi.fn(() => []),
      getSkillTargetPaths: vi.fn(() => []),
      getTemplateMap: vi.fn(() => ({})),
      getWorkspaceData: vi.fn(async () => ({ packages: [], workspaceDir: '/repo' })),
      getWorkspacePackages: vi.fn(async () => []),
      GitClient: class {},
      init: vi.fn(async () => {}),
      initMetadata: vi.fn(async () => {}),
      initTooling: vi.fn(async () => {}),
      initToolingTargets: [],
      loadAgenticTasks: vi.fn(async () => []),
      normalizeInitToolingTargets: vi.fn((input: string[]) => input),
      runDoctor: doctorMock,
      runRecommendedCheck: vi.fn(async () => {}),
      setVscodeBinaryMirror: vi.fn(async () => {}),
      skillTargets: [],
      syncSkills: vi.fn(async () => []),
      templateMap: {},
      upgradeMonorepo: vi.fn(async () => {}),
      verifyCommitMsg: vi.fn(async () => {}),
      verifyPreCommit: vi.fn(async () => {}),
      verifyPrePush: vi.fn(async () => {}),
      verifyStagedTypecheck: vi.fn(() => {}),
    }))
    vi.doMock('@/commands/create', () => ({
      defaultTemplate: 'tsdown',
      getTemplateMap: vi.fn(() => ({})),
    }))
    vi.doMock('@/cli/commands/package/create-flow', () => ({
      runCreateFlow: vi.fn(async () => {}),
    }))
    vi.doMock('@/core/config', () => ({
      resolveCommandConfig: vi.fn(async () => ({})),
    }))

    const errorMock = vi.fn()
    vi.doMock('@/core/logger', () => ({
      logger: {
        success: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: errorMock,
        log: vi.fn(),
      },
    }))

    const previousExitCode = process.exitCode
    process.exitCode = undefined

    const { default: program } = await import('@/cli/program')
    await program.parseAsync(['node', 'repo', 'doctor'])

    expect(process.exitCode).toBe(1)
    expect(errorMock).toHaveBeenCalledWith('doctor found 1 blocking issue(s).')

    process.exitCode = previousExitCode
  })
})
