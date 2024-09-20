import path from 'pathe'
import { rimraf } from 'rimraf'

const dirs = [
  'packages/monorepo',
  'packages/foo',
  // 'apps/cli',
  // 'apps/website',
  'apps',
]

export async function cleanProjects(cwd: string) {
  await rimraf(dirs.map((x) => {
    return path.resolve(cwd, x)
  }))
}
