import type { ReleaseNoteDocument } from './notes/model'
import process from 'node:process'
import { logger } from '../../core/logger'
import { ReleaseCommandError } from './errors'
import { isAutomationContributor } from './notes/model'

interface GitHubPullRequest {
  number: number
  html_url: string
  state: string
  title?: string
  body?: string | null
  head?: { ref?: string }
}

export interface GitHubRelease {
  id: number
  html_url: string
  tag_name: string
  name?: string
  draft?: boolean
  prerelease?: boolean
}

interface GitHubCommit {
  author?: { login?: string } | null
  commit?: { author?: { name?: string } | null }
}

interface GitHubIssue {
  user?: { login?: string } | null
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
  name?: string
  body?: string
}

export interface EnsureTagOptions {
  tag: string
  target: string
}

export interface UpdateReleaseOptions {
  id: number
  name: string
  body: string
}

export interface GitHubOperations {
  ensurePullRequest: (options: EnsurePullRequestOptions) => Promise<GitHubPullRequest>
  closeLegacyReleasePullRequests?: (options: CloseLegacyPullRequestsOptions) => Promise<void>
  ensureRelease: (options: EnsureReleaseOptions) => Promise<GitHubRelease>
  ensureTag?: (options: EnsureTagOptions) => Promise<void>
  enrichReleaseNote?: (document: ReleaseNoteDocument) => Promise<ReleaseNoteDocument>
  listReleases?: () => Promise<GitHubRelease[]>
  updateRelease?: (options: UpdateReleaseOptions) => Promise<GitHubRelease>
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
      await this.request<GitHubPullRequest>('PATCH', `/pulls/${existing.number}`, { title: options.title, body: options.body, base: options.base })
      return existing
    }
    try {
      const created = await this.request<GitHubPullRequest>('POST', '/pulls', { title: options.title, body: options.body, head: options.head, base: options.base })
      if (!created.data) {
        throw new GitHubApiError('GitHub did not return the created pull request', created.status)
      }
      return created.data
    }
    catch (error) {
      if (!(error instanceof GitHubApiError) || error.status !== 422) {
        throw error
      }
      const recovered = await this.request<GitHubPullRequest[]>('GET', `/pulls?${query.toString()}`)
      if (recovered.data?.[0]) {
        return recovered.data[0]
      }
      throw error
    }
  }

  async closeLegacyReleasePullRequests(options: CloseLegacyPullRequestsOptions) {
    const repository = this.getRepository()
    const [owner] = repository.split('/')
    const head = options.head.includes(':') ? options.head : `${owner}:${options.head}`
    const query = new URLSearchParams({ state: 'open', head, base: options.base, per_page: '100' })
    const listed = await this.request<GitHubPullRequest[]>('GET', `/pulls?${query.toString()}`)
    for (const pullRequest of listed.data ?? []) {
      const isLegacyRelease = pullRequest.head?.ref === options.head && (pullRequest.title === 'Version Packages' || pullRequest.body?.includes('changesets/action') === true)
      if (isLegacyRelease) {
        await this.request<GitHubPullRequest>('PATCH', `/pulls/${pullRequest.number}`, { state: 'closed' })
      }
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
      if (options.body !== undefined || options.name !== undefined) {
        const updated = await this.request<GitHubRelease>('PATCH', `/releases/${existing.id}`, {
          ...(options.name === undefined ? {} : { name: options.name }),
          ...(options.body === undefined ? {} : { body: options.body }),
          prerelease: options.prerelease ?? false,
        })
        return updated.data ?? existing
      }
      return existing
    }
    try {
      const created = await this.request<GitHubRelease>('POST', '/releases', {
        tag_name: options.tag,
        target_commitish: options.target,
        name: options.name ?? options.tag,
        ...(options.body === undefined ? { generate_release_notes: true } : { body: options.body }),
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

  async listReleases() {
    const releases: GitHubRelease[] = []
    for (let page = 1; ; page++) {
      const response = await this.request<GitHubRelease[]>('GET', `/releases?per_page=100&page=${page}`)
      const pageReleases = response.data ?? []
      releases.push(...pageReleases)
      if (pageReleases.length < 100) {
        break
      }
    }
    return releases
  }

  async updateRelease(options: UpdateReleaseOptions) {
    const response = await this.request<GitHubRelease>('PATCH', `/releases/${options.id}`, {
      name: options.name,
      body: options.body,
    })
    if (!response.data) {
      throw new GitHubApiError(`GitHub did not return release ${options.id} after update`, response.status)
    }
    return response.data
  }

  async enrichReleaseNote(document: ReleaseNoteDocument) {
    try {
      const commitAuthors = new Map<string, string>()
      const commitShas = [...new Set(document.entries.flatMap(entry => entry.commits.map(commit => commit.sha)))]
      for (const sha of commitShas) {
        const response = await this.request<GitHubCommit>('GET', `/commits/${encodeURIComponent(sha)}`)
        const author = response.data?.author?.login || response.data?.commit?.author?.name
        if (author) {
          commitAuthors.set(sha, author)
        }
      }
      const referenceNumbers = [...new Set(document.entries.flatMap(entry => [...entry.pullRequests, ...entry.issues]))]
      const referenceAuthors = new Set<string>()
      for (const number of referenceNumbers) {
        const response = await this.request<GitHubIssue>('GET', `/issues/${number}`)
        const author = response.data?.user?.login
        if (author) {
          referenceAuthors.add(author)
        }
      }
      const entries = document.entries.map((entry) => {
        const authors = [...new Set([...entry.authors, ...entry.commits.map(commit => commitAuthors.get(commit.sha)).filter((author): author is string => Boolean(author))])]
        return authors.length ? { ...entry, authors } : entry
      })
      return {
        ...document,
        entries,
        contributors: [...new Set([...document.contributors, ...commitAuthors.values(), ...referenceAuthors])].filter(value => !isAutomationContributor(value)),
      }
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.warn(`GitHub release note metadata enrichment skipped: ${message}`)
      return document
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
      await this.request('POST', '/git/refs', { ref: `refs/tags/${options.tag}`, sha: options.target })
    }
    catch (error) {
      if (!(error instanceof GitHubApiError) || error.status !== 422) {
        throw error
      }
      await this.request('GET', endpoint)
    }
  }
}
