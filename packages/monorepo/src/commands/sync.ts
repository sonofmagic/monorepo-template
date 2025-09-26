import type { GetWorkspacePackagesOptions } from '../core/workspace'
import os from 'node:os'
import defu from 'defu'
import { execaCommand } from 'execa'
import PQueue from 'p-queue'
import path from 'pathe'
import pc from 'picocolors'
import { resolveCommandConfig } from '../core/config'
import { logger } from '../core/logger'
import { getWorkspaceData } from '../core/workspace'

function renderCommand(template: string, pkgName: string) {
  return template.replaceAll('{name}', pkgName)
}

export async function syncNpmMirror(cwd: string, options?: GetWorkspacePackagesOptions) {
  const syncConfig = await resolveCommandConfig('sync', cwd)
  const workspaceOptions = defu<GetWorkspacePackagesOptions, GetWorkspacePackagesOptions[]>(options ?? {}, [syncConfig ?? {}])
  const { packages, workspaceDir } = await getWorkspaceData(cwd, workspaceOptions)

  logger.info(`[当前工作区Repo]:\n${packages.map(x => `- ${pc.green(x.manifest.name)} : ${path.relative(workspaceDir, x.rootDir)}`).join('\n')}\n`)
  const set = new Set(packages.map(x => x.manifest.name))
  if (syncConfig?.packages?.length) {
    for (const name of Array.from(set)) {
      if (!name || !syncConfig.packages.includes(name)) {
        set.delete(name)
      }
    }
  }
  logger.info(`[即将同步的包]:\n${Array.from(set).map(x => `- ${pc.green(x ?? '')}`).join('\n')}\n`)

  const concurrency = syncConfig?.concurrency ?? Math.max(os.cpus().length, 1)
  const queue = new PQueue({ concurrency })
  const template = syncConfig?.command ?? 'cnpm sync {name}'

  const tasks: Array<Promise<unknown>> = []

  for (const pkgName of set) {
    if (!pkgName) {
      continue
    }

    tasks.push(queue.add(async () => {
      const command = renderCommand(template, pkgName)
      return execaCommand(command, {
        stdio: 'inherit',
      })
    }))
  }

  await Promise.all(tasks)
}
