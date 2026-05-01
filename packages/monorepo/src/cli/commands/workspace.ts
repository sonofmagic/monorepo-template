import type { Command } from '@icebreakers/monorepo-templates'
import type { CliOpts, WorkspacePackageSummaryData } from '../../types'
import process from 'node:process'
import path from 'pathe'
import { logger } from '../../core/logger'
import fs from '../../utils/fs'
import { normalizeCleanOptions, normalizeCliOpts } from '../utils'

interface WorkspaceListCliOptions {
  json?: boolean
  includePrivate?: boolean
  includeRoot?: boolean
  pattern?: string[]
  out?: string
}

interface WorkspaceCleanCliOptions {
  yes?: boolean
  includePrivate?: boolean
  pinnedVersion?: string
}

function collectValues(value: string, previous: string[] = []) {
  return [...previous, value]
}

function formatWorkspaceList(result: WorkspacePackageSummaryData) {
  const lines = [
    `workspace: ${result.workspaceDir}`,
    `packages: ${result.packages.length}`,
  ]

  for (const pkg of result.packages) {
    const name = pkg.name ?? '(unnamed)'
    const privateMark = pkg.private ? ' private' : ''
    lines.push(`- ${name} ${pkg.relativeDir}${privateMark}`)
  }

  return lines.join('\n')
}

async function emitWorkspaceList(result: WorkspacePackageSummaryData, opts: WorkspaceListCliOptions) {
  const content = opts.json
    ? JSON.stringify(result, null, 2)
    : formatWorkspaceList(result)

  if (!opts.out) {
    logger.log(content)
    return
  }

  const outFile = path.resolve(process.cwd(), opts.out)
  await fs.outputFile(outFile, `${content}\n`, 'utf8')
  logger.success(`wrote ${path.relative(process.cwd(), outFile)}`)
}

export function registerWorkspaceCommands(program: Command, cwd: string) {
  const workspaceCommand = program.command('workspace').alias('ws').description('工作区命令')

  workspaceCommand.command('upgrade')
    .description('升级/同步 monorepo 相关包')
    .alias('up')
    .option('-i,--interactive')
    .option('-c,--core', '仅同步核心配置，跳过 GitHub 相关资产')
    .option('--outDir <dir>', 'Output directory')
    .option('-s,--skip-overwrite', 'skip overwrite')
    .action(async (opts: CliOpts) => {
      const { upgradeMonorepo } = await import('@/commands')
      await upgradeMonorepo(normalizeCliOpts(cwd, opts))
      logger.success('workspace upgrade finished!')
    })

  workspaceCommand.command('init')
    .description('初始化工作区元信息（README、package.json、changeset、issue template）')
    .alias('i')
    .action(async () => {
      const { initMetadata } = await import('@/commands')
      await initMetadata(cwd)
      logger.success('workspace init finished!')
    })

  workspaceCommand.command('list')
    .description('列出 workspace 包')
    .alias('ls')
    .option('--json', '输出 JSON')
    .option('--include-private', '包含 private 包')
    .option('--include-root', '包含 workspace 根包')
    .option('-p, --pattern <glob>', '追加自定义 workspace glob，可重复', collectValues)
    .option('--out <file>', '把当前列表输出写入文件')
    .action(async (opts: WorkspaceListCliOptions) => {
      const { getWorkspacePackageSummaries } = await import('@/core/workspace')
      const result = await getWorkspacePackageSummaries(cwd, {
        ignorePrivatePackage: !opts.includePrivate,
        ignoreRootPackage: !opts.includeRoot,
        ...(opts.pattern?.length ? { patterns: opts.pattern } : {}),
      })

      await emitWorkspaceList(result, opts)
    })

  workspaceCommand.command('clean')
    .description('清除选中的包')
    .alias('rm')
    .option('-y, --yes', '跳过交互直接清理（等价 autoConfirm）')
    .option('--include-private', '包含 private 包')
    .option('--pinned-version <version>', '覆盖写入的 @icebreakers/monorepo 版本')
    .action(async (opts: WorkspaceCleanCliOptions) => {
      const { cleanProjects } = await import('@/commands')
      await cleanProjects(cwd, normalizeCleanOptions(opts))
      logger.success('workspace clean finished!')
    })
}
