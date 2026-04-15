import type { GetWorkspacePackagesOptions, WorkspaceData, WorkspacePackageWithJsonPath } from '../types'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { findWorkspacePackages } from '@pnpm/workspace.find-packages'
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest'
import { defu } from 'defu'
import path from 'pathe'

export type { GetWorkspacePackagesOptions } from '../types'

/**
 * 读取 pnpm workspace 下的所有包，并根据选项做过滤。
 *
 * 默认值：
 * - `ignoreRootPackage`: `true`
 * - `ignorePrivatePackage`: `true`
 *
 * @param workspaceDir workspace 根目录
 * @param options 过滤选项
 * @returns 带有 `pkgJsonPath` 字段的 workspace package 列表
 */
export async function getWorkspacePackages(
  workspaceDir: string,
  options?: GetWorkspacePackagesOptions,
): Promise<WorkspacePackageWithJsonPath[]> {
  const { ignoreRootPackage, ignorePrivatePackage, patterns } = defu<GetWorkspacePackagesOptions, GetWorkspacePackagesOptions[]>(options, {
    ignoreRootPackage: true,
    ignorePrivatePackage: true,
  })

  const manifest = await readWorkspaceManifest(workspaceDir)
  const workspacePatterns = patterns ?? manifest?.packages
  const packages = await findWorkspacePackages(
    workspaceDir,
    workspacePatterns ? { patterns: workspacePatterns } : {},
  )
  let pkgs: WorkspacePackageWithJsonPath[] = packages.filter((x) => {
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
 * 一次性返回 `cwd`、真实 `workspaceDir` 与过滤后的包列表。
 *
 * @param cwd 当前工作目录
 * @param options 传给 `getWorkspacePackages()` 的过滤选项
 */
export async function getWorkspaceData(cwd: string, options?: GetWorkspacePackagesOptions): Promise<WorkspaceData> {
  const workspaceDir = (await findWorkspaceDir(cwd)) ?? cwd
  const packages = await getWorkspacePackages(workspaceDir, options)
  return {
    cwd,
    workspaceDir,
    packages,
  }
}
