import process from 'node:process'
import { ReleaseCommandError } from './errors'

interface GitHubPullRequest {
  number: number
  html_url: string
  state: string
  title?: string
  body?: string | null
  head?: {
    ref?: string
  }
}

interface GitHubRelease {
  id: number
  html_url: string
  tag_name: string
}

export interface GitHubClientOptions {
  token?: string
  repository?: string
  apiUrl?: string
  fetch?: typeof fetch
}

export interface EnsurePullRequestOptions {
  head: string
  base: string
  title: string
  body: string
}

export interface CloseLegacyPullRequestsOptions {
  head: string
  base: string
}

export interface EnsureReleaseOptions {
  tag: string
  target: string
  prerelease?: boolean
}

export interface EnsureTagOptions {
  tag: string
  target: string
}

export interface GitHubOperations {
  ensurePullRequest: (options: EnsurePullRequestOptions) => Promise<GitHubPullRequest>
  closeLegacyReleasePullRequests?: (options: CloseLegacyPullRequestsOptions) => Promise<void>
  ensureRelease: (options: EnsureReleaseOptions) => Promise<GitHubRelease>
  ensureTag?: (options: EnsureTagOptions) => Promise<void>
}

export class GitHubApiError extends ReleaseCommandError {
  constructor(message: string, public readonly status: number, public readonly responseBody?: string) {
    super(message)
    this.name = 'GitHubApiError'
  }
}

export class GitHubClient implements GitHubOperations {
  private readonly token: string | undefined
  private readonly repository: string | undefined
  private readonly apiUrl: string
  private readonly requestFetch: typeof fetch

  constructor(options: GitHubClientOptions = {}) {
    this.token = options.token ?? process.env['GITHUB_TOKEN']
    this.repository = options.repository ?? process.env['GITHUB_REPOSITORY']
    this.apiUrl = (options.apiUrl ?? process.env['GITHUB_API_URL'] ?? 'https://api.github.com').replace(/\/$/, '')
    this.requestFetch = options.fetch ?? globalThis.fetch
  }

  private getRepository() {
    if (!this.token) {
      throw new GitHubApiError('GITHUB_TOKEN is required for GitHub release orchestration', 0)
    }
    if (!this.repository || !/^[^/]+\/[^/]+$/.test(this.repository)) {
      throw new GitHubApiError('GITHUB_REPOSITORY must be in owner/name format', 0)
    }
    return this.repository
  }

  private async request<T>(method: string, endpoint: string, body?: unknown): Promise<{ status: number, data: T | undefined }> {
    const repository = this.getRepository()
    let response: Response
    try {
      response = await this.requestFetch(`${this.apiUrl}/repos/${repository}${endpoint}`, {
        method,
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${this.token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      })
    }
    catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new GitHubApiError(`GitHub API request ${method} ${endpoint} failed: ${detail}. Check network access and GITHUB_API_URL.`, 0)
    }
    const text = await response.text()
    let data: T | undefined
    if (text) {
      try {
        data = JSON.parse(text) as T
      }
      catch {
        throw new GitHubApiError(`GitHub API returned invalid JSON for ${method} ${endpoint}`, response.status, text)
      }
    }
    if (!response.ok) {
      const message = typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: unknown }).message)
        : text || response.statusText
      throw new GitHubApiError(`GitHub API ${method} ${endpoint} failed (${response.status}): ${message}`, response.status, text)
    }
    return { status: response.status, data }
  }

  async ensurePullRequest(options: EnsurePullRequestOptions) {
    const repository = this.getRepository()
    const [owner] = repository.split('/')
    const head = options.head.includes(':') ? options.head : `${owner}:${options.head}`
    const query = new URLSearchParams({ state: 'open', head, base: options.base, per_page: '10' })
    const listed = await this.request<GitHubPullRequest[]>('GET', `/pulls?${query.toString()}`)
    const existing = listed.data?.[0]
    if (existing) {
      await this.request<GitHubPullRequest>('PATCH', `/pulls/${existing.number}`, {
        title: options.title,
        body: options.body,
        base: options.base,
      })
      return existing
    }
    let created: { status: number, data: GitHubPullRequest | undefined }
    try {
      created = await this.request<GitHubPullRequest>('POST', '/pulls', {
        title: options.title,
        body: options.body,
        head: options.head,
        base: options.base,
      })
    }
    catch (error) {
      if (!(error instanceof GitHubApiError) || error.status !== 422) {
        throw error
      }
      // Another runner may have created the same PR between the list and
      // create requests. Re-list once and return the winner.
      const recovered = await this.request<GitHubPullRequest[]>('GET', `/pulls?${query.toString()}`)
      if (recovered.data?.[0]) {
        return recovered.data[0]
      }
      throw error
    }
    if (!created.data) {
      throw new GitHubApiError('GitHub did not return the created pull request', created.status)
    }
    return created.data
  }

  async closeLegacyReleasePullRequests(options: CloseLegacyPullRequestsOptions) {
    const repository = this.getRepository()
    const [owner] = repository.split('/')
    const head = options.head.includes(':') ? options.head : `${owner}:${options.head}`
    const query = new URLSearchParams({ state: 'open', head, base: options.base, per_page: '100' })
    const listed = await this.request<GitHubPullRequest[]>('GET', `/pulls?${query.toString()}`)

    for (const pullRequest of listed.data ?? []) {
      const isLegacyRelease = pullRequest.head?.ref === options.head
        && (pullRequest.title === 'Version Packages' || pullRequest.body?.includes('changesets/action') === true)
      if (!isLegacyRelease) {
        continue
      }
      await this.request<GitHubPullRequest>('PATCH', `/pulls/${pullRequest.number}`, { state: 'closed' })
    }
  }

  async ensureRelease(options: EnsureReleaseOptions) {
    let existing: GitHubRelease | undefined
    try {
      existing = (await this.request<GitHubRelease>('GET', `/releases/tags/${encodeURIComponent(options.tag)}`)).data
    }
    catch (error) {
      if (!(error instanceof GitHubApiError) || error.status !== 404) {
        throw error
      }
    }
    if (existing) {
      return existing
    }
    try {
      const created = await this.request<GitHubRelease>('POST', '/releases', {
        tag_name: options.tag,
        target_commitish: options.target,
        name: options.tag,
        generate_release_notes: true,
        prerelease: options.prerelease ?? false,
      })
      if (!created.data) {
        throw new GitHubApiError('GitHub did not return the created release', created.status)
      }
      return created.data
    }
    catch (error) {
      if (!(error instanceof GitHubApiError) || error.status !== 422) {
        throw error
      }
      const recovered = await this.request<GitHubRelease>('GET', `/releases/tags/${encodeURIComponent(options.tag)}`)
      if (!recovered.data) {
        throw error
      }
      return recovered.data
    }
  }

  async ensureTag(options: EnsureTagOptions) {
    const endpoint = `/git/ref/tags/${encodeURIComponent(options.tag)}`
    try {
      await this.request('GET', endpoint)
      return
    }
    catch (error) {
      if (!(error instanceof GitHubApiError) || error.status !== 404) {
        throw error
      }
    }

    try {
      await this.request('POST', '/git/refs', {
        ref: `refs/tags/${options.tag}`,
        sha: options.target,
      })
    }
    catch (error) {
      if (!(error instanceof GitHubApiError) || error.status !== 422) {
        throw error
      }
      // A concurrent runner may have created the same ref.
      await this.request('GET', endpoint)
    }
  }
}
