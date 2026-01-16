import fs from 'node:fs/promises'
import path from 'node:path'
import { skeletonDir, templatesDir } from '@icebreakers/monorepo-templates'
import { copyDirContents } from './fs-utils'
import { templateChoices } from './templates'

async function copySelectedTemplates(targetDir: string, selectedTemplates: string[]) {
  if (!selectedTemplates.length) {
    return
  }
  const selected = new Set(selectedTemplates)
  for (const template of templateChoices) {
    if (!selected.has(template.key)) {
      continue
    }
    const from = path.join(templatesDir, template.source)
    const to = path.join(targetDir, template.target)
    await fs.mkdir(path.dirname(to), { recursive: true })
    await fs.cp(from, to, { recursive: true })
  }
}

export async function scaffoldFromNpm(targetDir: string, selectedTemplates: string[]) {
  await copyDirContents(skeletonDir, targetDir)
  await copySelectedTemplates(targetDir, selectedTemplates)
}
