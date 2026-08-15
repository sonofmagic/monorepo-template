import { describe, expect, it } from 'vitest'
import YAML from 'yaml'
import { removeSourceRepoReleaseToolingBuildStepContent, sanitizePublishedWorkspaceContent, shouldCopyPublishedAssetPath } from './prepare'

describe('sanitizePublishedWorkspaceContent', () => {
  it('removes source package identities and preserves generic versioning settings', () => {
    const content = [
      'packages:',
      '  - packages/*',
      'versioning:',
      '  fixed:',
      '    - [repoctl, "@icebreakers/monorepo"]',
      '  ignore:',
      '    - private-package',
      '  lanes:',
      '    repoctl: next',
      '  changelog:',
      '    storage: repository',
      '  updateInternalDependencies: patch',
    ].join('\n')

    expect(YAML.parse(sanitizePublishedWorkspaceContent(content))).toEqual({
      packages: ['packages/*'],
      versioning: {
        changelog: { storage: 'repository' },
        updateInternalDependencies: 'patch',
      },
    })
  })

  it('leaves workspace files without versioning unchanged', () => {
    const content = 'packages:\n  - packages/*\n'
    expect(sanitizePublishedWorkspaceContent(content)).toBe(content)
  })
})

describe('shouldCopyPublishedAssetPath', () => {
  it('excludes local pnpm change ledger state from published assets', () => {
    expect(shouldCopyPublishedAssetPath('.changeset', '/repo/.changeset/ledger.yaml')).toBe(false)
    expect(shouldCopyPublishedAssetPath('.changeset', '/repo/.changeset/README.md')).toBe(true)
  })
})

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
      '      - name: Create or update Release PR',
      '        uses: peter-evans/create-pull-request@v8',
      '        with:',
      '          token: $' + '{{ secrets.GITHUB_TOKEN }}',
      '',
    ].join('\r\n')

    const nextContent = removeSourceRepoReleaseToolingBuildStepContent(content)

    expect(nextContent).toContain('Install Dependencies')
    expect(nextContent).toContain('Create or update Release PR')
    expect(nextContent).toContain('peter-evans/create-pull-request@v8')
    expect(nextContent).not.toContain('Build Release Tooling')
    expect(nextContent).not.toContain('pnpm run tooling:build')
  })
})
