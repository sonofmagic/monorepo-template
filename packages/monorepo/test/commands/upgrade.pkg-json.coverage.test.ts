import type { PackageJson } from '@/types'
import { describe, expect, it } from 'vitest'
import { setPkgJson } from '@/commands/upgrade/pkg-json'
import { scripts, scriptsEntries } from '@/commands/upgrade/scripts'
import { version as pkgVersion } from '@/constants'

describe('upgrade pkg-json helpers coverage', () => {
  it('merges package metadata while respecting workspace prefixes and version precedence', () => {
    const source: PackageJson = {
      packageManager: 'pnpm@8.10.0',
      dependencies: {
        'dep-keep': '^1.0.0',
        'dep-update': '^1.2.0',
        'dep-empty': '',
        'dep-catalog': '^1.3.0',
      },
      devDependencies: {
        '@icebreakers/monorepo': '^0.0.1',
        'dep-dev-update': '^2.0.0',
        'dep-dev-stale': '^2.0.0',
      },
    }

    const target: PackageJson = {
      dependencies: {
        'dep-keep': '^1.5.0',
        'dep-update': '^1.0.0',
        'dep-empty': '  ',
        'dep-workspace': 'workspace:*',
        'dep-catalog': 'catalog:crossEnv',
      },
      devDependencies: {
        '@icebreakers/monorepo': '^0.2.0',
        'dep-dev-update': 'workspace:^2.0.0',
        'dep-dev-stale': '^1.0.0',
      },
      scripts: {
        test: 'vitest',
      },
    }

    setPkgJson(source, target, {
      scripts: {
        build: 'turbo run build',
      },
    })

    expect(target.packageManager).toBe('pnpm@8.10.0')
    expect(target.dependencies).toMatchObject({
      'dep-keep': '^1.5.0',
      'dep-update': '^1.2.0',
      'dep-empty': '',
      'dep-workspace': 'workspace:*',
      'dep-catalog': 'catalog:crossEnv',
    })
    expect(target.devDependencies?.['dep-dev-update']).toBe('workspace:^2.0.0')
    expect(target.devDependencies?.['dep-dev-stale']).toBe('^2.0.0')
    expect(target.devDependencies?.['@icebreakers/monorepo']).toBe(`^${pkgVersion}`)
    expect(target.scripts).toMatchObject({
      test: 'vitest',
      build: 'turbo run build',
    })
  })

  it('exposes scripts list for consumers', () => {
    expect(Array.isArray(scriptsEntries)).toBe(true)
    expect(Object.fromEntries(scriptsEntries)).toEqual(scripts)
  })
})
