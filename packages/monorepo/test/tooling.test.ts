import { describe, expect, it } from 'vitest'
import {
  createMonorepoCommitlintConfig,
  createMonorepoEslintConfig,
  createMonorepoLintStagedConfig,
  createMonorepoStylelintConfig,
  createMonorepoVitestConfig,
  createMonorepoVitestProjectConfig,
  defineMonorepoCommitlintConfig,
  defineMonorepoEslintConfig,
  defineMonorepoLintStagedConfig,
  defineMonorepoStylelintConfig,
  defineMonorepoVitestConfig,
  loadMonorepoToolingConfig,
} from '@/index'

describe('tooling factories', () => {
  it('creates shared config wrappers', () => {
    expect(createMonorepoCommitlintConfig()).toBeTruthy()
    expect(createMonorepoEslintConfig()).toBeTruthy()
    expect(createMonorepoStylelintConfig()).toBeTruthy()
  })

  it('creates lint-staged config with overridable monorepo command', () => {
    const config = createMonorepoLintStagedConfig({
      monorepoCommand: 'pnpm exec monorepo',
    })
    const command = config['*.{ts,tsx,mts,cts,vue}']

    expect(typeof command).toBe('function')
    if (typeof command !== 'function') {
      throw new TypeError('expected lint-staged rule to be callable')
    }
    expect(command(['src/index.ts'])).toContain('pnpm exec monorepo verify staged-typecheck')
  })

  it('creates vitest config from explicit project roots', () => {
    const config = createMonorepoVitestConfig({
      rootDir: process.cwd(),
      projectRoots: ['packages'],
    })

    expect(config.test.coverage.enabled).toBe(true)
    expect(Array.isArray(config.test.projects)).toBe(true)
  })

  it('creates project-level vitest config with shared defaults', () => {
    const config = createMonorepoVitestProjectConfig({
      environment: 'node',
      alias: [{ find: '@', replacement: '/tmp/src' }],
    })

    expect(config.test.globals).toBe(true)
    expect(config.test.testTimeout).toBe(60_000)
    expect(config.test.environment).toBe('node')
    expect(config.test.alias).toEqual([{ find: '@', replacement: '/tmp/src' }])
  })

  it('loads tooling config from monorepo config', async () => {
    const config = await loadMonorepoToolingConfig(process.cwd())
    expect(config).toBeTruthy()
  })

  it('defines wrapper configs internally from monorepo config', async () => {
    expect(await defineMonorepoCommitlintConfig()).toBeTruthy()
    expect(await defineMonorepoEslintConfig()).toBeTruthy()
    expect(await defineMonorepoStylelintConfig()).toBeTruthy()
    expect(await defineMonorepoLintStagedConfig()).toBeTruthy()
    expect(await defineMonorepoVitestConfig()).toBeTruthy()
  })
})
