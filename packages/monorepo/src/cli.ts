import { fileURLToPath } from 'node:url'
import process from 'node:process'
import path from 'pathe'
import fs from 'fs-extra'
import type { PackageJson } from 'pkg-types'
import get from 'get-value'
import set from 'set-value'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const assetsDir = path.join(__dirname, './assets')
const cwd = process.cwd()

async function main() {
  const list = await fs.readdir(assetsDir)
  for (const item of list) {
    if (item === 'package.json') {
      const sourcePath = path.resolve(assetsDir, item)
      const targetPath = path.resolve(cwd, item)
      if (await fs.exists(targetPath) && await fs.exists(sourcePath)) {
        const sourcePkgJson = await fs.readJson(sourcePath) as PackageJson
        const targetPkgJson = await fs.readJson(targetPath) as PackageJson

        const deps = get(sourcePkgJson, 'dependencies', { default: {} })
        const devDeps = get(sourcePkgJson, 'devDependencies', { default: {} })

        Object.entries(deps).forEach((x) => {
          set(targetPkgJson, `dependencies.${x[0]}`, x[1], { preservePaths: false })
        })
        Object.entries(devDeps).forEach((x) => {
          set(targetPkgJson, `devDependencies.${x[0]}`, x[1], { preservePaths: false })
        })
        await fs.writeJson(targetPath, targetPkgJson, {
          spaces: 2,
        })
      }
    }
    else {
      await fs.copy(
        path.resolve(assetsDir, item),
        path.resolve(cwd, item),
      )
    }
  }
}

main().then(() => {
  console.log('@icebreakers/monorepo ok!')
})
