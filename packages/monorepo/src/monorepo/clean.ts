import fs from 'fs-extra'
import path from 'pathe'

const dirs = [
  'packages/monorepo',
  'packages/foo',
  // 'apps/cli',
  // 'apps/website',
  'apps',
]

export async function cleanProjects(cwd: string) {
  for (const dir of dirs.map((x) => {
    return path.resolve(cwd, x)
  })) {
    await fs.remove(dir)
  }
}
