import { describe, expect, it } from 'vitest'
import packageJson from '../package.json' with { type: 'json' }

describe('create-repo package metadata', () => {
  it('exposes create-repo so npm create, yarn create, and pnpm create can bootstrap repoctl projects', () => {
    expect(packageJson.name).toBe('create-repo')
    expect(packageJson.bin).toEqual({
      'create-repo': 'bin/create-repo.js',
    })
    expect(packageJson.dependencies).toEqual({
      'create-icebreaker': 'workspace:*',
    })
  })
})
