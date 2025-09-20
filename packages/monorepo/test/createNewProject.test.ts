import { isCI } from 'ci-info'
import { fdir as Fdir } from 'fdir'
import fs from 'fs-extra'
import path from 'pathe'
import { createNewProject, upgradeMonorepo } from '@/monorepo'

async function scanFiles(root: string) {
  const api = new Fdir().withRelativePaths()

  return (await api.crawl(root).withPromise()).sort((a, b) => a.localeCompare(b))
}

describe.skipIf(isCI)('createNewProject', () => {
  beforeAll(async () => {
    await import('../scripts/prepublish')
    await fs.remove(path.resolve(__dirname, './fixtures/demo'))
  })

  it('assets', async () => {
    const files = await scanFiles(path.resolve(__dirname, '../assets'))
    expect(files).toMatchSnapshot()
  })

  it('upgradeMonorepo', async () => {
    await upgradeMonorepo({
      outDir: path.resolve(__dirname, './fixtures/demo/upgrade'),
    })
    const files = await scanFiles(path.resolve(__dirname, './fixtures/demo/upgrade'))
    expect(files).toMatchSnapshot()
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

  it('createNewProject demo cli case', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/cli',
      renameJson: true,
      type: 'cli',
    })
    const files = await scanFiles(path.resolve(__dirname, './fixtures/demo/cli'))
    expect(files).toMatchSnapshot()
  })

  it('createNewProject demo client case', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/client',
      renameJson: true,
      type: 'vue-hono',
    })
    const files = await scanFiles(path.resolve(__dirname, './fixtures/demo/client'))
    expect(files).toMatchSnapshot()
  })

  it('createNewProject demo server case', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/server',
      renameJson: true,
      type: 'hono-server',
    })
    const files = await scanFiles(path.resolve(__dirname, './fixtures/demo/server'))
    expect(files).toMatchSnapshot()
  })

  it('createNewProject demo website case', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/website',
      renameJson: true,
      type: 'vitepress',
    })
    const files = await scanFiles(path.resolve(__dirname, './fixtures/demo/website'))
    expect(files).toMatchSnapshot()
  })
})
