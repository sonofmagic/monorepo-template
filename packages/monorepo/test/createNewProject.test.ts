import { createNewProject } from '@/create'
import path from 'pathe'

describe('createNewProject', () => {
  it('createNewProject demo case 0', async () => {
    await createNewProject({
      cwd: path.resolve(__dirname, './fixtures'),
      name: 'demo/case0',
      renameJson: true,
    })
  })
})
