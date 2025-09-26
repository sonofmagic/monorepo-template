import type { ConfigValues, SimpleGit, SimpleGitOptions } from '@/types'
import get from 'get-value'
import gitUrlParse from 'git-url-parse'
import { simpleGit } from 'simple-git'

/**
 * 对 simple-git 的轻量封装，集中处理配置缓存与常用查询。
 */
export class GitClient {
  private readonly client: SimpleGit
  #config: ConfigValues | undefined
  constructor(options: Partial<SimpleGitOptions> = {}) {
    this.client = simpleGit(options)
  }

  /**
   * 读取 Git 的 config 列表，原样返回 simple-git 的结果。
   */
  listConfig() {
    return this.client.listConfig()
  }

  /**
   * 初始化配置缓存，避免多次访问 Git 产生的性能损耗。
   */
  async init() {
    const listConfig = await this.listConfig()
    this.#config = listConfig.all
    return this.#config
  }

  /**
   * 获取缓存的配置，若未初始化则自动触发 init。
   */
  async getConfig() {
    if (this.#config) {
      return this.#config
    }
    else {
      return await this.init()
    }
  }

  /**
   * 解析 remote.origin.url，返回 git-url-parse 的结构，便于获取仓库元信息。
   */
  async getGitUrl() {
    const config = await this.getConfig()
    const x = get(config, 'remote.origin.url')
    if (x) {
      return gitUrlParse(x)
    }
  }

  /**
   * 组合 owner/name，生成常用的仓库名表达。
   */
  async getRepoName() {
    const url = await this.getGitUrl()
    if (url) {
      return `${url.owner}/${url.name}`
    }
  }

  /**
   * 从 Git 配置中提取用户信息，用于填充 package.json author 字段。
   */
  async getUser() {
    const config = await this.getConfig()
    const name: string = get(config, 'user.name')
    const email: string = get(config, 'user.email')
    return {
      name,
      email,
    }
  }
}
