import { describe, expect, it } from 'vitest'
import { removeSourceRepoReleaseToolingBuildStepContent } from './prepare'

describe('removeSourceRepoReleaseToolingBuildStepContent', () => {
  it('removes source-only release tooling build step from CRLF workflows', () => {
    const content = [
      'name: Release',
      '',
      'jobs:',
      '  release:',
      '    steps:',
      '      - name: Install Dependencies',
      '        run: pnpm i',
      '',
      '      - name: Build Release Tooling',
      '        run: pnpm run tooling:build',
      '',
      '      - name: Create Release Pull Request or Publish to npm',
      '        uses: changesets/action@v1',
      '',
    ].join('\r\n')

    const nextContent = removeSourceRepoReleaseToolingBuildStepContent(content)

    expect(nextContent).toContain('Install Dependencies')
    expect(nextContent).toContain('Create Release Pull Request or Publish to npm')
    expect(nextContent).not.toContain('Build Release Tooling')
    expect(nextContent).not.toContain('pnpm run tooling:build')
  })
})
