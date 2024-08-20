import get from 'get-value'
import gitUrlParse from 'git-url-parse'
import { GitClient } from '@/git'

describe('git client', () => {
  const client = new GitClient({
    baseDir: __dirname,
  })
  it('client config', async () => {
    const listConfig = await client.listConfig()
    const x = get(listConfig.all, 'remote.origin.url')
    if (x) {
      const url = gitUrlParse(x)
      const y = `${url.owner}/${url.name}`
      console.log(y)
    }
  })

  it('parse url', () => {
    const url = gitUrlParse('git@github.com:sonofmagic/weapp-tailwindcss.git')
    const y = `${url.owner}/${url.name}`
    expect(y).toBe('sonofmagic/weapp-tailwindcss')
  })
})
