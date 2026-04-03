import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
})

describe('program help surface', () => {
  it('exposes grouped commands and short aliases in help output', async () => {
    const { default: program } = await import('@/cli/program')

    const rootHelp = program.helpInformation()
    expect(rootHelp).toContain('workspace')
    expect(rootHelp).toContain('tooling')
    expect(rootHelp).toContain('package')
    expect(rootHelp).toContain('verify')
    expect(rootHelp).toContain('skills')
    expect(rootHelp).toContain('env')
    expect(rootHelp).toContain('ai')
    expect(rootHelp).not.toContain('\n  upgrade ')
    expect(rootHelp).not.toContain('\n  clean ')
    expect(rootHelp).not.toContain('\n  init ')

    const workspace = program.commands.find(command => command.name() === 'workspace')
    const tooling = program.commands.find(command => command.name() === 'tooling')
    const packageCommand = program.commands.find(command => command.name() === 'package')
    const env = program.commands.find(command => command.name() === 'env')
    const verify = program.commands.find(command => command.name() === 'verify')
    const skills = program.commands.find(command => command.name() === 'skills')
    const ai = program.commands.find(command => command.name() === 'ai')

    expect(workspace?.aliases()).toEqual(['ws'])
    expect(tooling?.aliases()).toEqual(['tg'])
    expect(packageCommand?.aliases()).toEqual(['pkg'])
    expect(env?.aliases()).toEqual(['e'])
    expect(verify?.aliases()).toEqual(['v'])
    expect(skills?.aliases()).toEqual(['sk'])
    expect(ai?.aliases()).toEqual([])

    expect(workspace?.helpInformation()).toContain('up')
    expect(tooling?.helpInformation()).toContain('i')
    expect(packageCommand?.helpInformation()).toContain('new')
    expect(env?.helpInformation()).toContain('m')
    expect(verify?.helpInformation()).toContain('push')
    expect(skills?.helpInformation()).toContain('s')
    expect(ai?.helpInformation()).toContain('prompt')
  })
})
