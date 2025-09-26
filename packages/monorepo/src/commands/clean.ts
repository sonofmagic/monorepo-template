import checkbox from '@inquirer/checkbox'
import fs from 'fs-extra'
import path from 'pathe'
import set from 'set-value'
import { resolveCommandConfig } from '../core/config'
import { getWorkspaceData } from '../core/workspace'

export async function cleanProjects(cwd: string) {
  const cleanConfig = await resolveCommandConfig('clean', cwd)
  const workspaceOptions = cleanConfig?.includePrivate ? { ignorePrivatePackage: false } : undefined
  const { packages, workspaceDir } = await getWorkspaceData(cwd, workspaceOptions)

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
    cleanDirs = filteredPackages.map(pkg => pkg.rootDir)
  }
  else {
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
  set(pkgJson, 'devDependencies.@icebreakers/monorepo', cleanConfig?.pinnedVersion ?? 'latest', { preservePaths: false })
  await fs.outputJson(name, pkgJson, {
    spaces: 2,
  })
}
