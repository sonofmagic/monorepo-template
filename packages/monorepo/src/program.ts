import type { CliOpts } from './types'
import process from 'node:process'
import { program } from 'commander'
import { name, version } from '../package.json'
import { main } from './index'
import { logger } from './logger'
import { cleanProjects, init, setVscodeBinaryMirror, syncNpmMirror } from './monorepo'

const cwd = process.cwd()

program.name(name).version(version)

program
  .option('-i,--interactive')
  .option('--raw', 'raw mode')
  .option('--outDir <dir>', 'Output directory')
  .action(async (opts: CliOpts) => {
    await main(opts)
    logger.success('upgrade @icebreakers/monorepo ok!')
  })

program.command('init').action(() => {
  init(cwd)
})

program.command('sync').action(() => {
  syncNpmMirror(cwd)
})

program.command('clean').action(() => {
  cleanProjects(cwd)
})

program.command('mirror').action(() => {
  setVscodeBinaryMirror(cwd)
})

export default program
