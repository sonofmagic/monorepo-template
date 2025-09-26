import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { findWorkspacePackages } from '@pnpm/workspace.find-packages'
import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest'
import { defu } from 'defu'
import path from 'pathe'

export interface GetWorkspacePackagesOptions {
  ignoreRootPackage?: boolean
  ignorePrivatePackage?: boolean
  patterns?: string[]
}

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

export async function getWorkspaceData(cwd: string, options?: GetWorkspacePackagesOptions) {
  const workspaceDir = (await findWorkspaceDir(cwd)) ?? cwd
  const packages = await getWorkspacePackages(workspaceDir, options)
  return {
    cwd,
    workspaceDir,
    packages,
  }
}
