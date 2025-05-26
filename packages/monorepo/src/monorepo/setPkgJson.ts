import type { Context } from './context'
import type { PackageJson } from '@/types'
import fs from 'fs-extra'
import path from 'pathe'
import set from 'set-value'

export default async function (ctx: Context) {
  const { gitUrl, gitUser, projects, cwd, workspaceFilepath } = ctx

  if (gitUrl && await fs.exists(workspaceFilepath)) {
    for (const project of projects) {
      const pkgJson = project.manifest
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
      if (gitUser) {
        set(pkgJson, 'author', `${gitUser.name} <${gitUser.email}>`)
      }

      // "maintainers": [
      //   "xxx <xxx@gmail.com> (url)",
      // ],
      await fs.writeJSON(project.pkgJsonPath, pkgJson, {
        spaces: 2,
      })
    }
  }
}
