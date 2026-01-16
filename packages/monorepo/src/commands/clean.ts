import type { CleanCommandConfig } from '../types'
import checkbox from '@inquirer/checkbox'
import fs from 'fs-extra'
import path from 'pathe'
import set from 'set-value'
import { resolveCommandConfig } from '../core/config'
import { getWorkspaceData } from '../core/workspace'
import { getSkillTargetPaths } from './skills'

function mergeCleanConfig(base?: CleanCommandConfig, overrides?: Partial<CleanCommandConfig>): CleanCommandConfig {
  const normalizedBase = base ?? {}
  if (!overrides) {
    return normalizedBase
  }
  const definedOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value !== undefined),
  ) as Partial<CleanCommandConfig>
  return {
    ...normalizedBase,
    ...definedOverrides,
  }
}

/**
 * 交互式清理被选中的包目录，同时重写根 package.json 中的 @icebreakers/monorepo 版本。
 */
export async function cleanProjects(cwd: string, overrides?: Partial<CleanCommandConfig>) {
  const cleanConfig = mergeCleanConfig(await resolveCommandConfig('clean', cwd), overrides)
  const includePrivate = cleanConfig?.includePrivate ?? true
  const workspaceOptions = includePrivate ? { ignorePrivatePackage: false } : undefined
  const { packages, workspaceDir } = await getWorkspaceData(cwd, workspaceOptions)

  // 根据配置过滤需要跳过的包，默认全部参与清理。
  const filteredPackages = packages.filter((pkg) => {
    const name = pkg.manifest.name ?? ''
    if (!name) {
      return true
    }
    if (!cleanConfig?.ignorePackages?.length) {
      return true
    }
    return !cleanConfig.ignorePackages.includes(name)
  })

  let cleanDirs: string[] = []
  if (cleanConfig?.autoConfirm) {
    // 开启 autoConfirm 时跳过交互，直接删除所有候选目录。
    cleanDirs = filteredPackages.map(pkg => pkg.rootDir)
  }
  else {
    // 默认提供多选列表，开发者可灵活勾选需要清理的包。
    cleanDirs = await checkbox<string>({
      message: '请选择需要清理的目录',
      choices: filteredPackages.map((x) => {
        const baseChoice = {
          name: path.relative(workspaceDir, x.rootDir),
          value: x.rootDir,
          checked: true,
        }
        return x.manifest.name
          ? { ...baseChoice, description: x.manifest.name }
          : baseChoice
      }),
    })
  }

  const readmeZh = path.resolve(workspaceDir, 'README.zh-CN.md')
  const qoderDir = path.resolve(workspaceDir, '.qoder')
  const skillTargets = Object.values(getSkillTargetPaths())
  const candidates = Array.from(new Set([
    ...cleanDirs.filter(Boolean),
    readmeZh,
    qoderDir,
    ...skillTargets,
  ]))
  await Promise.all(candidates.map(async (dir) => {
    if (await fs.pathExists(dir)) {
      await fs.remove(dir)
    }
  }))
  const name = path.resolve(workspaceDir, 'package.json')
  const pkgJson = await fs.readJson(name)
  // fix https://github.com/sonofmagic/monorepo-template/issues/76
  // 确保根目录仍旧依赖 @icebreakers/monorepo，避免删除后被 package manager 清空。
  set(pkgJson, 'devDependencies.@icebreakers/monorepo', cleanConfig?.pinnedVersion ?? 'latest', { preservePaths: false })
  await fs.outputJson(name, pkgJson, {
    spaces: 2,
  })
}
