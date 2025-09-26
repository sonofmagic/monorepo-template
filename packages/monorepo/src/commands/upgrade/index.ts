import type { CliOpts, PackageJson } from '../../types'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import checkbox from '@inquirer/checkbox'
import confirm from '@inquirer/confirm'
import fs from 'fs-extra'
import get from 'get-value'
import klaw from 'klaw'
import path from 'pathe'
import pc from 'picocolors'
import { assetsDir, name as pkgName, version as pkgVersion } from '../../constants'
import { resolveCommandConfig } from '../../core/config'
import { GitClient } from '../../core/git'
import { logger } from '../../core/logger'
import { escapeStringRegexp, isFileChanged, isMatch } from '../../utils'
import { scriptsEntries } from './scripts'
import { getAssetTargets } from './targets'

function isWorkspace(version?: string) {
  if (typeof version === 'string') {
    return version.startsWith('workspace:')
  }
  return false
}

export function setPkgJson(
  sourcePkgJson: PackageJson,
  targetPkgJson: PackageJson,
  options?: {
    scripts?: Record<string, string>
  },
) {
  const packageManager = get(sourcePkgJson, 'packageManager', { default: '' })
  const sourceDeps = get(sourcePkgJson, 'dependencies', { default: {} })
  const sourceDevDeps = get(sourcePkgJson, 'devDependencies', { default: {} })

  const targetDeps = { ...get(targetPkgJson, 'dependencies', { default: {} }) }
  const targetDevDeps = { ...get(targetPkgJson, 'devDependencies', { default: {} }) }

  if (packageManager) {
    targetPkgJson.packageManager = packageManager
  }

  for (const [depName, depVersion] of Object.entries(sourceDeps)) {
    if (!isWorkspace(targetDeps[depName])) {
      targetDeps[depName] = depVersion
    }
  }
  if (Object.keys(targetDeps).length) {
    targetPkgJson.dependencies = targetDeps
  }

  for (const [depName, depVersion] of Object.entries(sourceDevDeps)) {
    if (depName === pkgName) {
      targetDevDeps[depName] = `^${pkgVersion}`
    }
    else if (!isWorkspace(targetDevDeps[depName])) {
      targetDevDeps[depName] = depVersion
    }
  }
  if (Object.keys(targetDevDeps).length) {
    targetPkgJson.devDependencies = targetDevDeps
  }

  const scriptPairs = options?.scripts ? Object.entries(options.scripts) : scriptsEntries
  if (scriptPairs.length) {
    const scripts = { ...(targetPkgJson.scripts ?? {}) }
    for (const [scriptName, scriptCmd] of scriptPairs) {
      scripts[scriptName] = scriptCmd
    }
    targetPkgJson.scripts = scripts
  }
}

function confirmOverwrite(filename: string) {
  return confirm({ message: `${pc.greenBright(filename)} 文件内容发生改变,是否覆盖?`, default: true })
}

function asBuffer(data: Buffer | string) {
  return typeof data === 'string' ? Buffer.from(data) : data
}

async function shouldWriteFile(
  targetPath: string,
  options: {
    skipOverwrite?: boolean
    source: Buffer | string
    promptLabel: string
  },
) {
  const { skipOverwrite, source, promptLabel } = options
  const exists = await fs.pathExists(targetPath)
  if (!exists) {
    return true
  }

  if (skipOverwrite) {
    return false
  }

  const src = asBuffer(source)
  let destSize = 0
  try {
    const stat = await fs.stat(targetPath)
    destSize = stat.size
  }
  catch {
    return true
  }

  if (destSize !== src.length) {
    return confirmOverwrite(promptLabel)
  }

  const dest = await fs.readFile(targetPath)
  if (!isFileChanged(src, dest)) {
    return false
  }

  return confirmOverwrite(promptLabel)
}

export async function upgradeMonorepo(opts: CliOpts) {
  const cwd = opts.cwd ?? process.cwd()
  const upgradeConfig = await resolveCommandConfig('upgrade', cwd)
  const merged: CliOpts = {
    cwd,
    outDir: '',
    ...(upgradeConfig ?? {}),
    ...opts,
  }

  const outDir = merged.outDir ?? ''
  const absOutDir = path.isAbsolute(outDir) ? outDir : path.join(cwd, outDir)
  const gitClient = new GitClient({
    baseDir: cwd,
  })
  const repoName = await gitClient.getRepoName()
  const baseTargets = getAssetTargets(merged.raw)
  const configTargets = upgradeConfig?.targets ?? []
  const mergeTargets = upgradeConfig?.mergeTargets
  let targets = configTargets.length
    ? (mergeTargets === false ? [...configTargets] : Array.from(new Set([...baseTargets, ...configTargets])))
    : baseTargets

  if (merged.interactive) {
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
  const skipChangesetMarkdown = upgradeConfig?.skipChangesetMarkdown ?? true
  const scriptOverrides = upgradeConfig?.scripts
  const skipOverwrite = merged.skipOverwrite
  for await (const file of klaw(assetsDir, {
    filter(p) {
      const str = path.relative(assetsDir, p)
      return isMatch(str, regexpArr)
    },
  })) {
    if (!file.stats.isFile()) {
      continue
    }

    let relPath = path.relative(assetsDir, file.path)
    if (relPath === 'gitignore') {
      relPath = '.gitignore'
    }

    if (skipChangesetMarkdown && relPath.startsWith('.changeset/') && relPath.endsWith('.md')) {
      continue
    }
    const targetPath = path.resolve(absOutDir, relPath)

    if (relPath === 'package.json') {
      if (!await fs.pathExists(targetPath)) {
        continue
      }

      const sourcePkgJson = await fs.readJson(file.path) as PackageJson
      const targetPkgJson = await fs.readJson(targetPath) as PackageJson
      setPkgJson(sourcePkgJson, targetPkgJson, { scripts: scriptOverrides })
      const data = `${JSON.stringify(targetPkgJson, undefined, 2)}\n`
      if (await shouldWriteFile(targetPath, { skipOverwrite, source: data, promptLabel: relPath })) {
        await fs.outputFile(targetPath, data, 'utf8')
        logger.success(targetPath)
      }
      continue
    }

    if (relPath === '.changeset/config.json' && repoName) {
      const changesetJson = await fs.readJson(file.path)
      set(changesetJson, 'changelog.1.repo', repoName)
      const data = `${JSON.stringify(changesetJson, undefined, 2)}\n`
      if (await shouldWriteFile(targetPath, { skipOverwrite, source: data, promptLabel: relPath })) {
        await fs.outputFile(targetPath, data, 'utf8')
        logger.success(targetPath)
      }
      continue
    }

    if (await shouldWriteFile(targetPath, { skipOverwrite, source: await fs.readFile(file.path), promptLabel: relPath })) {
      await fs.copy(file.path, targetPath)
      logger.success(targetPath)
    }
  }
}
