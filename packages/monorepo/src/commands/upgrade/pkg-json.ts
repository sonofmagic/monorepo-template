import type { PackageJson } from '../../types'
import { coerce, gte, minVersion } from 'semver'
import { name as pkgName, version as pkgVersion } from '../../constants'
import { scriptsEntries } from './scripts'

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
