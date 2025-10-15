import type { PackageJson } from 'pkg-types'
import get from 'get-value'
import { setPkgJson } from '@/commands/upgrade'
import { version } from '@/constants'

describe('lib', () => {
  it('setPkgJson casae 0', () => {
    const t: PackageJson = {
      packageManager: 'pnpm@9.12.1',
    }
    const o: PackageJson = {}
    setPkgJson(t, o)
    expect(o.packageManager).toBe('pnpm@9.12.1')
    expect(o).toMatchSnapshot()
  })

  it('setPkgJson casae 1', () => {
    const t = {

    }
    const o = {
      scripts: {
        'build': 'turbo run build',
        'dev': 'turbo run dev --parallel',
        'test': 'vitest run --coverage.enabled',
        'test:dev': 'vitest',
        'lint': 'turbo run lint',
        'release': 'changeset',
        'publish-packages': 'turbo run build lint test && changeset version && changeset publish',
        'preinstall': 'npx only-allow pnpm',
        'prepare': 'husky',
        'commit': 'commit',
      },
    }
    setPkgJson(t, o)
    expect(o).toMatchSnapshot()
  })

  it('setPkgJson casae 2', () => {
    const t: PackageJson = {
      dependencies: {
        xx: '0.0.0',
      },
      devDependencies: {
        x: '0.0.0',
      },
    }
    const o: PackageJson = {
      dependencies: {
        xx: 'workspace:*',
      },
      devDependencies: {
        x: 'workspace:*',
      },
    }
    setPkgJson(t, o)
    expect(o).toMatchSnapshot()
  })

  it('setPkgJson casae 3', () => {
    const t: PackageJson = {
      dependencies: {
        xx: '0.0.0',
      },
      devDependencies: {
        x: '0.0.0',
      },
    }
    const o: PackageJson = {
      dependencies: {
        xx: '2.2.2',
      },
      devDependencies: {
        x: '1.1.1',
      },
    }
    setPkgJson(t, o)
    expect(o).toMatchSnapshot()
  })

  it('setPkgJson casae 4', () => {
    const t: PackageJson = {
      devDependencies: {
        '@icebreakers/monorepo': '1',
      },
    }
    const o: PackageJson = {
      devDependencies: {
        '@icebreakers/monorepo': '2',
      },
    }
    setPkgJson(t, o)
    if (o.devDependencies) {
      expect(get(o.devDependencies, '@icebreakers/monorepo')).toBe(`^${version}`)
    }
  })

  it('setPkgJson casae 5', () => {
    const t: PackageJson = {
      devDependencies: {
        '@icebreakers/monorepo': '1.0.0',
      },
    }
    const o: PackageJson = {
      devDependencies: {
        '@icebreakers/monorepo': '^999.0.0',
      },
    }
    setPkgJson(t, o)
    if (o.devDependencies) {
      expect(get(o.devDependencies, '@icebreakers/monorepo')).toBe('^999.0.0')
    }
  })

  it('setPkgJson casae 6', () => {
    const t: PackageJson = {
      dependencies: {
        foo: '^2.0.0',
      },
      devDependencies: {
        bar: '~3.1.0',
      },
    }
    const o: PackageJson = {
      dependencies: {
        foo: '^1.0.0',
      },
      devDependencies: {
        bar: '~3.0.0',
      },
    }
    setPkgJson(t, o)
    expect(o.dependencies?.foo).toBe('^2.0.0')
    expect(o.devDependencies?.bar).toBe('~3.1.0')
  })

  it('setPkgJson casae 7', () => {
    const t: PackageJson = {
      dependencies: {
        foo: '^2.0.0',
      },
      devDependencies: {
        bar: '^4.0.0',
      },
    }
    const o: PackageJson = {
      dependencies: {
        foo: 'workspace:*',
      },
      devDependencies: {
        bar: 'workspace:*',
      },
    }
    setPkgJson(t, o)
    expect(o.dependencies?.foo).toBe('workspace:*')
    expect(o.devDependencies?.bar).toBe('workspace:*')
  })
})
