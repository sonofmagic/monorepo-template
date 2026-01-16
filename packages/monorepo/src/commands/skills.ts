import os from 'node:os'
import process from 'node:process'
import checkbox from '@inquirer/checkbox'
import fs from 'fs-extra'
import path from 'pathe'
import { packageDir } from '../constants'

export const skillName = 'icebreakers-monorepo-cli'
export const skillTargets = ['codex', 'claude'] as const
export const skillSourceDir = path.join(packageDir, 'resources', 'skills', skillName)

export type SkillTarget = typeof skillTargets[number]

export interface SyncSkillsOptions {
  cwd?: string
  targets?: SkillTarget[]
}

export function getSkillTargetPaths(homeDir = os.homedir()): Record<SkillTarget, string> {
  return {
    codex: path.join(homeDir, '.codex', 'skills', skillName),
    claude: path.join(homeDir, '.claude', 'skills', skillName),
  }
}

function normalizeTargets(values?: SkillTarget[]) {
  if (!values?.length) {
    return undefined
  }
  return Array.from(new Set(values))
}

export async function syncSkills(options: SyncSkillsOptions = {}) {
  const cwd = options.cwd ?? process.cwd()
  if (!(await fs.pathExists(skillSourceDir))) {
    const relative = path.relative(cwd, skillSourceDir)
    throw new Error(`未找到技能目录：${relative || skillSourceDir}`)
  }

  let targets = normalizeTargets(options.targets)
  if (!targets?.length) {
    const selections = await checkbox<SkillTarget>({
      message: '请选择需要同步的技能目标',
      choices: skillTargets.map(target => ({
        name: target,
        value: target,
        checked: true,
      })),
    })
    targets = normalizeTargets(selections)
  }

  if (!targets?.length) {
    return []
  }

  const targetPaths = getSkillTargetPaths()
  const results: Array<{ target: SkillTarget, dest: string }> = []

  for (const target of targets) {
    const dest = targetPaths[target]
    await fs.remove(dest)
    await fs.ensureDir(path.dirname(dest))
    await fs.copy(skillSourceDir, dest)
    results.push({ target, dest })
  }

  return results
}
