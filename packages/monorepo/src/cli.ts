import process from 'node:process'
import program from './cli/program'

// CLI 入口，解析命令行参数并执行对应子命令。
if (process.argv.length <= 2) {
  program.outputHelp()
}
else {
  program.parse()
}
