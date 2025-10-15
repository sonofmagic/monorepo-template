import type { CliOpts, PackageJson } from '../../types'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import checkbox from '@inquirer/checkbox'
import confirm from '@inquirer/confirm'
import fs from 'fs-extra'
import klaw from 'klaw'
import path from 'pathe'
import pc from 'picocolors'
import { coerce, gte, minVersion } from 'semver'
import set from 'set-value'
import { assetsDir, name as pkgName, version as pkgVersion } from '../../constants'
import { resolveCommandConfig } from '../../core/config'
import { GitClient } from '../../core/git'
import { logger } from '../../core/logger'
import { escapeStringRegexp, isFileChanged, isIgnorableFsError, isMatch } from '../../utils'
import { scriptsEntries } from './scripts'
import { getAssetTargets } from './targets'

function isWorkspace(version?: string) {
  if (typeof version === 'string') {
    return version.startsWith('workspace:')
  }
  return false
}

function parseVersion(input: unknown) {
  if (typeof input !== 'string' || input.trim().length === 0) {
    return null
  }
  return minVersion(input) ?? coerce(input)
}

function shouldAssignVersion(currentVersion: unknown, nextVersion: string) {
  if (typeof currentVersion !== 'string' || currentVersion.trim().length === 0) {
    return true
  }

  if (currentVersion === nextVersion) {
    return false
  }

  const current = parseVersion(currentVersion)
  const next = parseVersion(nextVersion)
  if (!current || !next) {
    return true
  }

  return !gte(current, next)
}

/**
 * 将内置 package.json 内容合并进目标工程：
 * - 同步依赖（保留 workspace: 前缀的版本）
 * - 确保 @icebreakers/monorepo 使用最新版本
 * - 写入预置脚本
 */
export function setPkgJson(
  sourcePkgJson: PackageJson,
  targetPkgJson: PackageJson,
  options?: {
    scripts?: Record<string, string>
  },
) {
  const packageManager = sourcePkgJson.packageManager ?? ''
  const sourceDeps = sourcePkgJson.dependencies ?? {}
  const sourceDevDeps = sourcePkgJson.devDependencies ?? {}

  const targetDeps = { ...(targetPkgJson.dependencies ?? {}) }
  const targetDevDeps = { ...(targetPkgJson.devDependencies ?? {}) }

  if (packageManager) {
    targetPkgJson.packageManager = packageManager
  }

  for (const [depName, depVersion] of Object.entries(sourceDeps)) {
    if (typeof depVersion !== 'string') {
      continue
    }

    const targetVersion = targetDeps[depName]
    if (isWorkspace(targetVersion)) {
      continue
    }
    if (shouldAssignVersion(targetVersion, depVersion)) {
      targetDeps[depName] = depVersion
    }
  }
  if (Object.keys(targetDeps).length) {
    targetPkgJson.dependencies = targetDeps
  }

  for (const [depName, depVersion] of Object.entries(sourceDevDeps)) {
    if (typeof depVersion !== 'string') {
      continue
    }

    if (depName === pkgName) {
      const nextVersion = `^${pkgVersion}`
      const targetVersion = targetDevDeps[depName]
      if (!isWorkspace(targetVersion) && shouldAssignVersion(targetVersion, nextVersion)) {
        targetDevDeps[depName] = nextVersion
      }
    }
    else {
      const targetVersion = targetDevDeps[depName]
      if (isWorkspace(targetVersion)) {
        continue
      }
      if (shouldAssignVersion(targetVersion, depVersion)) {
        targetDevDeps[depName] = depVersion
      }
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

/**
 * 判断是否需要写入目标文件，包含以下策略：
 * 1. 目标文件不存在：直接写入
 * 2. 开启 skipOverwrite：完全跳过
 * 3. 文件大小不同或内容 hash 不一致，提示用户确认
 */
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

/**
 * 将 assets 目录的模版文件同步到工程中，实现一键升级脚手架能力。
 */
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
  // 默认从 assets 目录读取一组标准文件作为升级目标。
  const baseTargets = getAssetTargets(merged.raw)
  const configTargets = upgradeConfig?.targets ?? []
  const mergeTargets = upgradeConfig?.mergeTargets
  let targets = configTargets.length
    ? (mergeTargets === false ? [...configTargets] : Array.from(new Set([...baseTargets, ...configTargets])))
    : baseTargets

  if (merged.interactive) {
    // 交互模式允许用户临时调整需要覆盖的文件集合。
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
  // 旧版本默认跳过 changeset Markdown，可通过配置覆盖。
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

    try {
      if (relPath === 'package.json') {
        if (!await fs.pathExists(targetPath)) {
          continue
        }

        const sourcePkgJson = await fs.readJson(file.path) as PackageJson
        const targetPkgJson = await fs.readJson(targetPath) as PackageJson
        setPkgJson(sourcePkgJson, targetPkgJson, { scripts: scriptOverrides })
        // 直接覆写对象后重新序列化，保证键顺序与缩进一致。
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

      if (relPath === 'LICENSE') {
        const source = await fs.readFile(file.path)
        if (await shouldWriteFile(targetPath, { skipOverwrite: true, source, promptLabel: relPath })) {
          await fs.copy(file.path, targetPath)
          logger.success(targetPath)
        }
        continue
      }

      if (await shouldWriteFile(targetPath, { skipOverwrite, source: await fs.readFile(file.path), promptLabel: relPath })) {
        await fs.copy(file.path, targetPath)
        logger.success(targetPath)
      }
    }
    catch (error) {
      if (isIgnorableFsError(error)) {
        continue
      }
      throw error
    }
  }
}
