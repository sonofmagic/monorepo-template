import checkbox from '@inquirer/checkbox'
import fs from 'fs-extra'
import path from 'pathe'
import set from 'set-value'
import { getWorkspaceData } from './workspace'

export async function cleanProjects(cwd: string) {
  const { packages, workspaceDir } = await getWorkspaceData(cwd)

  const cleanDirs = await checkbox<string>({
    message: '请选择需要清理的目录',
    choices: packages.map((x) => {
      return {
        name: path.relative(workspaceDir, x.rootDir),
        value: x.rootDir,
        checked: true,
        description: x.manifest.name,
      }
    }),
  })

  for (const dir of cleanDirs) {
    await fs.remove(dir)
  }
  const name = path.resolve(workspaceDir, 'package.json')
  const pkgJson = await fs.readJson(name)
  // fix https://github.com/sonofmagic/monorepo-template/issues/76
  set(pkgJson, 'devDependencies.@icebreakers/monorepo', 'latest', { preservePaths: false })
  await fs.outputJson(name, pkgJson, {
    spaces: 2,
  })
}
