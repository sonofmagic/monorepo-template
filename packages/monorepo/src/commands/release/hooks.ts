import type { ReleaseCommandConfig } from '../../types/config'
import type { PublishedPackage, ReleaseOptions } from './types'
import process from 'node:process'
import path from 'pathe'
import { ReleaseCommandError } from './errors'
import { run } from './shared'

const defaultQualityScripts = ['build', 'lint', 'test']

type ReleaseHookPhase = keyof NonNullable<ReleaseCommandConfig['hooks']>

function validateScriptName(script: string) {
  const normalizedScript = script.trim()
  if (!normalizedScript) {
    throw new ReleaseCommandError('release script name must not be empty')
  }
  return normalizedScript
}

function runScripts(scripts: string[], options: ReleaseOptions, extraEnv?: NodeJS.ProcessEnv) {
  for (const script of scripts) {
    run('pnpm', ['run', validateScriptName(script)], {
      ...options,
      ...(extraEnv
        ? {
            env: {
              ...(options.env ?? process.env),
              ...extraEnv,
            },
          }
        : {}),
    })
  }
}

export function runQualityScripts(options: ReleaseOptions) {
  runScripts(options.config?.qualityScripts ?? defaultQualityScripts, options)
}

export function runReleaseHooks(phase: ReleaseHookPhase, options: ReleaseOptions) {
  runScripts(options.config?.hooks?.[phase] ?? [], options)
}

export function runAfterPublishHooks(packages: PublishedPackage[], options: ReleaseOptions) {
  runScripts(options.config?.hooks?.afterPublish ?? [], options, {
    REPO_RELEASE_PUBLISHED_PACKAGES: JSON.stringify(packages),
    REPO_RELEASE_PUBLISH_SUMMARY: path.resolve(options.cwd, 'pnpm-publish-summary.json'),
  })
}
