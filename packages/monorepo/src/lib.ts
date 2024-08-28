import { fileURLToPath } from 'node:url'
import process from 'node:process'
import path from 'pathe'
import fs from 'fs-extra'
import type { PackageJson } from 'pkg-types'
import get from 'get-value'
import set from 'set-value'
import klaw from 'klaw'
import PQueue from 'p-queue'
import checkbox from '@inquirer/checkbox'
import { logger } from './logger'
import { escapeStringRegexp, isMatch } from './utils'
import { GitClient } from './git'
import type { CliOpts } from './types'
import { getTargets } from './targets'

// const controller = new AbortController()

const queue = new PQueue({ concurrency: 1 })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// import.meta.dirname for Nodejs >= v20.11.0
// https://nodejs.org/api/esm.html#importmetadirname
const assetsDir = path.join(__dirname, '../assets')
const cwd = process.cwd()

export async function main(opts: CliOpts) {
  const { outDir = '', raw, interactive } = opts
  const absOutDir = path.isAbsolute(outDir) ? outDir : path.join(cwd, outDir)
  const gitClient = new GitClient({
    baseDir: cwd,
  })
  const repoName = await gitClient.getRepoName()
  let targets = getTargets(raw)

  if (interactive) {
    targets = await checkbox({
      message: '选择你需要的文件',
      choices: targets.map((x) => {
        return {
          value: x,
          checked: true,
        }
      }),
    })
  }

  const regexpArr = targets.map((x) => {
    return new RegExp(`^${escapeStringRegexp(x)}`)
  })
  for await (const file of klaw(assetsDir, {
    filter(p) {
      const str = path.relative(assetsDir, p)
      return isMatch(str, regexpArr)
    },
  })) {
    await queue.add(async () => {
      if (file.stats.isFile()) {
        const relPath = path.relative(assetsDir, file.path)
        const targetPath = path.resolve(absOutDir, relPath)
        // const basename = path.basename(file.path)
        if (relPath === 'package.json') {
          const sourcePath = file.path
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
            logger.success(targetPath)
          }
        }
        else if (relPath === '.changeset/config.json' && repoName && await fs.exists(file.path)) {
          const changesetJson = await fs.readJson(file.path)
          set(changesetJson, 'changelog.1.repo', repoName)
          await fs.ensureDir(path.dirname(targetPath))
          await fs.writeJson(targetPath, changesetJson, {
            spaces: 2,
          })
          logger.success(targetPath)
        }
        else if (relPath === 'Dockerfile' && !(await fs.exists(targetPath))) {
          await fs.copy(
            file.path,
            targetPath,
          )
          logger.success(targetPath)
        }
        else {
          await fs.copy(
            file.path,
            targetPath,
          )
          logger.success(targetPath)
        }
      }
    })
  }
}
