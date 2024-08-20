import type { SimpleGit, SimpleGitOptions } from 'simple-git'
import { simpleGit } from 'simple-git'
import gitUrlParse from 'git-url-parse'
import get from 'get-value'

export class GitClient {
  private client: SimpleGit
  constructor(options: Partial<SimpleGitOptions>) {
    this.client = simpleGit(options)
  }

  listConfig() {
    return this.client.listConfig()
  }

  async getRepoName() {
    const listConfig = await this.listConfig()
    const x = get(listConfig.all, 'remote.origin.url')
    if (x) {
      const url = gitUrlParse(x)
      return `${url.owner}/${url.name}`
    }
  }
}
