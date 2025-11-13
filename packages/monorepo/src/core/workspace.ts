import type { GetWorkspacePackagesOptions } from '../types'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { findWorkspacePackages } from '@pnpm/workspace.find-packages'
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest'
import { defu } from 'defu'
import path from 'pathe'

export type { GetWorkspacePackagesOptions } from '../types'

/**
 * 读取 pnpm workspace 下的所有包，并根据配置过滤与补充字段。
 */
export async function getWorkspacePackages(workspaceDir: string, options?: GetWorkspacePackagesOptions) {
  const { ignoreRootPackage, ignorePrivatePackage, patterns } = defu<GetWorkspacePackagesOptions, GetWorkspacePackagesOptions[]>(options, {
    ignoreRootPackage: true,
    ignorePrivatePackage: true,
  })

  const manifest = await readWorkspaceManifest(workspaceDir)
  const packages = await findWorkspacePackages(workspaceDir, {
    patterns: patterns ?? manifest?.packages,
  })
  let pkgs = packages.filter((x) => {
    if (ignorePrivatePackage && x.manifest.private) {
      return false
    }
    return true
  }).map((project) => {
    const pkgJsonPath = path.resolve(project.rootDir, 'package.json')
    return {
      ...project,
      pkgJsonPath,
    }
  })

  if (ignoreRootPackage) {
    pkgs = pkgs.filter((x) => {
      return x.rootDir !== workspaceDir
    })
  }
  return pkgs
}

/**
 * 将工作区绝对路径、包列表与当前 cwd 打包返回，方便调用方一次获取所有信息。
 */
export async function getWorkspaceData(cwd: string, options?: GetWorkspacePackagesOptions) {
  const workspaceDir = (await findWorkspaceDir(cwd)) ?? cwd
  const packages = await getWorkspacePackages(workspaceDir, options)
  return {
    cwd,
    workspaceDir,
    packages,
  }
}
