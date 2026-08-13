import { describe, expect, it } from 'vitest'
import { rootDir } from '@/constants'
import fs from '@/utils/fs'

describe('release workflow', () => {
  it('can recover versioned packages without consuming pending changesets', async () => {
    const workflow = await fs.readFile(`${rootDir}/.github/workflows/release.yml`, 'utf8')

    expect(workflow).toContain('- publish-unpublished')
    expect(workflow).toContain(`inputs.mode == 'changesets'`)
    expect(workflow).toContain('Validate unpublished-version recovery')
    expect(workflow).toContain('run: pnpm exec repo release stable')
    expect(workflow).toContain('npm view \"$RECOVERY_PACKAGE@$RECOVERY_VERSION\" version')
    expect(workflow).toContain('Snapshot release tags')
    expect(workflow).toContain('comm -13')
    expect(workflow).toContain('grep -Fxq \"$expected_tag\"')
    expect(workflow).toContain('git push origin \"refs/tags/$tag\"')
    expect(workflow).toContain('gh release create \"$tag\"')
    expect(workflow).not.toContain('git push origin --follow-tags')
  })

  it('does not run prerelease publishing for manual recovery dispatches', async () => {
    const workflow = await fs.readFile(`${rootDir}/.github/workflows/release.yml`, 'utf8')

    expect(workflow).toContain('if: github.event_name == \'push\' && github.ref_name != \'main\'')
  })
})
