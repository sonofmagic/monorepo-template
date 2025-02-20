import { findWorkspacePackages } from '@pnpm/workspace.find-packages'
import { defu } from 'defu'
import path from 'pathe'

export interface GetWorkspacePackagesOptions {
  ignoreRootPackage?: boolean
  ignorePrivatePackage?: boolean
  patterns?: string[]
}

export async function getWorkspacePackages(cwd: string, options?: GetWorkspacePackagesOptions) {
  const posixCwd = path.normalize(cwd)
  const { ignoreRootPackage, ignorePrivatePackage, patterns } = defu<GetWorkspacePackagesOptions, GetWorkspacePackagesOptions[]>(options, {
    ignoreRootPackage: true,
    ignorePrivatePackage: true,
  })
  const packages = await findWorkspacePackages(cwd, {
    patterns,
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
      return path
        .normalize(
          x.rootDir,
        ) !== posixCwd
    })
  }
  return pkgs
}
