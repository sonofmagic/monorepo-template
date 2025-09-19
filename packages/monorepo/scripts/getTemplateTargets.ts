import path from 'node:path'
import { simpleGit } from 'simple-git'
import { rootDir } from '../src/constants'
import { fromMap } from '../src/monorepo/create'

export async function getTemplateTargets() {
  async function getTrackedFilesInDir(dir: string) {
    const git = simpleGit(rootDir)
    const result = await git.raw(['ls-files', dir])
    return result.split('\n').filter(Boolean)
  }

  return Promise.all(
    Object.keys(fromMap).map((x) => {
      return getTrackedFilesInDir(path.resolve(rootDir, x))
    }),
  ).then(x => x.flat(1))
}
