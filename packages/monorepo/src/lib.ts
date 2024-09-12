import type { PackageJson } from 'pkg-types'
import type { CliOpts } from './types'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import checkbox from '@inquirer/checkbox'
import fs from 'fs-extra'
import get from 'get-value'
import klaw from 'klaw'
import PQueue from 'p-queue'
import path from 'pathe'
import set from 'set-value'
import { GitClient } from '../../../scripts/monorepo/git'
import { logger } from './logger'
import { getTargets } from './targets'
import { escapeStringRegexp, isMatch } from './utils'

// const controller = new AbortController()

const queue = new PQueue({ concurrency: 1 })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// import.meta.dirname for Nodejs >= v20.11.0
// https://nodejs.org/api/esm.html#importmetadirname
const assetsDir = path.join(__dirname, '../assets')
const cwd = process.cwd()

const scripts = {
  'script:init': 'tsx scripts/monorepo/init.ts',
  'script:sync': 'tsx scripts/monorepo/sync.ts',
  'script:clean': 'tsx scripts/monorepo/clean.ts',
}

const scriptsEntries = Object.entries(scripts)

export function setPkgJson(sourcePkgJson: PackageJson, targetPkgJson: PackageJson) {
  const packageManager = get(sourcePkgJson, 'packageManager', { default: '' })
  const deps = get(sourcePkgJson, 'dependencies', { default: {} })
  const devDeps = get(sourcePkgJson, 'devDependencies', { default: {} })
  set(targetPkgJson, 'packageManager', packageManager)
  Object.entries(deps).forEach((x) => {
    set(targetPkgJson, `dependencies.${x[0].replaceAll('.', '\\.')}`, x[1], { preservePaths: false })
  })
  Object.entries(devDeps).forEach((x) => {
    set(targetPkgJson, `devDependencies.${x[0].replaceAll('.', '\\.')}`, x[1], { preservePaths: false })
  })
  for (const [k, v] of scriptsEntries) {
    set(targetPkgJson, `scripts.${k}`, v)
  }
}

export async function main(opts: CliOpts) {
  const { outDir = '', raw, interactive } = opts
  const absOutDir = path.isAbsolute(outDir) ? outDir : path.join(cwd, outDir)
  const gitClient = new GitClient({
    baseDir: cwd,
  })
  const repoName = await gitClient.getRepoName()
  let targets = getTargets(raw)

  if (interactive) {
    // https://github.com/pnpm/pnpm/blob/db420ab592666dbae77fdda3f5c04ed2c045846d/pkg-manager/plugin-commands-installation/src/update/index.ts
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

  const removeDirs = ['scripts/monorepo']
  for (const dir of removeDirs) {
    if (targets.includes(dir)) {
      await fs.remove(path.resolve(absOutDir, dir))
    }
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
            setPkgJson(sourcePkgJson, targetPkgJson)
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
