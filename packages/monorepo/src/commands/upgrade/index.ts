import type { CliOpts, PackageJson } from '../../types'
import type { PendingOverwrite } from './overwrite'
import process from 'node:process'
import checkbox from '@inquirer/checkbox'
import fs from 'fs-extra'
import klaw from 'klaw'
import path from 'pathe'
import set from 'set-value'
import { assetsDir } from '../../constants'
import { resolveCommandConfig } from '../../core/config'
import { GitClient } from '../../core/git'
import { logger } from '../../core/logger'
import { escapeStringRegexp, isIgnorableFsError, isMatch, toWorkspaceGitignorePath } from '../../utils'
import { evaluateWriteIntent, flushPendingOverwrites, scheduleOverwrite } from './overwrite'
import { setPkgJson } from './pkg-json'
import { getAssetTargets } from './targets'

export { setPkgJson }

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
  const useCoreAssets = merged.core ?? false
  merged.core = useCoreAssets
  const baseTargets = getAssetTargets(useCoreAssets)
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
  const pendingOverwrites: PendingOverwrite[] = []
  for await (const file of klaw(assetsDir, {
    filter(p) {
      const rel = toWorkspaceGitignorePath(path.relative(assetsDir, p))
      return isMatch(rel, regexpArr)
    },
  })) {
    if (!file.stats.isFile()) {
      continue
    }

    const relPath = toWorkspaceGitignorePath(path.relative(assetsDir, file.path))

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
        const intent = await evaluateWriteIntent(targetPath, { skipOverwrite, source: data })
        const action = async () => {
          await fs.outputFile(targetPath, data, 'utf8')
          logger.success(targetPath)
        }
        await scheduleOverwrite(intent, {
          relPath,
          targetPath,
          action,
          pending: pendingOverwrites,
        })
        continue
      }

      if (relPath === '.changeset/config.json' && repoName) {
        const changesetJson = await fs.readJson(file.path)
        set(changesetJson, 'changelog.1.repo', repoName)
        const data = `${JSON.stringify(changesetJson, undefined, 2)}\n`
        const intent = await evaluateWriteIntent(targetPath, { skipOverwrite, source: data })
        const action = async () => {
          await fs.outputFile(targetPath, data, 'utf8')
          logger.success(targetPath)
        }
        await scheduleOverwrite(intent, {
          relPath,
          targetPath,
          action,
          pending: pendingOverwrites,
        })
        continue
      }

      if (relPath === 'LICENSE') {
        const source = await fs.readFile(file.path)
        const intent = await evaluateWriteIntent(targetPath, { skipOverwrite: true, source })
        const action = async () => {
          await fs.outputFile(targetPath, source)
          logger.success(targetPath)
        }
        await scheduleOverwrite(intent, {
          relPath,
          targetPath,
          action,
          pending: pendingOverwrites,
        })
        continue
      }

      const source = await fs.readFile(file.path)
      const intent = await evaluateWriteIntent(targetPath, { skipOverwrite, source })
      const action = async () => {
        await fs.outputFile(targetPath, source)
        logger.success(targetPath)
      }
      await scheduleOverwrite(intent, {
        relPath,
        targetPath,
        action,
        pending: pendingOverwrites,
      })
    }
    catch (error) {
      if (isIgnorableFsError(error)) {
        continue
      }
      throw error
    }
  }

  await flushPendingOverwrites(pendingOverwrites)
}
