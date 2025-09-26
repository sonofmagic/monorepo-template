import path from 'node:path'
import { simpleGit } from 'simple-git'
import { templateMap } from '../src/commands/create'
import { rootDir } from '../src/constants'

const git = simpleGit(rootDir)
async function getTrackedFilesInDir(dir: string) {
  const result = await git.raw([
    'ls-files',
    dir,
  ])
  return result.split('\n').filter(Boolean)
}
export async function getTemplateTargets() {
  return Promise.all(
    Object.values(templateMap).map((x) => {
      return getTrackedFilesInDir(path.resolve(rootDir, x))
    }),
  ).then(x => x.flat(1))
}
