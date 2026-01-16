import fs from 'node:fs/promises'
import path from 'node:path'

interface PackageJsonLike {
  name?: string
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
  [key: string]: unknown
}

export async function updateRootPackageJson(targetDir: string, projectName: string) {
  const pkgPath = path.join(targetDir, 'package.json')
  const raw = await fs.readFile(pkgPath, 'utf8')
  const pkg = JSON.parse(raw) as PackageJsonLike
  pkg.name = projectName

  const devDependencies = pkg.devDependencies
  if (devDependencies && devDependencies['@icebreakers/monorepo']) {
    delete devDependencies['@icebreakers/monorepo']
    if (Object.keys(devDependencies).length === 0) {
      delete pkg.devDependencies
    }
  }

  const scripts = pkg.scripts
  if (scripts) {
    const nextScripts: Record<string, string> = {}
    for (const [key, value] of Object.entries(scripts)) {
      if (typeof value === 'string' && value.includes('monorepo')) {
        continue
      }
      nextScripts[key] = value
    }
    if (Object.keys(nextScripts).length) {
      pkg.scripts = nextScripts
    }
    else {
      delete pkg.scripts
    }
  }

  await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
}
