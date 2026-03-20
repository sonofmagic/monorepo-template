import os from 'node:os'
import process from 'node:process'
import { checkbox } from '@icebreakers/monorepo-templates'
import path from 'pathe'
import fs from '@/utils/fs'
import { packageDir } from '../constants'

/**
 * 内置 skills 目录名称。
 */
export const skillName = 'icebreakers-monorepo-cli'
/**
 * 当前支持的 skills 同步目标。
 */
export const skillTargets = ['codex', 'claude'] as const
/**
 * 包内 skills 模板源目录。
 */
export const skillSourceDir = path.join(packageDir, 'resources', 'skills', skillName)

export type SkillTarget = typeof skillTargets[number]

export interface SyncSkillsOptions {
  /**
   * 当前工作目录。
   * 仅用于生成更友好的错误提示。
   * @default process.cwd()
   */
  cwd?: string
  /**
   * 需要同步的目标列表。
   * 未提供时会在 CLI 中交互选择。
   * @default undefined
   */
  targets?: SkillTarget[]
}

/**
 * 计算各个目标平台的 skills 安装路径。
 *
 * @param homeDir 用户 home 目录，默认取 `os.homedir()`
 */
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
  return [...new Set(values)]
}

/**
 * 将内置 skills 同步到一个或多个目标平台目录。
 *
 * @param options 同步选项
 * @returns 成功同步的目标及落盘路径列表
 */
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
