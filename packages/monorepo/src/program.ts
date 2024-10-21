import type { CliOpts } from './types'
import process from 'node:process'
import { program } from 'commander'
import { name, version } from './constants'
import { createNewProject } from './create'
import { logger } from './logger'
import { cleanProjects, init, setVscodeBinaryMirror, syncNpmMirror } from './monorepo'
import { upgradeMonorepo } from './upgrade'

const cwd = process.cwd()

program.name(name).version(version)

program
  .option('-i,--interactive')
  .option('--raw', 'raw mode')
  .option('--outDir <dir>', 'Output directory')
  .action(async (opts: CliOpts) => {
    await upgradeMonorepo(opts)
    logger.success('upgrade @icebreakers/monorepo ok!')
  })

program.command('init').action(async () => {
  await init(cwd)
  logger.success('init finished!')
})

program.command('sync').action(async () => {
  await syncNpmMirror(cwd)
  logger.success('sync npm mirror finished!')
})

program.command('clean').action(async () => {
  await cleanProjects(cwd)
  logger.success('clean projects finished!')
})

program.command('mirror').action(async () => {
  await setVscodeBinaryMirror(cwd)
  logger.success('set vscode binary mirror finished!')
})

program.command('new')
  .alias('create')
  .argument('[name]')
  .action(async (name: string) => {
    await createNewProject({
      name,
      cwd,
    })
    logger.success('create a package')
  })

export default program
