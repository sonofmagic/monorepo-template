import process from 'node:process'
import fs from 'fs-extra'
import path from 'pathe'
import set from 'set-value'
import type { PackageJson } from 'pkg-types'
import { getWorkspacePackages } from './utils'
import { GitClient } from './git'

export default async function () {
  const cwd = process.cwd()
  const git = new GitClient()
  const gitUrl = await git.getGitUrl()
  const workspaceFilepath = path.resolve(import.meta.dirname, '../pnpm-workspace.yaml')
  if (gitUrl && await fs.exists(workspaceFilepath)) {
    const projects = await getWorkspacePackages(cwd)
    for (const project of projects) {
      const pkgJson = project.pkgJson
      const directory = path.relative(cwd, project.rootDir)
      set(pkgJson, 'bugs.url', `https://github.com/${gitUrl.full_name}/issues`)
      const repository: PackageJson['repository'] = {
        type: 'git',
        url: `git+https://github.com/${gitUrl.full_name}.git`,
      }
      if (directory) {
        repository.directory = directory
      }
      set(pkgJson, 'repository', repository)
      await fs.writeJSON(project.pkgJsonPath, pkgJson, {
        spaces: 2,
      })
    }
  }
}
