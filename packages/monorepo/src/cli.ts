import { program } from 'commander'
import { name, version } from '../package.json'
import type { CliOpts } from './types'
import { main } from './index'

program.name(name).version(version)

program
  .option('-i,--interactive')
  .option('--raw', 'raw mode')
  .option('--outDir <dir>', 'Output directory')
  .action(async (opts: CliOpts) => {
    await main(opts)
    console.log('upgrade @icebreakers/monorepo ok!')
  })

program.parse()
