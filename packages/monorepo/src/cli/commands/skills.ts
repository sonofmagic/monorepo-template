import type { Command } from '@icebreakers/monorepo-templates'
import type { SkillTarget } from '../../commands'
import { skillTargets, syncSkills } from '../../commands'
import { logger } from '../../core/logger'

interface SkillsSyncCommandOptions {
  codex?: boolean
  claude?: boolean
  all?: boolean
}

export function registerSkillsCommands(program: Command, cwd: string) {
  const skillsCommand = program.command('skills').alias('sk').description('技能工具集')

  skillsCommand.command('sync')
    .description('同步 resources/skills/icebreakers-monorepo-cli 到全局目录')
    .alias('s')
    .option('--codex', '同步到 ~/.codex/skills')
    .option('--claude', '同步到 ~/.claude/skills')
    .option('--all', '同步全部目标')
    .action(async (opts: SkillsSyncCommandOptions) => {
      const selected = new Set<SkillTarget>()
      if (opts.all) {
        for (const target of skillTargets) {
          selected.add(target)
        }
      }
      else {
        if (opts.codex) {
          selected.add('codex')
        }
        if (opts.claude) {
          selected.add('claude')
        }
      }

      const options = selected.size
        ? { cwd, targets: [...selected] }
        : { cwd }
      const results = await syncSkills(options)
      if (!results.length) {
        logger.info('未选择任何目标，已跳过同步。')
        return
      }
      logger.info(`[已同步的目标]:\n${results.map(item => `- ${item.target}: ${item.dest}`).join('\n')}\n`)
      logger.success('skills sync finished!')
    })
}
