import type { RecommendedCheckPlan } from './check'
import type { DoctorReport } from './doctor'
import { execFileSync } from 'node:child_process'
import os from 'node:os'
import process from 'node:process'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import path from 'pathe'
import { getWorkspacePackageSummaries } from '../core/workspace'
import fs from '../utils/fs'
import { resolveRecommendedCheckPlan } from './check'
import { runDoctor } from './doctor'

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

export interface EnvSnapshot {
  generatedAt: string
  env: EnvInfo
  doctor: DoctorReport
  checkPlan: RecommendedCheckPlan
}

export interface EnvPathEntry {
  path: string
  relativePath: string
  exists: boolean
}

export interface EnvPaths {
  cwd: string
  workspaceDir: string
  paths: {
    packageJson: EnvPathEntry
    workspaceManifest: EnvPathEntry
    repoctlConfig: EnvPathEntry
    legacyConfig: EnvPathEntry
    toolingDir: EnvPathEntry
    reportsDir: EnvPathEntry
    doctorReport: EnvPathEntry
    envReport: EnvPathEntry
    snapshotReport: EnvPathEntry
    checkPlanReport: EnvPathEntry
  }
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

async function createEnvPathEntry(workspaceDir: string, targetPath: string): Promise<EnvPathEntry> {
  return {
    path: targetPath,
    relativePath: path.relative(workspaceDir, targetPath) || '.',
    exists: await fs.pathExists(targetPath),
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

export async function collectEnvPaths(cwd: string): Promise<EnvPaths> {
  const workspaceDir = await findWorkspaceDir(cwd) ?? cwd
  const paths = {
    packageJson: path.join(workspaceDir, 'package.json'),
    workspaceManifest: path.join(workspaceDir, 'pnpm-workspace.yaml'),
    repoctlConfig: path.join(workspaceDir, 'repoctl.config.ts'),
    legacyConfig: path.join(workspaceDir, 'monorepo.config.ts'),
    toolingDir: path.join(workspaceDir, 'tooling'),
    reportsDir: path.join(workspaceDir, 'reports'),
    doctorReport: path.join(workspaceDir, 'reports/doctor.json'),
    envReport: path.join(workspaceDir, 'reports/env.json'),
    snapshotReport: path.join(workspaceDir, 'reports/snapshot.json'),
    checkPlanReport: path.join(workspaceDir, 'reports/check-plan.json'),
  }

  return {
    cwd,
    workspaceDir,
    paths: {
      packageJson: await createEnvPathEntry(workspaceDir, paths.packageJson),
      workspaceManifest: await createEnvPathEntry(workspaceDir, paths.workspaceManifest),
      repoctlConfig: await createEnvPathEntry(workspaceDir, paths.repoctlConfig),
      legacyConfig: await createEnvPathEntry(workspaceDir, paths.legacyConfig),
      toolingDir: await createEnvPathEntry(workspaceDir, paths.toolingDir),
      reportsDir: await createEnvPathEntry(workspaceDir, paths.reportsDir),
      doctorReport: await createEnvPathEntry(workspaceDir, paths.doctorReport),
      envReport: await createEnvPathEntry(workspaceDir, paths.envReport),
      snapshotReport: await createEnvPathEntry(workspaceDir, paths.snapshotReport),
      checkPlanReport: await createEnvPathEntry(workspaceDir, paths.checkPlanReport),
    },
  }
}

export async function collectEnvSnapshot(cwd: string, now = new Date()): Promise<EnvSnapshot> {
  const [env, doctor] = await Promise.all([
    collectEnvInfo(cwd),
    runDoctor(cwd),
  ])

  return {
    generatedAt: now.toISOString(),
    env,
    doctor,
    checkPlan: resolveRecommendedCheckPlan({ cwd }),
  }
}
