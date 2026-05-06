import { describe, expect, it } from 'vitest'
import { assetsDir, templatesDir } from '@/constants'
import fs from '@/utils/fs'

const forbiddenExamplePackagePattern = /@icebreakers\/(?:foo|bar)/
const generatedTextExtensions = new Set([
  '.json',
  '.jsonc',
  '.js',
  '.mjs',
  '.ts',
  '.mts',
  '.md',
  '',
])

async function collectTextFiles(rootDir: string) {
  const files: string[] = []

  async function walk(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true })
    await Promise.all(entries.map(async (entry) => {
      const entryPath = `${currentDir}/${entry.name}`
      if (entry.isDirectory()) {
        await walk(entryPath)
        return
      }
      if (entry.isFile()) {
        files.push(entryPath)
      }
    }))
  }

  await walk(rootDir)
  return files
}

describe('generated template quality', () => {
  it('does not ship hard-coded example package names', async () => {
    const files = await collectTextFiles(templatesDir)
    const matches: string[] = []

    for (const file of files) {
      if (!generatedTextExtensions.has(file.slice(file.lastIndexOf('.')))) {
        continue
      }
      const content = await fs.readFile(file, 'utf8')
      if (forbiddenExamplePackagePattern.test(content)) {
        matches.push(file)
      }
    }

    expect(matches).toEqual([])
  })

  it('does not include source-repo-only tooling loader in generated upgrade targets', async () => {
    const assetTargets = await collectTextFiles(assetsDir)
    expect(assetTargets.some(file => file.includes('/tooling/load-tooling-module.mjs'))).toBe(false)
  })
})
