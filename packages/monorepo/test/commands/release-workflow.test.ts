import { describe, expect, it } from 'vitest'
import { rootDir } from '@/constants'
import fs from '@/utils/fs'

describe('release workflow', () => {
  it('can recover versioned packages without consuming pending intents', async () => {
    const workflow = await fs.readFile(`${rootDir}/.github/workflows/release.yml`, 'utf8')

    expect(workflow).toContain('- publish-unpublished')
    expect(workflow).toContain(`inputs.mode == 'prepare'`)
    expect(workflow).toContain('Validate recovery input')
    expect(workflow).toContain('run: pnpm exec repo release stable prepare')
    expect(workflow).toContain('run: pnpm exec repo release stable publish')
    expect(workflow).toContain('pnpm-publish-summary.json')
    expect(workflow).toContain('peter-evans/create-pull-request@v8')
    expect(workflow).not.toContain('changesets/action')
    expect(workflow).not.toContain('changeset publish')
    expect(workflow).not.toContain('.changeset/pre.json')
    expect(workflow).toContain('npm view \"$RECOVERY_PACKAGE@$RECOVERY_VERSION\" version')
    expect(workflow).toContain('git push origin "refs/tags/$tag"')
    expect(workflow).toContain('gh release create "$tag"')
    expect(workflow).not.toContain('git push origin --follow-tags')
  })

  it('does not run prerelease publishing for manual recovery dispatches', async () => {
    const workflow = await fs.readFile(`${rootDir}/.github/workflows/release.yml`, 'utf8')

    expect(workflow).toContain('if: github.event_name == \'push\' && github.ref_name != \'main\'')
  })
})
