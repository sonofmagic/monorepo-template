import { isCI } from 'ci-info'
import path from 'pathe'
import { createNewProject } from '@/create'

describe.skipIf(isCI)('createNewProject', () => {
  beforeAll(async () => {
    await import('../scripts/prepublish')
  })

  it('createNewProject demo unbuild case', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/case-unbuild',
      renameJson: true,
      type: 'unbuild',
    })
  })

  it('createNewProject demo tsup case', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/case-tsup',
      renameJson: true,
      type: 'tsup',
    })
  })

  it('createNewProject demo vue-ui case', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/case-vue-ui',
      renameJson: true,
      type: 'vue-lib',
    })
  })

  it('createNewProject demo default case', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/case-default',
      renameJson: true,
    })
  })
})
