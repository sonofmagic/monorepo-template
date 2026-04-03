import { afterEach, describe, expect, it, vi } from 'vitest'

const files = new Map<string, string>()

const pathExistsMock = vi.fn(async (file: string) => files.has(file))
const readJsonMock = vi.fn(async (file: string) => JSON.parse(files.get(file) ?? 'null'))
const writeFileMock = vi.fn(async (file: string, content: string) => {
  files.set(file, content)
})
const outputFileMock = vi.fn(async (file: string, content: string) => {
  files.set(file, content)
})
const loggerInfoMock = vi.fn()
const defineTsconfigConfigMock = vi.fn(async () => ({
  extends: './tsconfig.base.json',
  compilerOptions: {
    strict: true,
  },
}))

vi.mock('@/utils/fs', async () => {
  const actual = await vi.importActual<typeof import('@/utils/fs')>('@/utils/fs')
  return {
    ...actual,
    default: {
      ...actual.default,
      pathExists: pathExistsMock,
      readJson: readJsonMock,
      writeFile: writeFileMock,
      outputFile: outputFileMock,
    },
    pathExists: pathExistsMock,
    readJson: readJsonMock,
    writeFile: writeFileMock,
    outputFile: outputFileMock,
  }
})

vi.mock('@/core/logger', () => ({
  logger: {
    info: loggerInfoMock,
  },
}))

vi.mock('@/tooling', () => ({
  defineTsconfigConfig: defineTsconfigConfigMock,
}))

afterEach(async () => {
  files.clear()
  pathExistsMock.mockReset()
  readJsonMock.mockReset()
  writeFileMock.mockReset()
  outputFileMock.mockReset()
  loggerInfoMock.mockReset()
  defineTsconfigConfigMock.mockReset()
  await vi.resetModules()
})

describe('init tooling', () => {
  it('writes selected tooling files and updates root devDependencies', async () => {
    files.set('/repo/package.json', JSON.stringify({
      name: 'demo',
      private: true,
      devDependencies: {
        repoctl: '^1.0.0',
      },
    }))

    const { initTooling } = await import('@/commands/init/tooling')
    const result = await initTooling('/repo', {
      targets: ['eslint', 'tsconfig', 'vitest'],
    })

    expect(result.selectedTargets).toEqual(['eslint', 'tsconfig', 'vitest'])
    expect(result.writtenFiles).toEqual(['eslint.config.js', 'tsconfig.json', 'vitest.config.ts'])
    expect(result.skippedFiles).toEqual([])
    expect(result.updatedPackageJson).toBe(true)
    expect(files.get('/repo/eslint.config.js')).toContain(`from 'repoctl/tooling'`)
    expect(files.get('/repo/tsconfig.json')).toContain('"strict": true')
    expect(files.get('/repo/vitest.config.ts')).toContain('defineVitestConfig')

    const packageJson = JSON.parse(files.get('/repo/package.json') ?? '{}')
    expect(packageJson.devDependencies.repoctl).toMatch(/^\^/)
    expect(packageJson.devDependencies.eslint).toBeTruthy()
    expect(packageJson.devDependencies.typescript).toBeTruthy()
    expect(packageJson.devDependencies.vitest).toBeTruthy()
    expect(defineTsconfigConfigMock).toHaveBeenCalledWith({ cwd: '/repo' })
  })

  it('skips existing files unless force is enabled', async () => {
    files.set('/repo/package.json', JSON.stringify({
      name: 'demo',
      private: true,
      devDependencies: {
        '@icebreakers/monorepo': '^1.0.0',
      },
    }))
    files.set('/repo/eslint.config.js', '// keep me\n')

    const { initTooling } = await import('@/commands/init/tooling')
    const result = await initTooling('/repo', {
      targets: ['eslint'],
    })

    expect(result.writtenFiles).toEqual([])
    expect(result.skippedFiles).toEqual(['eslint.config.js'])
    expect(files.get('/repo/eslint.config.js')).toBe('// keep me\n')
    expect(loggerInfoMock).toHaveBeenCalledWith('skip existing init target: eslint.config.js')

    const packageJson = JSON.parse(files.get('/repo/package.json') ?? '{}')
    expect(packageJson.devDependencies['@icebreakers/eslint-config']).toBeTruthy()
    expect(packageJson.devDependencies['@icebreakers/monorepo']).toMatch(/^\^/)
  })

  it('validates target names and supports all presets', async () => {
    files.set('/repo/package.json', JSON.stringify({
      name: 'demo',
      private: true,
    }))

    const { initTooling, normalizeInitToolingTargets } = await import('@/commands/init/tooling')

    expect(() => normalizeInitToolingTargets(['unknown'])).toThrow('未知的 init tooling 目标')

    const result = await initTooling('/repo', {
      all: true,
      force: true,
    })

    expect(result.selectedTargets).toHaveLength(6)
    expect(result.writtenFiles).toHaveLength(6)
  })
})
