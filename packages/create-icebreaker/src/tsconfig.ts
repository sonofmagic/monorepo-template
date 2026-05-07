import fs from 'node:fs/promises'
import path from 'node:path'

interface RootTsconfig {
  extends?: string | string[]
  files?: string[]
  references?: Array<{ path: string }>
  [key: string]: unknown
}

const workspaceRoots = ['apps', 'packages', 'templates']

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath)
    return true
  }
  catch {
    return false
  }
}

async function readWorkspaceReferences(targetDir: string, workspaceRoot: string) {
  const rootDir = path.join(targetDir, workspaceRoot)
  if (!await pathExists(rootDir)) {
    return []
  }

  const entries = await fs.readdir(rootDir, { withFileTypes: true })
  const references: Array<{ path: string }> = []

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const workspaceDir = path.join(rootDir, entry.name)
    const [hasPackageJson, hasTsconfig] = await Promise.all([
      pathExists(path.join(workspaceDir, 'package.json')),
      pathExists(path.join(workspaceDir, 'tsconfig.json')),
    ])

    if (hasPackageJson && hasTsconfig) {
      references.push({ path: `./${workspaceRoot}/${entry.name}` })
    }
  }

  return references
}

export async function updateRootTsconfigReferences(targetDir: string) {
  const tsconfigPath = path.join(targetDir, 'tsconfig.json')
  const raw = await fs.readFile(tsconfigPath, 'utf8')
  const tsconfig = JSON.parse(raw) as RootTsconfig
  const references = (await Promise.all(
    workspaceRoots.map(workspaceRoot => readWorkspaceReferences(targetDir, workspaceRoot)),
  )).flat()

  tsconfig.extends = tsconfig.extends ?? 'repoctl/tsconfig.json'
  tsconfig.files = []
  tsconfig.references = references

  await fs.writeFile(tsconfigPath, `${JSON.stringify(tsconfig, null, 2)}\n`, 'utf8')
}
