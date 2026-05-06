import { readdir } from 'node:fs/promises'
import process from 'node:process'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { satisfies } from 'semver'
import YAML from 'yaml'
import { getWorkspacePackages } from '../core/workspace'
import fs from '../utils/fs'
import { hasLegacyToolingReference } from './tooling-migration'

export type DoctorStatus = 'pass' | 'warn' | 'fail'

export interface DoctorCheck {
  id: string
  title: string
  status: DoctorStatus
  detail: string
  fix?: string
}

export interface DoctorSummary {
  pass: number
  warn: number
  fail: number
}

export interface DoctorReport {
  cwd: string
  workspaceDir: string
  packageCount: number
  checks: DoctorCheck[]
  summary: DoctorSummary
}

interface PackageJsonLike {
  packageManager?: string
  engines?: {
    node?: string
  }
  dependencies?: Record<string, string | undefined>
  devDependencies?: Record<string, string | undefined>
  scripts?: Record<string, string | undefined>
}

interface ToolPackageResolution {
  name: 'repoctl' | '@icebreakers/monorepo'
  version: string
}

function createCheck(check: DoctorCheck) {
  return check
}

function summarizeChecks(checks: DoctorCheck[]): DoctorSummary {
  return checks.reduce<DoctorSummary>((summary, check) => {
    summary[check.status] += 1
    return summary
  }, {
    pass: 0,
    warn: 0,
    fail: 0,
  })
}

function resolveToolPackageName(pkgJson: PackageJsonLike): ToolPackageResolution | null {
  const candidates: Array<ToolPackageResolution | null> = [
    typeof pkgJson.devDependencies?.['repoctl'] === 'string'
      ? { name: 'repoctl', version: pkgJson.devDependencies['repoctl'] }
      : null,
    typeof pkgJson.devDependencies?.['@icebreakers/monorepo'] === 'string'
      ? { name: '@icebreakers/monorepo', version: pkgJson.devDependencies['@icebreakers/monorepo'] }
      : null,
    typeof pkgJson.dependencies?.['repoctl'] === 'string'
      ? { name: 'repoctl', version: pkgJson.dependencies['repoctl'] }
      : null,
    typeof pkgJson.dependencies?.['@icebreakers/monorepo'] === 'string'
      ? { name: '@icebreakers/monorepo', version: pkgJson.dependencies['@icebreakers/monorepo'] }
      : null,
  ]
  return candidates.find((value): value is ToolPackageResolution => value !== null) ?? null
}

function hasScript(pkgJson: PackageJsonLike, name: string) {
  return typeof pkgJson.scripts?.[name] === 'string' && pkgJson.scripts[name]!.length > 0
}

function getWorkspacePatterns(manifest: unknown) {
  if (typeof manifest !== 'object' || manifest === null) {
    return []
  }
  const packages = (manifest as { packages?: unknown }).packages
  return Array.isArray(packages)
    ? packages.filter((item): item is string => typeof item === 'string')
    : []
}

function isWorkspacePatternCovered(relativeDir: string, patterns: string[]) {
  const normalized = relativeDir.split('\\').join('/')
  return patterns.some((pattern) => {
    if (pattern.startsWith('!')) {
      return false
    }
    if (pattern.endsWith('/*')) {
      const base = pattern.slice(0, -2)
      return normalized.startsWith(`${base}/`) && normalized.slice(base.length + 1).split('/').length === 1
    }
    if (pattern.endsWith('/**')) {
      return normalized.startsWith(`${pattern.slice(0, -3)}/`)
    }
    return normalized === pattern
  })
}

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
      const packageJsonPath = `${absBaseDir}/${entry}/package.json`
      if (await fs.pathExists(packageJsonPath)) {
        result.push(`${baseDir}/${entry}`)
      }
    }))
  }
  return result.sort((left, right) => left.localeCompare(right))
}

export async function runDoctor(cwd: string) {
  const workspaceDir = await findWorkspaceDir(cwd) ?? cwd
  const packageJsonPath = `${workspaceDir}/package.json`
  const workspaceManifestPath = `${workspaceDir}/pnpm-workspace.yaml`
  const repoctlConfigPath = `${workspaceDir}/repoctl.config.ts`
  const monorepoConfigPath = `${workspaceDir}/monorepo.config.ts`
  const huskyPreCommitPath = `${workspaceDir}/.husky/pre-commit`
  const lintStagedConfigPath = `${workspaceDir}/lint-staged.config.js`

  const [
    hasPackageJson,
    hasWorkspaceManifest,
    hasRepoctlConfig,
    hasMonorepoConfig,
    hasHuskyPreCommit,
    hasLintStagedConfig,
  ] = await Promise.all([
    fs.pathExists(packageJsonPath),
    fs.pathExists(workspaceManifestPath),
    fs.pathExists(repoctlConfigPath),
    fs.pathExists(monorepoConfigPath),
    fs.pathExists(huskyPreCommitPath),
    fs.pathExists(lintStagedConfigPath),
  ])

  const pkgJson = hasPackageJson
    ? await fs.readJson<PackageJsonLike>(packageJsonPath)
    : {}

  const packageCount = hasWorkspaceManifest
    ? (await getWorkspacePackages(workspaceDir, { ignorePrivatePackage: false })).length
    : 0
  const workspacePatterns = hasWorkspaceManifest
    ? getWorkspacePatterns(YAML.parse(await fs.readFile(workspaceManifestPath, 'utf8')))
    : []
  const workspacePackageDirs = hasWorkspaceManifest ? await findWorkspacePackageDirs(workspaceDir) : []
  const isSourceWorkspace = await isRepoctlSourceWorkspace(workspaceDir)

  const checks: DoctorCheck[] = [
    hasPackageJson
      ? createCheck({
          id: 'package-json',
          title: 'package.json',
          status: 'pass',
          detail: `已找到根 package.json：${packageJsonPath}`,
        })
      : createCheck({
          id: 'package-json',
          title: 'package.json',
          status: 'fail',
          detail: '当前目录缺少根 package.json。',
          fix: '请在 monorepo 根目录执行命令，或先完成脚手架初始化。',
        }),
    hasWorkspaceManifest
      ? createCheck({
          id: 'workspace-manifest',
          title: 'pnpm workspace',
          status: 'pass',
          detail: `已找到 pnpm workspace，当前识别到 ${packageCount} 个 workspace 包。`,
        })
      : createCheck({
          id: 'workspace-manifest',
          title: 'pnpm workspace',
          status: 'fail',
          detail: '缺少 pnpm-workspace.yaml，当前目录不像一个完整的 pnpm monorepo 根目录。',
          fix: '运行 repo setup --yes 补充 pnpm-workspace.yaml，或确认你当前就在仓库根目录。',
        }),
  ]

  const nodeRange = pkgJson.engines?.node
  if (typeof nodeRange === 'string' && nodeRange.length > 0) {
    checks.push(
      satisfies(process.version, nodeRange)
        ? createCheck({
            id: 'node-version',
            title: 'Node 版本',
            status: 'pass',
            detail: `当前 Node 版本 ${process.version} 满足要求 ${nodeRange}。`,
          })
        : createCheck({
            id: 'node-version',
            title: 'Node 版本',
            status: 'fail',
            detail: `当前 Node 版本 ${process.version} 不满足要求 ${nodeRange}。`,
            fix: '切换到 package.json -> engines.node 要求的版本后再执行 install / build / check。',
          }),
    )
  }
  else {
    checks.push(createCheck({
      id: 'node-version',
      title: 'Node 版本',
      status: 'warn',
      detail: '根 package.json 未声明 engines.node，无法自动校验 Node 版本。',
      fix: '建议补充 package.json -> engines.node，避免团队成员使用不一致的运行时。',
    }))
  }

  const toolPackage = resolveToolPackageName(pkgJson)
  checks.push(
    toolPackage
      ? createCheck({
          id: 'tool-package',
          title: 'repo CLI 依赖',
          status: 'pass',
          detail: `已检测到 CLI 工具依赖：${toolPackage.name}@${toolPackage.version}`,
        })
      : createCheck({
          id: 'tool-package',
          title: 'repo CLI 依赖',
          status: 'fail',
          detail: '根 package.json 中未发现 repoctl 或 @icebreakers/monorepo 依赖。',
          fix: '运行 repo setup --yes 添加 repoctl devDependency，或手动执行 pnpm add -D repoctl。',
        }),
  )

  const hasSetup = hasScript(pkgJson, 'setup')
  const hasNew = hasScript(pkgJson, 'new')
  const hasCheck = hasScript(pkgJson, 'check')
  const hasDoctor = hasScript(pkgJson, 'doctor')
  if (hasSetup && hasNew && hasCheck && hasDoctor) {
    checks.push(createCheck({
      id: 'root-scripts',
      title: '根快捷脚本',
      status: 'pass',
      detail: '已检测到 setup / new / check / doctor 根脚本，可以直接使用 pnpm setup / pnpm new / pnpm check / pnpm doctor。',
    }))
  }
  else {
    const missing = [
      !hasSetup ? 'setup' : null,
      !hasNew ? 'new' : null,
      !hasCheck ? 'check' : null,
      !hasDoctor ? 'doctor' : null,
    ].filter(Boolean).join(', ')
    checks.push(createCheck({
      id: 'root-scripts',
      title: '根快捷脚本',
      status: 'warn',
      detail: `缺少推荐的根脚本：${missing}。`,
      fix: '运行 repo setup --yes 同步推荐根脚本，或手动在 package.json 中补齐 setup / new / check / doctor。',
    }))
  }

  if (hasRepoctlConfig && hasMonorepoConfig) {
    checks.push(createCheck({
      id: 'config-file',
      title: '配置文件',
      status: 'fail',
      detail: '同时存在 repoctl.config.ts 和 monorepo.config.ts，CLI 会拒绝加载。',
      fix: '保留一个配置文件即可，推荐只保留 repoctl.config.ts。',
    }))
  }
  else if (hasRepoctlConfig || hasMonorepoConfig) {
    checks.push(createCheck({
      id: 'config-file',
      title: '配置文件',
      status: 'pass',
      detail: `已检测到配置文件：${hasRepoctlConfig ? 'repoctl.config.ts' : 'monorepo.config.ts'}`,
    }))
  }
  else {
    checks.push(createCheck({
      id: 'config-file',
      title: '配置文件',
      status: 'warn',
      detail: '当前仓库没有自定义配置文件，CLI 会完全使用默认行为。',
      fix: '运行 repo upgrade --yes 同步默认 repoctl.config.ts，或手动添加 repoctl.config.ts。',
    }))
  }

  if (hasHuskyPreCommit && hasLintStagedConfig) {
    checks.push(createCheck({
      id: 'commit-hooks',
      title: '提交链路',
      status: 'pass',
      detail: '已检测到 .husky/pre-commit 与 lint-staged.config.js，提交前校验链路完整。',
    }))
  }
  else if (hasHuskyPreCommit || hasLintStagedConfig) {
    checks.push(createCheck({
      id: 'commit-hooks',
      title: '提交链路',
      status: 'warn',
      detail: '提交校验链路只配置了一半，Husky 与 lint-staged 没有同时就绪。',
      fix: '运行 repo upgrade --yes 同步 .husky/pre-commit 与 lint-staged.config.js。',
    }))
  }
  else {
    checks.push(createCheck({
      id: 'commit-hooks',
      title: '提交链路',
      status: 'warn',
      detail: '当前仓库未检测到 Husky / lint-staged 提交校验入口。',
      fix: '运行 repo upgrade --yes 同步 Husky 与 lint-staged 默认配置。',
    }))
  }

  const rootConfigFiles = isSourceWorkspace
    ? []
    : [
        'eslint.config.js',
        'stylelint.config.js',
        'lint-staged.config.js',
        'vitest.config.ts',
      ]
  const configFiles = [
    ...rootConfigFiles,
    ...['apps', 'packages', 'examples'].flatMap(dir => [
      `${dir}/*/eslint.config.js`,
      `${dir}/*/vitest.config.ts`,
    ]),
  ]
  const legacyToolingFiles: string[] = []
  for (const filePattern of configFiles) {
    if (filePattern.includes('*')) {
      const [baseDir, rest] = filePattern.split('/*/')
      const absBaseDir = `${workspaceDir}/${baseDir}`
      if (!await fs.pathExists(absBaseDir)) {
        continue
      }
      const entries = await readdir(absBaseDir)
      await Promise.all(entries.map(async (entry) => {
        const candidate = `${absBaseDir}/${entry}/${rest}`
        if (await fs.pathExists(candidate) && hasLegacyToolingReference(await fs.readFile(candidate, 'utf8'))) {
          legacyToolingFiles.push(`${baseDir}/${entry}/${rest}`)
        }
      }))
      continue
    }

    const candidate = `${workspaceDir}/${filePattern}`
    if (await fs.pathExists(candidate) && hasLegacyToolingReference(await fs.readFile(candidate, 'utf8'))) {
      legacyToolingFiles.push(filePattern)
    }
  }

  if (legacyToolingFiles.length === 0) {
    checks.push(createCheck({
      id: 'tooling-imports',
      title: 'tooling imports',
      status: 'pass',
      detail: 'tooling 配置未引用本地源码仓库 loader。',
    }))
  }
  else {
    checks.push(createCheck({
      id: 'tooling-imports',
      title: 'tooling imports',
      status: 'warn',
      detail: `以下配置引用了本地源码仓库 tooling loader：${legacyToolingFiles.join(', ')}。`,
      fix: '运行 repo upgrade --yes 迁移为直接 import repoctl/tooling。',
    }))
  }

  const commonWorkspaceBases = ['apps', 'packages', 'examples']
  const existingWorkspaceBases = (await Promise.all(commonWorkspaceBases.map(async base => ({
    base,
    exists: await fs.pathExists(`${workspaceDir}/${base}`),
  })))).filter(item => item.exists).map(item => item.base)
  const commonWorkspacePatterns = existingWorkspaceBases.map(base => `${base}/*`)
  const missingCommonPatterns = commonWorkspacePatterns.filter(pattern => !workspacePatterns.includes(pattern))
  if (hasWorkspaceManifest && missingCommonPatterns.length === 0) {
    checks.push(createCheck({
      id: 'workspace-patterns',
      title: 'workspace patterns',
      status: 'pass',
      detail: 'pnpm-workspace.yaml 已包含 apps/* / packages/* / examples/* 常见目录。',
    }))
  }
  else if (hasWorkspaceManifest) {
    checks.push(createCheck({
      id: 'workspace-patterns',
      title: 'workspace patterns',
      status: 'warn',
      detail: `pnpm-workspace.yaml 缺少常见目录：${missingCommonPatterns.join(', ')}。`,
      fix: '运行 repo setup --yes 追加缺失 workspace patterns。',
    }))
  }

  const uncoveredWorkspacePackages = workspacePackageDirs.filter(dir => !isWorkspacePatternCovered(dir, workspacePatterns))
  if (hasWorkspaceManifest && uncoveredWorkspacePackages.length === 0) {
    checks.push(createCheck({
      id: 'workspace-package-coverage',
      title: 'workspace package coverage',
      status: 'pass',
      detail: '常见 workspace 目录下的 package.json 都已被 pnpm-workspace.yaml 覆盖。',
    }))
  }
  else if (hasWorkspaceManifest) {
    checks.push(createCheck({
      id: 'workspace-package-coverage',
      title: 'workspace package coverage',
      status: 'warn',
      detail: `以下 package.json 未被 pnpm-workspace.yaml 覆盖：${uncoveredWorkspacePackages.join(', ')}。`,
      fix: '运行 repo setup --yes 追加缺失 workspace patterns。',
    }))
  }

  const summary = summarizeChecks(checks)
  return {
    cwd,
    workspaceDir,
    packageCount,
    checks,
    summary,
  } satisfies DoctorReport
}
