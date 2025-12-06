import type { WorkspaceManifest } from '@pnpm/workspace.read-manifest'
import { describe, expect, it } from 'vitest'
import { mergeWorkspaceManifest, normalizeWorkspaceManifest } from '@/commands/upgrade/workspace'

describe('mergeWorkspaceManifest', () => {
  it('adds missing workspace config without overriding existing values', () => {
    const source: WorkspaceManifest = normalizeWorkspaceManifest({
      packages: ['apps/*', 'packages/*', '!**/test/**'],
      onlyBuiltDependencies: ['esbuild', 'sharp'],
      catalogs: {
        default: {
          typescript: '5.5.0',
          vitest: '2.0.0',
        },
      },
    })
    const target: WorkspaceManifest = normalizeWorkspaceManifest({
      packages: ['apps/*'],
      onlyBuiltDependencies: ['sharp'],
      catalogs: {
        default: {
          typescript: '5.4.0',
        },
        custom: {
          eslint: '9.0.0',
        },
      },
    })

    const merged = mergeWorkspaceManifest(source, target)

    expect(merged.packages).toEqual(['apps/*', 'packages/*', '!**/test/**'])
    expect(merged.onlyBuiltDependencies).toEqual(['sharp', 'esbuild'])
    expect(merged.catalogs).toEqual({
      default: {
        typescript: '5.4.0',
        vitest: '2.0.0',
      },
      custom: {
        eslint: '9.0.0',
      },
    })
  })

  it('keeps target shapes when source types differ', () => {
    const merged = mergeWorkspaceManifest(
      normalizeWorkspaceManifest({ packages: ['apps/*'], hoist: true }),
      normalizeWorkspaceManifest({ packages: 'string-value', hoist: false }),
    )

    expect(merged.packages).toBe('string-value')
    expect(merged.hoist).toBe(false)
  })
})
