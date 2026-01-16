import fs from 'node:fs/promises'
import path from 'node:path'
import { REQUIRED_REMOVE } from './constants'
import { removeIfEmpty, removePaths } from './fs-utils'
import { templateChoices } from './templates'

async function copySelectedTemplates(templatesRoot: string, targetDir: string, selectedTemplates: string[]) {
  if (!selectedTemplates.length) {
    return
  }
  const selected = new Set(selectedTemplates)
  for (const template of templateChoices) {
    if (!selected.has(template.key)) {
      continue
    }
    const from = path.join(templatesRoot, template.source)
    const to = path.join(targetDir, template.target)
    await fs.mkdir(path.dirname(to), { recursive: true })
    await fs.cp(from, to, { recursive: true })
  }
}

export async function scaffoldFromRepo(targetDir: string, selectedTemplates: string[]) {
  const templatesRoot = path.join(targetDir, 'templates')
  await copySelectedTemplates(templatesRoot, targetDir, selectedTemplates)
  await removePaths(targetDir, [
    'templates',
    ...REQUIRED_REMOVE,
  ])
  await removeIfEmpty(path.join(targetDir, 'apps'))
  await removeIfEmpty(path.join(targetDir, 'packages'))
}
