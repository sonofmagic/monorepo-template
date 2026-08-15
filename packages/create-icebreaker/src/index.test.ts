import { describe, expect, it } from 'vitest'
import packageJson from '../package.json' with { type: 'json' }

describe('create-icebreaker compatibility package', () => {
  it('keeps the compatibility bin and delegates to create-repoctl', () => {
    expect(packageJson.bin).toEqual({
      'create-icebreaker': 'bin/create-icebreaker.js',
    })
    expect(packageJson.dependencies).toEqual({
      'create-repoctl': 'workspace:*',
    })
  })
})
