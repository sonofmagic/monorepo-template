import { findWorkspacePackages } from '@pnpm/workspace.find-packages'
import { defu } from 'defu'
import path from 'pathe'

export interface GetWorkspacePackagesOptions {
  ignoreRootPackage?: boolean
}

export async function getWorkspacePackages(cwd: string, options?: GetWorkspacePackagesOptions) {
  const posixCwd = path.normalize(cwd)
  const { ignoreRootPackage } = defu<GetWorkspacePackagesOptions, GetWorkspacePackagesOptions[]>(options, {
    ignoreRootPackage: true,
  })
  const packages = await findWorkspacePackages(cwd)
  let pkgs = packages.map((project) => {
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
