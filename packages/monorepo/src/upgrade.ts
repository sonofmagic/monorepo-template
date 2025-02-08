import type { Buffer } from 'node:buffer'
import type { CliOpts, PackageJson } from './types'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import checkbox from '@inquirer/checkbox'
import confirm from '@inquirer/confirm'
import defu from 'defu'
import fs from 'fs-extra'
import get from 'get-value'
import klaw from 'klaw'
import PQueue from 'p-queue'
import path from 'pathe'
import pc from 'picocolors'
import set from 'set-value'
import { name as pkgName, version as pkgVersion } from './constants'
import { logger } from './logger'
import { GitClient } from './monorepo/git'
import { scriptsEntries } from './scripts'
import { getAssetTargets } from './targets'
import { escapeStringRegexp, isFileChanged, isMatch } from './utils'

const queue = new PQueue({ concurrency: 1 })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// import.meta.dirname for Nodejs >= v20.11.0
// https://nodejs.org/api/esm.html#importmetadirname
const assetsDir = path.join(__dirname, '../assets')

function isWorkspace(version?: string) {
  if (typeof version === 'string') {
    return version.startsWith('workspace:')
  }
  return false
}

export function setPkgJson(sourcePkgJson: PackageJson, targetPkgJson: PackageJson) {
  const packageManager = get(sourcePkgJson, 'packageManager', { default: '' })
  const deps = get(sourcePkgJson, 'dependencies', { default: {} })
  const devDeps = get(sourcePkgJson, 'devDependencies', { default: {} })

  const targetDeps = get(targetPkgJson, 'dependencies', { default: {} })
  const targetDevDeps = get(targetPkgJson, 'devDependencies', { default: {} })

  set(targetPkgJson, 'packageManager', packageManager)
  Object.entries(deps).forEach((x) => {
    if (!isWorkspace(targetDeps[x[0]])) {
      set(targetPkgJson, `dependencies.${x[0].replaceAll('.', '\\.')}`, x[1], { preservePaths: false })
    }
  })
  Object.entries(devDeps).forEach((x) => {
    if (x[0] === pkgName) {
      set(targetPkgJson, `devDependencies.${x[0].replaceAll('.', '\\.')}`, `^${pkgVersion}`, { preservePaths: false })
    }
    else if (!isWorkspace(targetDevDeps[x[0]])) {
      set(targetPkgJson, `devDependencies.${x[0].replaceAll('.', '\\.')}`, x[1], { preservePaths: false })
    }
  })
  for (const [k, v] of scriptsEntries) {
    set(targetPkgJson, `scripts.${k}`, v)
  }
}

function confirmOverwrite(filename: string) {
  return confirm({ message: `${pc.greenBright(filename)} 文件内容发生改变,是否覆盖?`, default: true })
}

export async function upgradeMonorepo(opts: CliOpts) {
  const { outDir, raw, interactive, cwd } = defu<Required<CliOpts>, CliOpts[]>(opts, {
    cwd: process.cwd(),
    outDir: '',
  })
  const absOutDir = path.isAbsolute(outDir) ? outDir : path.join(cwd, outDir)
  const gitClient = new GitClient({
    baseDir: cwd,
  })
  const repoName = await gitClient.getRepoName()
  let targets = getAssetTargets(raw)

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
        const targetIsExisted = await fs.exists(targetPath)

        async function overwriteOrCopy(target?: string | Buffer) {
          let isOverwrite = true
          if (targetIsExisted) {
            const src = await fs.readFile(file.path)
            const dest = target ?? await fs.readFile(targetPath)
            if (await isFileChanged(src, dest)) {
              isOverwrite = await confirmOverwrite(relPath)
            }
          }
          return isOverwrite
        }
        // const basename = path.basename(file.path)
        if (relPath === 'package.json') {
          const sourcePath = file.path
          if (targetIsExisted) {
            const sourcePkgJson = await fs.readJson(sourcePath) as PackageJson
            const targetPkgJson = await fs.readJson(targetPath) as PackageJson
            setPkgJson(sourcePkgJson, targetPkgJson)
            const data = JSON.stringify(targetPkgJson, undefined, 2)
            // packageJson
            // if (await overwriteOrCopy(data)) {
            await fs.outputFile(targetPath, `${data}\n`, 'utf8')
            logger.success(targetPath)
            // }
          }
        }
        else if (relPath === '.changeset/config.json' && repoName) {
          const changesetJson = await fs.readJson(file.path)
          set(changesetJson, 'changelog.1.repo', repoName)

          const data = JSON.stringify(changesetJson, undefined, 2)
          // changesetJson
          if (await overwriteOrCopy(data)) {
            await fs.outputFile(targetPath, `${data}\n`, 'utf8')
            logger.success(targetPath)
          }
        }
        else if (await overwriteOrCopy()) {
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
