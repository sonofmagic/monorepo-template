import type { Command } from '@icebreakers/monorepo-templates'
import { verifyCommitMsg, verifyPreCommit, verifyPrePush, verifyStagedTypecheck } from '../../commands'

export function registerVerifyCommands(program: Command, cwd: string) {
  const verifyCommand = program.command('verify').alias('v').description('本地校验工具集')

  verifyCommand.command('pre-push')
    .description('按推送变更范围执行 build/test/tsd 校验')
    .alias('push')
    .action(async () => {
      await verifyPrePush({ cwd })
    })

  verifyCommand.command('pre-commit')
    .description('执行 lint-staged 校验')
    .alias('commit')
    .action(async () => {
      await verifyPreCommit({ cwd })
    })

  verifyCommand.command('commit-msg')
    .description('执行 commitlint 校验')
    .alias('msg')
    .argument('<edit-file>')
    .action(async (editFile: string) => {
      await verifyCommitMsg({ cwd, editFile })
    })

  verifyCommand.command('staged-typecheck')
    .description('按暂存文件所在 workspace 执行 typecheck')
    .alias('tc')
    .argument('[files...]')
    .action((files: string[] = []) => {
      verifyStagedTypecheck(files, { cwd })
    })
}
