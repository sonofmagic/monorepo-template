import type { PublishedPackage, ReleaseOptions } from './types'
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import path from 'pathe'
import { logger } from '../../core/logger'
import { ReleaseCommandError } from './errors'

function runScript(script: string, options: ReleaseOptions, extraEnv?: NodeJS.ProcessEnv) {
  const normalizedScript = script.trim()
  if (!normalizedScript) {
    throw new ReleaseCommandError('release hook script name must not be empty')
  }

  return (options.spawn ?? spawnSync)('pnpm', ['run', normalizedScript], {
    cwd: options.cwd,
    encoding: 'utf8',
    env: {
      ...(options.env ?? process.env),
      ...extraEnv,
    },
    shell: false,
    stdio: 'inherit',
  })
}

export function runReleaseVerifyHooks(options: ReleaseOptions) {
  for (const script of options.hooks?.verify ?? []) {
    const result = runScript(script, options)
    if (result.status !== 0) {
      throw new ReleaseCommandError(`release verify hook failed: ${script}`, result.status ?? 1)
    }
  }
}

export function runAfterPublishHooks(packages: PublishedPackage[], options: ReleaseOptions) {
  if (!packages.length) {
    return
  }

  const extraEnv = {
    REPO_RELEASE_PUBLISHED_PACKAGES: JSON.stringify(packages),
    REPO_RELEASE_PUBLISH_SUMMARY: path.resolve(options.cwd, 'pnpm-publish-summary.json'),
  }
  for (const hook of options.hooks?.afterPublish ?? []) {
    const result = runScript(hook.script, options, extraEnv)
    if (result.status === 0) {
      continue
    }
    if (hook.continueOnError) {
      logger.warn(`release afterPublish hook failed and was ignored: ${hook.script}`)
      continue
    }
    throw new ReleaseCommandError(`release afterPublish hook failed: ${hook.script}`, result.status ?? 1)
  }
}
