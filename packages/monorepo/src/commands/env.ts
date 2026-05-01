import { execFileSync } from 'node:child_process'
import os from 'node:os'
import process from 'node:process'
import path from 'pathe'
import { getWorkspacePackageSummaries } from '../core/workspace'
import fs from '../utils/fs'

interface PackageJsonLike {
  packageManager?: string
  engines?: {
    node?: string
  }
}

export interface EnvInfo {
  cwd: string
  workspaceDir: string
  packageManager?: string
  nodeVersion: string
  nodeRange?: string
  pnpmVersion?: string
  platform: string
  arch: string
  packageCount: number
}

function readPnpmVersion() {
  try {
    return execFileSync('pnpm', ['--version'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  }
  catch {
    return undefined
  }
}

export async function collectEnvInfo(cwd: string): Promise<EnvInfo> {
  const workspace = await getWorkspacePackageSummaries(cwd, { ignorePrivatePackage: false })
  const packageJsonPath = path.join(workspace.workspaceDir, 'package.json')
  const pkgJson = await fs.pathExists(packageJsonPath)
    ? await fs.readJson<PackageJsonLike>(packageJsonPath)
    : {}
  const pnpmVersion = readPnpmVersion()

  return {
    cwd: workspace.cwd,
    workspaceDir: workspace.workspaceDir,
    ...(pkgJson.packageManager ? { packageManager: pkgJson.packageManager } : {}),
    nodeVersion: process.version,
    ...(pkgJson.engines?.node ? { nodeRange: pkgJson.engines.node } : {}),
    ...(pnpmVersion ? { pnpmVersion } : {}),
    platform: os.platform(),
    arch: os.arch(),
    packageCount: workspace.packages.length,
  }
}
