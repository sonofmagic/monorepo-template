import type { DoctorContext, DoctorPackageJson } from './types'
import { readdir } from 'node:fs/promises'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import YAML from 'yaml'
import { getWorkspacePackages } from '../../core/workspace'
import fs from '../../utils/fs'
import { getWorkspacePatterns } from './helpers'

async function isRepoctlSourceWorkspace(workspaceDir: string) {
  const [hasMonorepoSource, hasRepoctlSource] = await Promise.all([
    fs.pathExists(`${workspaceDir}/packages/monorepo/src/tooling/index.ts`),
    fs.pathExists(`${workspaceDir}/packages/repoctl/src/tooling-entry.ts`),
  ])
  return hasMonorepoSource && hasRepoctlSource
}

async function findWorkspacePackageDirs(workspaceDir: string) {
  const result: string[] = []
  for (const baseDir of ['apps', 'packages', 'examples']) {
    const absBaseDir = `${workspaceDir}/${baseDir}`
    if (!await fs.pathExists(absBaseDir)) {
      continue
    }
    const entries = await readdir(absBaseDir)
    await Promise.all(entries.map(async (entry) => {
      if (await fs.pathExists(`${absBaseDir}/${entry}/package.json`)) {
        result.push(`${baseDir}/${entry}`)
      }
    }))
  }
  return result.sort((left, right) => left.localeCompare(right))
}

export async function collectDoctorContext(cwd: string): Promise<DoctorContext> {
  const workspaceDir = await findWorkspaceDir(cwd) ?? cwd
  const packageJsonPath = `${workspaceDir}/package.json`
  const workspaceManifestPath = `${workspaceDir}/pnpm-workspace.yaml`
  const [
    hasPackageJson,
    hasWorkspaceManifest,
    hasRepoctlConfig,
    hasLegacyMonorepoConfig,
    hasHuskyPreCommit,
    hasLintStagedConfig,
  ] = await Promise.all([
    fs.pathExists(packageJsonPath),
    fs.pathExists(workspaceManifestPath),
    fs.pathExists(`${workspaceDir}/repoctl.config.ts`),
    fs.pathExists(`${workspaceDir}/monorepo.config.ts`),
    fs.pathExists(`${workspaceDir}/.husky/pre-commit`),
    fs.pathExists(`${workspaceDir}/lint-staged.config.js`),
  ])
  const packageJson = hasPackageJson
    ? await fs.readJson<DoctorPackageJson>(packageJsonPath)
    : {}
  const packageCount = hasWorkspaceManifest
    ? (await getWorkspacePackages(workspaceDir, { ignorePrivatePackage: false })).length
    : 0
  const workspacePatterns = hasWorkspaceManifest
    ? getWorkspacePatterns(YAML.parse(await fs.readFile(workspaceManifestPath, 'utf8')))
    : []

  return {
    cwd,
    workspaceDir,
    packageJson,
    packageCount,
    workspacePatterns,
    workspacePackageDirs: hasWorkspaceManifest ? await findWorkspacePackageDirs(workspaceDir) : [],
    hasPackageJson,
    hasWorkspaceManifest,
    hasRepoctlConfig,
    hasLegacyMonorepoConfig,
    hasHuskyPreCommit,
    hasLintStagedConfig,
    isSourceWorkspace: await isRepoctlSourceWorkspace(workspaceDir),
  }
}
