import path from 'node:path'
import { simpleGit } from 'simple-git'
import { templateMap } from '../src/commands/create'
import { rootDir } from '../src/constants'

const git = simpleGit(rootDir)
const templatePrefix = /^templates[\\/]/
async function getTrackedFilesInDir(dir: string) {
  const result = await git.raw([
    'ls-files',
    dir,
  ])
  return result.split('\n').filter(Boolean)
}
export async function getTemplateTargets() {
  return Promise.all(
    Object.values(templateMap).map((definition) => {
      const sourceDir = path.resolve(rootDir, 'templates', definition.source)
      return getTrackedFilesInDir(sourceDir)
    }),
  ).then(x => x.flat(1).map(entry => entry.replace(templatePrefix, '')))
}
