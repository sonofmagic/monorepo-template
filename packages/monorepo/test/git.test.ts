import CI from 'ci-info'
import get from 'get-value'
import gitUrlParse from 'git-url-parse'
import { vi } from 'vitest'
import { GitClient } from '@/core/git'
import { logger } from '@/core/logger'

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
      logger.log(y)
    }
  })

  it('parse url', () => {
    const url = gitUrlParse('git@github.com:sonofmagic/weapp-tailwindcss.git')
    const y = `${url.owner}/${url.name}`
    expect(y).toBe('sonofmagic/weapp-tailwindcss')
  })

  it('getRepoName returns undefined when origin is missing', async () => {
    const spy = vi.spyOn(client, 'getConfig').mockResolvedValue({})
    expect(await client.getRepoName()).toBeUndefined()
    spy.mockRestore()
  })

  it('getRepoName resolves owner/name when remote exists', async () => {
    const spy = vi.spyOn(client, 'getConfig').mockResolvedValue({
      'remote.origin.url': 'git@github.com:ice/awesome.git',
    })
    expect(await client.getRepoName()).toBe('ice/awesome')
    spy.mockRestore()
  })

  it.skipIf(CI.isCI)('getUser', async () => {
    const user = await client.getUser()
    expect(user).toBeTruthy()
    expect(user.email).toBeTruthy()
    expect(user.name).toBeTruthy()
    logger.log('[Git getUser]', user)
  })
})
