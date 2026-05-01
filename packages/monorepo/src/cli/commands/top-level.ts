import type { Command } from '@icebreakers/monorepo-templates'
import type { RecommendedCheckPlan } from '../../commands/check'
import type { DoctorReport } from '../../commands/doctor'
import type { CliOpts } from '../../types'
import process from 'node:process'
import path from 'pathe'
import pc from 'picocolors'
import { logger } from '../../core/logger'
import fs from '../../utils/fs'
import { normalizeCleanOptions, normalizeCliOpts } from '../utils'

interface CheckCliOptions {
  full?: boolean
  staged?: boolean
  editFile?: string
  dryRun?: boolean
  json?: boolean
  out?: string
}

interface InitCliOptions {
  force?: boolean
  preset?: 'minimal' | 'standard'
}

interface NewCliOptions {
  template?: string
  dryRun?: boolean
  json?: boolean
  out?: string
}

interface DoctorCliOptions {
  json?: boolean
  out?: string
}

interface CleanCliOptions {
  yes?: boolean
  includePrivate?: boolean
  pinnedVersion?: string
}

function formatDoctorStatus(status: 'pass' | 'warn' | 'fail') {
  if (status === 'pass') {
    return pc.green('PASS')
  }
  if (status === 'warn') {
    return pc.yellow('WARN')
  }
  return pc.red('FAIL')
}

function formatDoctorReport(report: DoctorReport, color = false) {
  const status = color
    ? formatDoctorStatus
    : (value: 'pass' | 'warn' | 'fail') => value.toUpperCase()

  const lines = [
    `workspace: ${report.workspaceDir}`,
    `packages: ${report.packageCount}`,
    '',
  ]

  for (const check of report.checks) {
    lines.push(`[${status(check.status)}] ${check.title}`)
    lines.push(`  ${check.detail}`)
    if (check.fix) {
      lines.push(`  fix: ${check.fix}`)
    }
  }

  lines.push('')
  lines.push(
    color
      ? `summary: ${pc.green(String(report.summary.pass))} pass, ${pc.yellow(String(report.summary.warn))} warn, ${pc.red(String(report.summary.fail))} fail`
      : `summary: ${report.summary.pass} pass, ${report.summary.warn} warn, ${report.summary.fail} fail`,
  )

  return lines.join('\n')
}

async function emitDoctorReport(report: DoctorReport, opts: DoctorCliOptions, cwd: string) {
  const content = opts.json
    ? JSON.stringify(report, null, 2)
    : formatDoctorReport(report, !opts.out)

  if (!opts.out) {
    logger.log(content)
    return
  }

  const outFile = path.resolve(cwd, opts.out)
  await fs.outputFile(outFile, `${content}\n`, 'utf8')
  logger.success(`wrote ${path.relative(cwd, outFile)}`)
}

function formatCheckPlan(plan: RecommendedCheckPlan) {
  const lines = [
    `cwd: ${plan.cwd}`,
    `mode: ${plan.mode}`,
    '',
  ]

  for (const command of plan.commands) {
    lines.push(`- ${command.command}`)
    lines.push(`  ${command.description}`)
  }

  return lines.join('\n')
}

async function emitCheckPlan(plan: RecommendedCheckPlan, opts: CheckCliOptions, cwd: string) {
  const content = opts.json
    ? JSON.stringify(plan, null, 2)
    : formatCheckPlan(plan)

  if (!opts.out) {
    logger.log(content)
    return
  }

  const outFile = path.resolve(cwd, opts.out)
  await fs.outputFile(outFile, `${content}\n`, 'utf8')
  logger.success(`wrote ${path.relative(cwd, outFile)}`)
}

export function registerTopLevelCommands(program: Command, cwd: string) {
  program.command('init')
    .description('初始化当前 workspace，并生成推荐配置')
    .alias('setup')
    .option('--preset <preset>', '初始化预设：minimal / standard', 'standard')
    .option('-f, --force', '覆盖已存在的 tooling 配置文件')
    .action(async (opts: InitCliOptions) => {
      const { init } = await import('@/commands')
      await init(cwd, {
        ...(opts.preset !== undefined ? { preset: opts.preset } : {}),
        ...(opts.force !== undefined ? { force: opts.force } : {}),
      })
      logger.success('init finished!')
      logger.info('next: run `pnpm install` and `pnpm build`')
    })

  program.command('new')
    .description('创建新的 package / app')
    .argument('[name]')
    .option('-t, --template <template>', '直接使用指定模板，跳过模板选择')
    .option('--dry-run', '预览将要创建的目录与 package 信息，不写入文件')
    .option('--json', '以 JSON 输出创建预览，隐含 --dry-run')
    .option('--out <file>', '把创建预览写入文件，隐含 --dry-run')
    .action(async (inputName: string, opts: NewCliOptions) => {
      const { runCreateFlow } = await import('@/cli/commands/package/create-flow')
      const result = await runCreateFlow(cwd, inputName, {
        ...(opts.template !== undefined ? { template: opts.template } : {}),
        ...(opts.dryRun || opts.json || opts.out ? { dryRun: true } : {}),
        ...(opts.json ? { json: true } : {}),
        ...(opts.out !== undefined ? { out: opts.out } : {}),
      })
      if (result.dryRun || result.failed) {
        return
      }
      logger.success('new finished!')
      logger.info('next: run `pnpm install` and start the new workspace package')
    })

  program.command('check')
    .description('执行推荐的本地校验')
    .option('--full', '执行完整校验')
    .option('--staged', '仅执行 staged 相关校验')
    .option('--edit-file <file>', '执行 commit message 校验')
    .option('--dry-run', '预览将要执行的校验，不实际运行')
    .option('--json', '以 JSON 输出校验计划，隐含 --dry-run')
    .option('--out <file>', '把校验计划写入文件，隐含 --dry-run')
    .action(async (opts: CheckCliOptions) => {
      const options = {
        cwd,
        ...(opts.full !== undefined ? { full: opts.full } : {}),
        ...(opts.staged !== undefined ? { staged: opts.staged } : {}),
        ...(opts.editFile !== undefined ? { editFile: opts.editFile } : {}),
      }
      const { resolveRecommendedCheckPlan, runRecommendedCheck } = await import('@/commands')
      if (opts.dryRun || opts.json || opts.out) {
        await emitCheckPlan(resolveRecommendedCheckPlan(options), opts, cwd)
        return
      }
      await runRecommendedCheck(options)
      logger.success('check finished!')
    })

  program.command('doctor')
    .description('诊断当前仓库是否适合直接开始使用')
    .option('--json', '输出 JSON 报告，方便 CI 或脚本消费')
    .option('--out <file>', '把诊断报告写入文件')
    .action(async (opts: DoctorCliOptions) => {
      const { runDoctor } = await import('@/commands')
      const report = await runDoctor(cwd)
      await emitDoctorReport(report, opts, cwd)
      if (opts.out || opts.json) {
        if (report.summary.fail > 0) {
          process.exitCode = 1
        }
        return
      }

      if (report.summary.fail > 0) {
        logger.error(`doctor found ${report.summary.fail} blocking issue(s).`)
        process.exitCode = 1
        return
      }

      if (report.summary.warn > 0) {
        logger.warn(`doctor found ${report.summary.warn} suggestion(s).`)
      }
      logger.success('doctor finished!')
    })

  program.command('upgrade')
    .description('同步仓库标准资产与脚本')
    .option('-i,--interactive')
    .option('-c,--core', '仅同步核心配置，跳过 GitHub 相关资产')
    .option('--outDir <dir>', 'Output directory')
    .option('-s,--skip-overwrite', 'skip overwrite')
    .action(async (opts: CliOpts) => {
      const { upgradeMonorepo } = await import('@/commands')
      await upgradeMonorepo(normalizeCliOpts(cwd, opts))
      logger.success('upgrade finished!')
    })

  program.command('sync')
    .description('兼容入口：同步仓库标准资产与脚本')
    .option('-i,--interactive')
    .option('-c,--core', '仅同步核心配置，跳过 GitHub 相关资产')
    .option('--outDir <dir>', 'Output directory')
    .option('-s,--skip-overwrite', 'skip overwrite')
    .action(async (opts: CliOpts) => {
      const { upgradeMonorepo } = await import('@/commands')
      await upgradeMonorepo(normalizeCliOpts(cwd, opts))
      logger.success('sync finished!')
    })

  program.command('clean')
    .description('兼容入口：清理选中的 workspace 包')
    .option('-y, --yes', '跳过交互直接清理（等价 autoConfirm）')
    .option('--include-private', '包含 private 包')
    .option('--pinned-version <version>', '覆盖写入的 @icebreakers/monorepo 版本')
    .action(async (opts: CleanCliOptions) => {
      const { cleanProjects } = await import('@/commands')
      await cleanProjects(cwd, normalizeCleanOptions(opts))
      logger.success('clean finished!')
    })

  program.command('mirror')
    .description('兼容入口：设置 VS Code binary mirror')
    .action(async () => {
      const { setVscodeBinaryMirror } = await import('@/commands')
      await setVscodeBinaryMirror(cwd)
      logger.success('mirror finished!')
    })
}
