import { isCI } from 'ci-info'
import { fdir as Fdir } from 'fdir'
import path from 'pathe'
import { createNewProject } from '@/monorepo'

async function scanFiles(root: string) {
  const api = new Fdir().withRelativePaths()

  return (await api.crawl(root).withPromise()).sort((a, b) => a.localeCompare(b))
}

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
    const files = await scanFiles(path.resolve(__dirname, './fixtures/demo/case-unbuild'))
    expect(files).toMatchSnapshot()
  })

  it('createNewProject demo tsup case', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/case-tsup',
      renameJson: true,
      type: 'tsup',
    })
    const files = await scanFiles(path.resolve(__dirname, './fixtures/demo/case-tsup'))
    expect(files).toMatchSnapshot()
  })

  it('createNewProject demo vue-ui case', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/case-vue-ui',
      renameJson: true,
      type: 'vue-lib',
    })
    const files = await scanFiles(path.resolve(__dirname, './fixtures/demo/case-vue-ui'))
    expect(files).toMatchSnapshot()
  })

  it('createNewProject demo default case', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/case-default',
      renameJson: true,
    })
    const files = await scanFiles(path.resolve(__dirname, './fixtures/demo/case-default'))
    expect(files).toMatchSnapshot()
  })
})
