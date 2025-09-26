import checkbox from '@inquirer/checkbox'
import fs from 'fs-extra'
import path from 'pathe'
import set from 'set-value'
import { resolveCommandConfig } from '../core/config'
import { getWorkspaceData } from '../core/workspace'

/**
 * 交互式清理被选中的包目录，同时重写根 package.json 中的 @icebreakers/monorepo 版本。
 */
export async function cleanProjects(cwd: string) {
  const cleanConfig = await resolveCommandConfig('clean', cwd)
  const workspaceOptions = cleanConfig?.includePrivate ? { ignorePrivatePackage: false } : undefined
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
        return {
          name: path.relative(workspaceDir, x.rootDir),
          value: x.rootDir,
          checked: true,
          description: x.manifest.name,
        }
      }),
    })
  }

  const candidates = Array.from(new Set(cleanDirs.filter(Boolean)))
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
