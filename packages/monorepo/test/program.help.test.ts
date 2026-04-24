import type { Command } from '@icebreakers/monorepo-templates'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(async () => {
  await vi.resetModules()
})

describe('program help surface', () => {
  it('exposes grouped commands and short aliases in help output', async () => {
    const { default: program } = await import('@/cli/program')

    let renderedHelp = ''
    program.configureOutput({
      writeOut: (str) => {
        renderedHelp += str
      },
      writeErr: () => {},
    })
    program.outputHelp()

    const rootHelp = renderedHelp
    expect(rootHelp).toContain('workspace')
    expect(rootHelp).toContain('tooling')
    expect(rootHelp).toContain('package')
    expect(rootHelp).toContain('verify')
    expect(rootHelp).toContain('skills')
    expect(rootHelp).toContain('env')
    expect(rootHelp).toContain('ai')
    expect(rootHelp).toContain('\n  init|setup [options]')
    expect(rootHelp).toContain('\n  new [options] [name]')
    expect(rootHelp).toContain('\n  check [options]')
    expect(rootHelp).toContain('\n  upgrade [options]')
    expect(rootHelp).toContain('\n  sync [options]')
    expect(rootHelp).toContain('\n  clean [options]')
    expect(rootHelp).toContain('\n  mirror')
    expect(rootHelp).toContain('Existing repo:')
    expect(rootHelp).toContain('$ repoctl setup')
    expect(rootHelp).toContain('$ repoctl new my-package')
    expect(rootHelp).toContain('Faster in generated repos:')
    expect(rootHelp).toContain('$ pnpm setup')
    expect(rootHelp).toContain('Zero-install cleanup:')
    expect(rootHelp).toContain('$ pnpm dlx repoctl@latest clean --yes')
    expect(rootHelp).toContain('$ repo setup')

    const workspace = program.commands.find((command: Command) => command.name() === 'workspace')
    const tooling = program.commands.find((command: Command) => command.name() === 'tooling')
    const packageCommand = program.commands.find((command: Command) => command.name() === 'package')
    const env = program.commands.find((command: Command) => command.name() === 'env')
    const verify = program.commands.find((command: Command) => command.name() === 'verify')
    const skills = program.commands.find((command: Command) => command.name() === 'skills')
    const ai = program.commands.find((command: Command) => command.name() === 'ai')
    const init = program.commands.find((command: Command) => command.name() === 'init')
    const createNew = program.commands.find((command: Command) => command.name() === 'new')
    const check = program.commands.find((command: Command) => command.name() === 'check')
    const upgrade = program.commands.find((command: Command) => command.name() === 'upgrade')
    const sync = program.commands.find((command: Command) => command.name() === 'sync')
    const clean = program.commands.find((command: Command) => command.name() === 'clean')
    const mirror = program.commands.find((command: Command) => command.name() === 'mirror')

    expect(workspace?.aliases()).toEqual(['ws'])
    expect(tooling?.aliases()).toEqual(['tg'])
    expect(packageCommand?.aliases()).toEqual(['pkg'])
    expect(env?.aliases()).toEqual(['e'])
    expect(verify?.aliases()).toEqual(['v'])
    expect(skills?.aliases()).toEqual(['sk'])
    expect(ai?.aliases()).toEqual([])
    expect(init?.aliases()).toEqual(['setup'])
    expect(createNew?.aliases()).toEqual([])
    expect(check?.aliases()).toEqual([])
    expect(upgrade?.aliases()).toEqual([])
    expect(sync?.aliases()).toEqual([])
    expect(clean?.aliases()).toEqual([])
    expect(mirror?.aliases()).toEqual([])

    expect(workspace?.helpInformation()).toContain('up')
    expect(tooling?.helpInformation()).toContain('i')
    expect(packageCommand?.helpInformation()).toContain('new')
    expect(env?.helpInformation()).toContain('m')
    expect(verify?.helpInformation()).toContain('push')
    expect(skills?.helpInformation()).toContain('s')
    expect(ai?.helpInformation()).toContain('prompt')
  })
})
