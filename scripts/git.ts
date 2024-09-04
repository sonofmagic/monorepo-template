import get from 'get-value'
import type { SimpleGit, SimpleGitOptions } from 'simple-git'
import { simpleGit } from 'simple-git'
import gitUrlParse from 'git-url-parse'

export class GitClient {
  private client: SimpleGit
  constructor(options: Partial<SimpleGitOptions> = {}) {
    this.client = simpleGit(options)
  }

  listConfig() {
    return this.client.listConfig()
  }

  async getGitUrl() {
    const listConfig = await this.listConfig()
    const x = get(listConfig.all, 'remote.origin.url')
    if (x) {
      return gitUrlParse(x)
    }
  }

  async getRepoName() {
    const url = await this.getGitUrl()
    if (url) {
      return `${url.owner}/${url.name}`
    }
  }
}
