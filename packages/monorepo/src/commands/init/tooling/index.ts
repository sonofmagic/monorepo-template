import type { InitToolingExecutionOptions, InitToolingResult, InitToolingTarget } from './types'
import type { PackageJson } from '@/types'
import path from 'pathe'
import { logger } from '@/core/logger'
import fs from '@/utils/fs'
import { initToolingPresets, resolveToolingImportSource, resolveToolingPackageName } from './presets'
import { initToolingTargets } from './types'

export { resolveToolingImportSource, resolveToolingPackageName } from './presets'
export { initToolingTargets } from './types'

function sortRecord(input: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(input)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0)
      .sort(([left], [right]) => left.localeCompare(right)),
  )
}

function mergeDevDependencies(
  pkgJson: PackageJson,
  additions: Record<string, string | undefined>,
) {
  const current = { ...(pkgJson.devDependencies ?? {}) }
  let changed = false

  for (const [name, version] of Object.entries(additions)) {
    if (!version) {
      continue
    }
    if (current[name] === version) {
      continue
    }
    current[name] = version
    changed = true
  }

  if (!changed && pkgJson.devDependencies) {
    return false
  }

  pkgJson.devDependencies = sortRecord(current)
  return true
}

function resolveTargets(options: InitToolingExecutionOptions): InitToolingTarget[] {
  if (options.all) {
    return [...initToolingTargets]
  }

  const inputTargets = options.targets ?? []
  return [...new Set(inputTargets)].filter((target): target is InitToolingTarget => {
    return initToolingTargets.includes(target as InitToolingTarget)
  })
}

export function normalizeInitToolingTargets(input: string[]) {
  const unknown = input.filter(item => !initToolingTargets.includes(item as InitToolingTarget))
  if (unknown.length > 0) {
    throw new Error(`未知的 init tooling 目标: ${unknown.join(', ')}`)
  }
  return input as InitToolingTarget[]
}

export async function initTooling(cwd: string, options: InitToolingExecutionOptions = {}): Promise<InitToolingResult> {
  const selectedTargets = resolveTargets(options)
  if (selectedTargets.length === 0) {
    return {
      selectedTargets: [],
      writtenFiles: [],
      skippedFiles: [],
      updatedPackageJson: false,
    }
  }

  const pkgJsonPath = path.resolve(cwd, 'package.json')
  if (!await fs.pathExists(pkgJsonPath)) {
    throw new Error(`未找到 package.json，无法初始化 tooling: ${pkgJsonPath}`)
  }

  const packageJson = await fs.readJson<PackageJson>(pkgJsonPath)
  const toolingPackageName = resolveToolingPackageName(packageJson)
  const toolingImportSource = resolveToolingImportSource(toolingPackageName)
  const additions: Record<string, string> = {}
  const writtenFiles: string[] = []
  const skippedFiles: string[] = []

  for (const target of selectedTargets) {
    const preset = initToolingPresets[target]
    const filepath = path.resolve(cwd, preset.filepath)
    const exists = await fs.pathExists(filepath)

    Object.assign(additions, preset.getDependencies({
      cwd,
      packageJson,
      toolingPackageName,
      toolingImportSource,
    }))

    if (exists && !options.force) {
      skippedFiles.push(preset.filepath)
      logger.info(`skip existing init target: ${preset.filepath}`)
      continue
    }

    const content = await preset.getContent({
      cwd,
      packageJson,
      toolingPackageName,
      toolingImportSource,
    })
    await fs.outputFile(filepath, content, 'utf8')
    writtenFiles.push(preset.filepath)
  }

  const updatedPackageJson = mergeDevDependencies(packageJson, additions)
  if (updatedPackageJson) {
    await fs.writeFile(pkgJsonPath, `${JSON.stringify(packageJson, undefined, 2)}\n`, 'utf8')
  }

  return {
    selectedTargets,
    writtenFiles,
    skippedFiles,
    updatedPackageJson,
  }
}
