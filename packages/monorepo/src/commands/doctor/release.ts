import type { DoctorCheck } from './types'
import { readFile } from 'node:fs/promises'
import path from 'pathe'
import { gte, minVersion } from 'semver'
import YAML from 'yaml'
import { localize } from '../../i18n'
import fs from '../../utils/fs'
import { classifyReleaseWorkflow, releaseWorkflowMarker } from '../upgrade/release-migration'

export const releaseCiMinimumVersion = '5.1.0'

interface PackageJsonLike {
  dependencies?: Record<string, string | undefined>
  devDependencies?: Record<string, string | undefined>
}

function check(id: string, title: string, status: DoctorCheck['status'], detail: string, fix?: string): DoctorCheck {
  return { id, title, status, detail, ...(fix ? { fix } : {}) }
}

function minimumDependencyVersion(range: string | undefined) {
  const normalized = range?.startsWith('workspace:') ? range.slice('workspace:'.length) : range
  if (!normalized || normalized === '*' || normalized === '^' || normalized === '~') {
    return null
  }
  try {
    return minVersion(normalized)
  }
  catch {
    return null
  }
}

export async function collectReleaseChecks(workspaceDir: string, pkgJson: PackageJsonLike) {
  const workflowPath = path.join(workspaceDir, '.github/workflows/release.yml')
  const [hasWorkflow, hasPreState, hasChangesetConfig] = await Promise.all([
    fs.pathExists(workflowPath),
    fs.pathExists(path.join(workspaceDir, '.changeset/pre.json')),
    fs.pathExists(path.join(workspaceDir, '.changeset/config.json')),
  ])
  if (!hasWorkflow && !hasPreState && !hasChangesetConfig) {
    return []
  }

  const checks: DoctorCheck[] = []
  const workflowStatus = await classifyReleaseWorkflow(workspaceDir)
  if (workflowStatus === 'managed') {
    checks.push(check('release-workflow', 'release workflow', 'pass', localize(`The release workflow is managed by ${releaseWorkflowMarker}.`, `release workflow 已由 ${releaseWorkflowMarker} 管理。`)))
  }
  else if (workflowStatus === 'legacy') {
    checks.push(check(
      'release-workflow',
      'release workflow',
      'warn',
      localize('Found a legacy Changesets release workflow.', '检测到旧的 Changesets release workflow。'),
      localize('Run pnpm dlx repoctl@latest upgrade --yes for the initial migration.', '首次迁移运行 pnpm dlx repoctl@latest upgrade --yes。'),
    ))
  }
  else if (workflowStatus === 'custom') {
    checks.push(check(
      'release-workflow',
      'release workflow',
      'warn',
      localize('The release workflow has no repoctl managed marker and may contain custom logic.', 'release workflow 未包含 repoctl managed marker，可能存在自定义发布逻辑。'),
      localize('Review it, then run repo upgrade --overwrite-release or add the managed marker manually.', '确认内容后运行 repo upgrade --overwrite-release，或手动加入 repoctl-managed: release/v2。'),
    ))
  }

  if (hasPreState) {
    checks.push(check(
      'release-prerelease-state',
      'prerelease state',
      'warn',
      localize('Found legacy .changeset/pre.json prerelease state.', '检测到旧的 .changeset/pre.json。'),
      localize('Run pnpm dlx repoctl@latest upgrade --yes to migrate to pnpm versioning lanes.', '运行 pnpm dlx repoctl@latest upgrade --yes 将其迁移为 pnpm versioning.lanes。'),
    ))
  }
  if (hasChangesetConfig) {
    checks.push(check(
      'release-changeset-config',
      'changeset config',
      'warn',
      localize('Found .changeset/config.json from the Changesets CLI.', '检测到只属于 Changesets CLI 的 .changeset/config.json。'),
      localize('Run pnpm dlx repoctl@latest upgrade --yes to remove legacy configuration.', '运行 pnpm dlx repoctl@latest upgrade --yes 清理旧配置。'),
    ))
  }

  if (hasWorkflow) {
    const packageVersion = pkgJson.devDependencies?.['repoctl'] ?? pkgJson.dependencies?.['repoctl']
    const parsed = minimumDependencyVersion(packageVersion)
    if (!parsed || !gte(parsed, releaseCiMinimumVersion)) {
      checks.push(check(
        'release-cli-version',
        'release CLI version',
        'warn',
        localize(`repoctl ${packageVersion ?? 'missing'} does not guarantee release ci support.`, `repoctl 版本 ${packageVersion ?? 'missing'} 不保证支持 release ci。`),
        localize(`Upgrade repoctl to >=${releaseCiMinimumVersion}.`, `运行 pnpm dlx repoctl@latest upgrade --yes，或将 repoctl 升级到 >=${releaseCiMinimumVersion}。`),
      ))
    }
    else {
      checks.push(check('release-cli-version', 'release CLI version', 'pass', localize(`repoctl ${packageVersion} supports release ci.`, `repoctl 版本 ${packageVersion} 支持 release ci。`)))
    }

    try {
      const workspace = YAML.parse(await readFile(path.join(workspaceDir, 'pnpm-workspace.yaml'), 'utf8')) as { versioning?: { fixed?: unknown, changelog?: { storage?: string } } }
      const hasFixed = Array.isArray(workspace.versioning?.fixed) && workspace.versioning!.fixed.length > 0
      const hasRepositoryChangelog = workspace.versioning?.changelog?.storage === 'repository'
      checks.push(
        hasFixed && hasRepositoryChangelog
          ? check('release-versioning-config', 'release versioning config', 'pass', localize('pnpm fixed groups and repository changelog storage are configured.', 'pnpm fixed group 与 repository changelog 配置完整。'))
          : check('release-versioning-config', 'release versioning config', 'warn', localize('pnpm-workspace.yaml is missing required fixed groups or repository changelog storage.', 'pnpm-workspace.yaml 缺少 release 所需的 fixed 或 repository changelog 配置。'), localize('Run repo upgrade --yes to synchronize pnpm versioning configuration.', '运行 repo upgrade --yes 同步 pnpm versioning 配置。')),
      )
    }
    catch {
      checks.push(check('release-versioning-config', 'release versioning config', 'warn', localize('Unable to read versioning configuration from pnpm-workspace.yaml.', '无法读取 pnpm-workspace.yaml 的 versioning 配置。'), localize('Run repo upgrade --yes to synchronize pnpm versioning configuration.', '运行 repo upgrade --yes 同步 pnpm versioning 配置。')))
    }
  }

  return checks
}
