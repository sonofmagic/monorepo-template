import { describe, expect, it } from 'vitest'
import { rootDir } from '@/constants'
import fs from '@/utils/fs'

describe('release workflow', () => {
  it('uses one repoctl entrypoint for release orchestration', async () => {
    const workflow = await fs.readFile(`${rootDir}/.github/workflows/release.yml`, 'utf8')

    expect(workflow).toContain('# repoctl-managed: release/v2')
    expect(workflow).toContain('- publish-unpublished')
    expect(workflow).toContain('REPO_RELEASE_MODE: $' + '{{ inputs.mode || \'auto\' }}')
    expect(workflow).toContain('run: pnpm exec repo release ci')
    expect(workflow).toContain('GITHUB_TOKEN: $' + '{{ secrets.REPOCTL_RELEASE_TOKEN || secrets.CHANGESETS_RELEASE_TOKEN || github.token }}')
    expect(workflow).not.toContain('GITHUB_TOKEN: $' + '{{ secrets.GITHUB_TOKEN }}')
    expect(workflow).toContain('contents: write')
    expect(workflow).toContain('pull-requests: write')
    expect(workflow).toContain('id-token: write')
    expect(workflow).toContain('NPM_CONFIG_PROVENANCE: true')
    expect(workflow).toContain('fetch-depth: 0')
    expect(workflow).toContain('actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1')
    expect(workflow).toContain('pnpm/action-setup@ff378ebe6b225b0680b81c1ad4498ae0d1d3a5e3')
    expect(workflow).toContain('actions/setup-node@820762786026740c76f36085b0efc47a31fe5020')
    expect(workflow).not.toContain('detect-release-trigger:')
    expect(workflow).not.toContain('scripts/release-trigger.ts')
    expect(workflow).not.toContain('needs: detect-release-trigger')
    expect(workflow).not.toContain('if: needs.detect-release-trigger.outputs.should_run == \'true\'')
    expect(workflow).toMatch(/^concurrency:/m)
    expect(workflow).not.toMatch(/^\s{4}concurrency:/m)
    expect(workflow).not.toContain('changesets/action')
    expect(workflow).not.toContain('changeset publish')
    expect(workflow).not.toContain('.changeset/pre.json')
    expect(workflow).not.toContain('peter-evans/create-pull-request')
    expect(workflow).not.toContain('gh release')
    expect(workflow).not.toContain('jq ')
    expect(workflow).not.toContain('pnpm-publish-summary.json')
  })

  it('keeps stable and prerelease branch triggers in the single workflow', async () => {
    const workflow = await fs.readFile(`${rootDir}/.github/workflows/release.yml`, 'utf8')

    expect(workflow).toContain('      - main')
    expect(workflow).toContain('      - alpha')
    expect(workflow).toContain('      - beta')
    expect(workflow).toContain('      - rc')
    expect(workflow).toContain('      - next')
  })
})
