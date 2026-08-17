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
    expect(workflow).toContain('actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683')
    expect(workflow).toContain('pnpm/action-setup@a7487c7e89a18df4991f7f222e4898a00d66ddda')
    expect(workflow).toContain('actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020')
    expect(workflow).toContain('detect-release-trigger:')
    expect(workflow).toContain('run: node --experimental-strip-types scripts/release-trigger.ts')
    expect(workflow).toContain('needs: detect-release-trigger')
    expect(workflow).toContain('if: needs.detect-release-trigger.outputs.should_run == \'true\'')
    expect(workflow).not.toMatch(/^concurrency:/m)
    expect(workflow).toMatch(/^\s{4}concurrency:/m)
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
