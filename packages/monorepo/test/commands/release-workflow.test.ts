import { describe, expect, it } from 'vitest'
import YAML from 'yaml'
import { rootDir } from '@/constants'
import fs from '@/utils/fs'

interface ReleaseWorkflow {
  jobs?: {
    release?: {
      steps?: Array<{ uses?: string }>
    }
  }
}

function getActionUses(workflow: string) {
  const parsed = YAML.parse(workflow) as ReleaseWorkflow
  return parsed.jobs?.release?.steps?.flatMap(step => step.uses ? [step.uses] : []) ?? []
}

describe('release workflow', () => {
  it('uses one repoctl entrypoint for release orchestration', async () => {
    const workflow = await fs.readFile(`${rootDir}/.github/workflows/release.yml`, 'utf8')
    const actionUses = getActionUses(workflow)

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
    expect(actionUses).toEqual(expect.arrayContaining([
      expect.stringMatching(/^actions\/checkout@[0-9a-f]{40}$/),
      expect.stringMatching(/^pnpm\/action-setup@[0-9a-f]{40}$/),
      expect.stringMatching(/^actions\/setup-node@[0-9a-f]{40}$/),
    ]))
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
