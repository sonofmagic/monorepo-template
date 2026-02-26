import { describe, expect, it } from 'vitest'
import { isAgentsMarkdownEquivalent, mergeAgentsMarkdown } from '@/commands/upgrade/agents'

describe('mergeAgentsMarkdown', () => {
  it('keeps existing sections and fills missing sections from source', () => {
    const source = [
      '# Repository Guidelines',
      '',
      '## Project Structure',
      '',
      'source project structure',
      '',
      '## Build',
      '',
      'source build command',
      '',
      '## Testing',
      '',
      'source testing section',
      '',
    ].join('\n')
    const target = [
      '# Team Custom Guidelines',
      '',
      '## Project Structure',
      '',
      'custom project structure',
      '',
      '## Team Notes',
      '',
      'team-only notes',
      '',
    ].join('\n')

    const merged = mergeAgentsMarkdown(source, target)

    expect(merged).toContain('# Team Custom Guidelines')
    expect(merged).toContain('custom project structure')
    expect(merged).not.toContain('source project structure')
    expect(merged).toContain('## Build')
    expect(merged).toContain('source build command')
    expect(merged).toContain('## Testing')
    expect(merged).toContain('source testing section')
    expect(merged).toContain('## Team Notes')
    expect(merged).toContain('team-only notes')
  })

  it('falls back to line-based merge when headings are missing', () => {
    const source = [
      'line-a',
      'line-b',
      'line-c',
      '',
    ].join('\n')
    const target = [
      'line-a',
      'line-x',
      '',
    ].join('\n')

    const merged = mergeAgentsMarkdown(source, target)

    expect(merged).toBe([
      'line-a',
      'line-x',
      'line-b',
      'line-c',
      '',
    ].join('\n'))
  })

  it('is idempotent and does not accumulate duplicate custom sections', () => {
    const source = [
      '# Repository Guidelines',
      '',
      '## Build',
      '',
      'source build command',
      '',
    ].join('\n')
    const target = [
      '# Team Custom Guidelines',
      '',
      '## Build',
      '',
      'custom build command',
      '',
      '## Team Notes',
      '',
      'team-only notes',
      '',
      '## Team Notes',
      '',
      'team-only notes',
      '',
    ].join('\n')

    const once = mergeAgentsMarkdown(source, target)
    const twice = mergeAgentsMarkdown(source, once)

    expect(twice).toBe(once)
    expect(once.match(/^## Team Notes$/gm)).toHaveLength(1)
  })

  it('treats trailing newline and EOL differences as equivalent content', () => {
    const linux = ['# Title', '', '## Section', '', 'body', ''].join('\n')
    const windows = '# Title\r\n\r\n## Section\r\n\r\nbody'
    expect(isAgentsMarkdownEquivalent(linux, windows)).toBe(true)
  })
})
