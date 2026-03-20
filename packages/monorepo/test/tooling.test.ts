import { describe, expect, it } from 'vitest'
import {
  createMonorepoCommitlintConfig,
  createMonorepoEslintConfig,
  createMonorepoLintStagedConfig,
  createMonorepoStylelintConfig,
  createMonorepoVitestConfig,
  createMonorepoVitestProjectConfig,
  defineCommitlintConfig,
  defineEslintConfig,
  defineLintStagedConfig,
  defineStylelintConfig,
  defineVitestConfig,
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

  it('passes through complete lint-staged config when provided', () => {
    const config = createMonorepoLintStagedConfig({
      config: {
        '*.md': ['prettier --write'],
      },
    })

    expect(config).toEqual({
      '*.md': ['prettier --write'],
    })
  })

  it('creates vitest config from explicit project roots', () => {
    const config = createMonorepoVitestConfig({
      rootDir: process.cwd(),
      projectRoots: ['packages'],
    })

    expect(config.test?.coverage?.enabled).toBe(true)
    expect(Array.isArray(config.test?.projects)).toBe(true)
  })

  it('defines vitest config with inline overrides', async () => {
    const config = await defineVitestConfig(
      {
        includeWorkspaceRootConfig: false,
      },
      {
        test: {
          coverage: {
            exclude: ['**/dist/**'],
            skipFull: false,
          },
        },
      },
    )

    expect(config.test?.coverage?.exclude).toEqual(['**/dist/**'])
    expect(config.test?.coverage?.skipFull).toBe(false)
  })

  it('merges complete vitest overrides into final config', async () => {
    const config = await defineVitestConfig(
      {
        includeWorkspaceRootConfig: false,
      },
      {
        resolve: {
          alias: {
            '@': '/tmp/src',
          },
        },
      },
    )

    expect(config.resolve?.alias).toMatchObject({
      '@': '/tmp/src',
    })
  })

  it('defines wrapper configs with inline overrides', async () => {
    const commitlint = await defineCommitlintConfig({
      extends: ['@custom/commitlint-config'],
    })
    const eslint = await defineEslintConfig({
      ignores: ['custom-ignore/**'],
      configs: [
        {
          rules: {
            'no-console': 'off',
          },
        },
      ],
    })
    const stylelint = await defineStylelintConfig({
      rules: {
        'selector-class-pattern': null,
      },
    })
    const lintStaged = await defineLintStagedConfig({
      monorepoCommand: 'monorepo',
    })
    const eslintIgnores = eslint
      .flatMap((config) => {
        const ignores = (config as { ignores?: string[] }).ignores
        return Array.isArray(ignores) ? ignores : []
      })

    expect(commitlint['extends']).toEqual(['@custom/commitlint-config'])
    expect(eslintIgnores).toContain('custom-ignore/**')
    expect(eslint.some(config => config.rules?.['no-console'] === 'off')).toBe(true)
    expect(stylelint['rules']).toMatchObject({
      'selector-class-pattern': null,
    })

    const command = lintStaged['*.{ts,tsx,mts,cts,vue}']
    expect(typeof command).toBe('function')
    if (typeof command !== 'function') {
      throw new TypeError('expected lint-staged rule to be callable')
    }
    expect(command(['src/index.ts'])).toContain('monorepo verify staged-typecheck')
  })

  it('keeps define wrapper cwd-only shorthand working', async () => {
    expect(await defineCommitlintConfig(process.cwd())).toBeTruthy()
    expect(await defineEslintConfig(process.cwd())).toBeTruthy()
    expect(await defineStylelintConfig(process.cwd())).toBeTruthy()
    expect(await defineLintStagedConfig(process.cwd())).toBeTruthy()
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
    expect(await defineCommitlintConfig()).toBeTruthy()
    expect(await defineEslintConfig()).toBeTruthy()
    expect(await defineStylelintConfig()).toBeTruthy()
    expect(await defineLintStagedConfig()).toBeTruthy()
    expect(await defineVitestConfig()).toBeTruthy()
  })
})
