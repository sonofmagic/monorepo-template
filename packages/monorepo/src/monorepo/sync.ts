import type { GetWorkspacePackagesOptions } from './workspace'
import os from 'node:os'
import { execa } from 'execa'
import PQueue from 'p-queue'
import path from 'pathe'
import pc from 'picocolors'
import { logger } from '../logger'
import { getWorkspacePackages } from './workspace'

export async function syncNpmMirror(cwd: string, options?: GetWorkspacePackagesOptions) {
  const packages = await getWorkspacePackages(cwd, options)
  logger.info(`[当前工作区Repo]:\n${packages.map(x => `- ${pc.green(x.manifest.name)} : ${path.relative(cwd, x.rootDir)}`).join('\n')}\n`)
  const set = new Set(packages.map(x => x.manifest.name))
  logger.info(`[即将同步的包]:\n${Array.from(set).map(x => `- ${pc.green(x)}`).join('\n')}\n`)
  const concurrency = Math.max(os.cpus().length, 1)
  const queue = new PQueue({ concurrency })
  for (const pkgName of set) {
    if (pkgName) {
      await queue.add(async () => {
        return execa({
          stdout: ['pipe', 'inherit'],
        })`cnpm sync ${pkgName}`
      })
    }
  }
}
