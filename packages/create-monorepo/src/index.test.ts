import { describe, expect, it } from 'vitest'
import packageJson from '../package.json' with { type: 'json' }

describe('create-monorepo package metadata', () => {
  it('exposes create-monorepo so npm create, yarn create, and pnpm create can bootstrap repoctl projects', () => {
    expect(packageJson.name).toBe('create-monorepo')
    expect(packageJson.bin).toEqual({
      'create-monorepo': 'bin/create-monorepo.js',
    })
    expect(packageJson.dependencies).toEqual({
      'create-icebreaker': 'workspace:*',
    })
  })
})
