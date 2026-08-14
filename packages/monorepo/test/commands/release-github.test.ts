import { describe, expect, it, vi } from 'vitest'
import { GitHubClient } from '@/commands/release'

function response(body: unknown, status = 200) {
  return new Response(body === undefined ? '' : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

describe('GitHub release client', () => {
  it('creates a release pull request from the configured repository', async () => {
    const requestFetch = vi.fn()
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response({ number: 12, html_url: 'https://github.com/acme/repo/pull/12', state: 'open' }, 201))
    const client = new GitHubClient({
      token: 'token',
      repository: 'acme/repo',
      fetch: requestFetch,
    })

    await client.ensurePullRequest({
      head: 'release/pnpm-version',
      base: 'main',
      title: 'Release',
      body: 'Generated',
    })

    expect(requestFetch).toHaveBeenNthCalledWith(1, expect.stringContaining('/repos/acme/repo/pulls?'), expect.objectContaining({ method: 'GET' }))
    expect(requestFetch).toHaveBeenNthCalledWith(2, 'https://api.github.com/repos/acme/repo/pulls', expect.objectContaining({ method: 'POST' }))
    const request = requestFetch.mock.calls[1]?.[1] as RequestInit | undefined
    expect(JSON.parse(String(request?.body))).toMatchObject({ head: 'release/pnpm-version', base: 'main' })
  })

  it('updates an existing pull request instead of creating a duplicate', async () => {
    const requestFetch = vi.fn()
      .mockResolvedValueOnce(response([{ number: 7, html_url: 'https://github.com/acme/repo/pull/7', state: 'open' }]))
      .mockResolvedValueOnce(response({ number: 7, html_url: 'https://github.com/acme/repo/pull/7', state: 'open' }))
    const client = new GitHubClient({ token: 'token', repository: 'acme/repo', fetch: requestFetch })

    await client.ensurePullRequest({ head: 'release/pnpm-version', base: 'main', title: 'Updated', body: 'Body' })

    expect(requestFetch).toHaveBeenNthCalledWith(2, 'https://api.github.com/repos/acme/repo/pulls/7', expect.objectContaining({ method: 'PATCH' }))
    expect(requestFetch).toHaveBeenCalledTimes(2)
  })

  it('creates a release after a missing tag release and recovers a concurrent create', async () => {
    const requestFetch = vi.fn()
      .mockResolvedValueOnce(response({ message: 'Not Found' }, 404))
      .mockResolvedValueOnce(response({ message: 'already exists' }, 422))
      .mockResolvedValueOnce(response({ id: 3, html_url: 'https://github.com/acme/repo/releases/3', tag_name: 'repo@1.0.0' }))
    const client = new GitHubClient({ token: 'token', repository: 'acme/repo', fetch: requestFetch })

    await client.ensureRelease({ tag: 'repo@1.0.0', target: 'abc123' })

    expect(requestFetch).toHaveBeenNthCalledWith(2, 'https://api.github.com/repos/acme/repo/releases', expect.objectContaining({ method: 'POST' }))
    expect(requestFetch).toHaveBeenNthCalledWith(3, 'https://api.github.com/repos/acme/repo/releases/tags/repo%401.0.0', expect.objectContaining({ method: 'GET' }))
  })

  it('fails with an actionable error when token is missing', async () => {
    // The release workflow exports GITHUB_TOKEN for the whole CLI process.
    // Override it explicitly so this test remains isolated from CI runtime state.
    const client = new GitHubClient({ token: '', repository: 'acme/repo', fetch: vi.fn() })

    await expect(client.ensureRelease({ tag: 'repo@1.0.0', target: 'abc123' })).rejects.toMatchObject({
      message: expect.stringContaining('GITHUB_TOKEN'),
      status: 0,
    })
  })

  it('recovers a concurrent release PR creation', async () => {
    const requestFetch = vi.fn()
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response({ message: 'A pull request already exists' }, 422))
      .mockResolvedValueOnce(response([{ number: 19, html_url: 'https://github.com/acme/repo/pull/19', state: 'open' }]))
    const client = new GitHubClient({ token: 'token', repository: 'acme/repo', fetch: requestFetch })

    await expect(client.ensurePullRequest({
      head: 'release/pnpm-version',
      base: 'main',
      title: 'Release',
      body: 'Generated',
    })).resolves.toMatchObject({ number: 19 })
    expect(requestFetch).toHaveBeenCalledTimes(3)
  })

  it('wraps network failures with GitHub diagnostics', async () => {
    const client = new GitHubClient({
      token: 'token',
      repository: 'acme/repo',
      fetch: vi.fn().mockRejectedValue(new Error('connect timeout')),
    })

    await expect(client.ensureRelease({ tag: 'repo@1.0.0', target: 'abc123' })).rejects.toMatchObject({
      status: 0,
      message: expect.stringContaining('connect timeout'),
    })
  })

  it('creates and recovers an idempotent package tag through the REST API', async () => {
    const requestFetch = vi.fn()
      .mockResolvedValueOnce(response({ message: 'Not Found' }, 404))
      .mockResolvedValueOnce(response({ ref: 'refs/tags/repo@1.0.0' }, 201))
    const client = new GitHubClient({ token: 'token', repository: 'acme/repo', fetch: requestFetch })

    await client.ensureTag({ tag: 'repo@1.0.0', target: 'abc123' })

    expect(requestFetch).toHaveBeenNthCalledWith(2, 'https://api.github.com/repos/acme/repo/git/refs', expect.objectContaining({ method: 'POST' }))
    const request = requestFetch.mock.calls[1]?.[1] as RequestInit | undefined
    expect(JSON.parse(String(request?.body))).toEqual({ ref: 'refs/tags/repo@1.0.0', sha: 'abc123' })
  })
})
