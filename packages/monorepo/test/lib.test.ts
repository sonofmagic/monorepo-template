import type { PackageJson } from 'pkg-types'
import get from 'get-value'
import { version } from '@/constants'
import { setPkgJson } from '@/upgrade'

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
})
