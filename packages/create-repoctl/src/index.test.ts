import { describe, expect, it } from 'vitest'
import packageJson from '../package.json' with { type: 'json' }

describe('create-repoctl package metadata', () => {
  it('exposes create-repoctl so npm create, yarn create, and pnpm create can bootstrap repoctl projects', () => {
    expect(packageJson.name).toBe('create-repoctl')
    expect(packageJson.bin).toEqual({
      'create-repoctl': 'bin/create-repoctl.js',
    })
    expect(packageJson.dependencies).toEqual({
      'create-icebreaker': 'workspace:*',
    })
  })
})
