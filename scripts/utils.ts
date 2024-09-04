import { findWorkspacePackages } from '@pnpm/workspace.find-packages'
import path from 'pathe'
import type { PackageJson } from 'pkg-types'
import fs from 'fs-extra'

export async function getWorkspacePackages(cwd: string) {
  const packages = await findWorkspacePackages(cwd)
  return (
    await Promise.allSettled(packages.map(async (project) => {
      const pkgJsonPath = path.resolve(project.rootDir, 'package.json')
      const pkgJson: PackageJson = await fs.readJSON(pkgJsonPath)
      return {
        ...project,
        pkgJson,
        pkgJsonPath,
      }
    }))
  )
    .filter((x) => {
      return x.status === 'fulfilled'
    }).map((x) => {
      return x.value
    })
}
