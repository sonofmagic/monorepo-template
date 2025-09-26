import type { Context } from '../../core/context'
import type { PackageJson } from '@/types'
import fs from 'fs-extra'
import path from 'pathe'
import set from 'set-value'

/**
 * 根据当前仓库信息同步 package.json 的仓库、作者等字段。
 */
export default async function (ctx: Context) {
  const { gitUrl, gitUser, packages, cwd, workspaceFilepath } = ctx

  const workspaceExists = await fs.pathExists(workspaceFilepath)
  if (gitUrl && workspaceExists) {
    await Promise.all(packages.map(async (pkg) => {
      if (!await fs.pathExists(pkg.pkgJsonPath)) {
        return
      }

      const pkgJson = JSON.parse(JSON.stringify(pkg.manifest)) as PackageJson
      const directory = path.relative(cwd, pkg.rootDir)
      set(pkgJson, ['bugs', 'url'], `https://github.com/${gitUrl.full_name}/issues`)
      const repository: PackageJson['repository'] = {
        type: 'git',
        url: `git+https://github.com/${gitUrl.full_name}.git`,
      }
      if (directory) {
        repository.directory = directory
      }

      set(pkgJson, 'repository', repository)
      if (gitUser?.name && gitUser?.email) {
        set(pkgJson, 'author', `${gitUser.name} <${gitUser.email}>`)
      }

      const nextContent = `${JSON.stringify(pkgJson, undefined, 2)}\n`
      const prevContent = await fs.readFile(pkg.pkgJsonPath, 'utf8')
      if (prevContent !== nextContent) {
        await fs.writeFile(pkg.pkgJsonPath, nextContent, 'utf8')
      }
    }))
  }
}
