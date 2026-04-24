import process from 'node:process'
import { findWorkspaceDir } from '@pnpm/find-workspace-dir'
import { satisfies } from 'semver'
import { getWorkspacePackages } from '../core/workspace'
import fs from '../utils/fs'

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

export async function runDoctor(cwd: string) {
  const workspaceDir = await findWorkspaceDir(cwd) ?? cwd
  const packageJsonPath = `${workspaceDir}/package.json`
  const workspaceManifestPath = `${workspaceDir}/pnpm-workspace.yaml`
  const repoctlConfigPath = `${workspaceDir}/repoctl.config.ts`
  const monorepoConfigPath = `${workspaceDir}/monorepo.config.ts`
  const huskyPreCommitPath = `${workspaceDir}/.husky/pre-commit`
  const lintStagedConfigPath = `${workspaceDir}/lint-staged.config.js`
  const toolingLoaderPath = `${workspaceDir}/tooling/load-tooling-module.mjs`
  const toolingEnsureBuiltPath = `${workspaceDir}/tooling/ensure-tooling-built.mjs`

  const [
    hasPackageJson,
    hasWorkspaceManifest,
    hasRepoctlConfig,
    hasMonorepoConfig,
    hasHuskyPreCommit,
    hasLintStagedConfig,
    hasToolingLoader,
    hasToolingEnsureBuilt,
  ] = await Promise.all([
    fs.pathExists(packageJsonPath),
    fs.pathExists(workspaceManifestPath),
    fs.pathExists(repoctlConfigPath),
    fs.pathExists(monorepoConfigPath),
    fs.pathExists(huskyPreCommitPath),
    fs.pathExists(lintStagedConfigPath),
    fs.pathExists(toolingLoaderPath),
    fs.pathExists(toolingEnsureBuiltPath),
  ])

  const pkgJson = hasPackageJson
    ? await fs.readJson<PackageJsonLike>(packageJsonPath)
    : {}

  const packageCount = hasWorkspaceManifest
    ? (await getWorkspacePackages(workspaceDir, { ignorePrivatePackage: false })).length
    : 0

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
          fix: '补充 pnpm-workspace.yaml，或确认你当前就在仓库根目录。',
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
          fix: '建议在 devDependencies 中安装 repoctl，或使用模板默认脚手架重新同步根配置。',
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
      fix: '运行 repo upgrade 同步最新根脚本，或手动在 package.json 中补齐 setup / new / check / doctor。',
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
      fix: '如果你需要固定模板默认值、clean 规则或 upgrade 策略，建议添加 repoctl.config.ts。',
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
      fix: '建议同时保留 .husky/pre-commit 与 lint-staged.config.js，或运行 repo upgrade 重新同步。',
    }))
  }
  else {
    checks.push(createCheck({
      id: 'commit-hooks',
      title: '提交链路',
      status: 'warn',
      detail: '当前仓库未检测到 Husky / lint-staged 提交校验入口。',
      fix: '如果你希望提交前自动做 eslint / stylelint / typecheck，建议运行 repo upgrade 或 repo init 同步默认配置。',
    }))
  }

  if (hasToolingLoader && hasToolingEnsureBuilt) {
    checks.push(createCheck({
      id: 'tooling-loader',
      title: '根 tooling 目录',
      status: 'pass',
      detail: '已检测到 tooling/load-tooling-module.mjs 与 tooling/ensure-tooling-built.mjs，模板内的 tooling wrapper 引用可正常工作。',
    }))
  }
  else {
    const missing = [
      !hasToolingLoader ? 'tooling/load-tooling-module.mjs' : null,
      !hasToolingEnsureBuilt ? 'tooling/ensure-tooling-built.mjs' : null,
    ].filter(Boolean).join(', ')
    checks.push(createCheck({
      id: 'tooling-loader',
      title: '根 tooling 目录',
      status: 'warn',
      detail: `缺少模板依赖的根 tooling 文件：${missing}。`,
      fix: '建议运行 repo upgrade 同步根 tooling 目录，否则部分模板生成后的 eslint/vitest 配置可能引用到不存在的文件。',
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
