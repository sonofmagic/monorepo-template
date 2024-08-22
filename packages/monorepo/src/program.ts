import { program } from 'commander'
import { name, version } from '../package.json'
import { logger } from './logger'
import type { CliOpts } from './types'
import { main } from './index'

program.name(name).version(version)

program
  .option('-i,--interactive')
  .option('--raw', 'raw mode')
  .option('--outDir <dir>', 'Output directory')
  .action(async (opts: CliOpts) => {
    await main(opts)
    logger.success('upgrade @icebreakers/monorepo ok!')
  })

export default program
