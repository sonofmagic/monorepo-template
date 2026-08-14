import { readFile } from 'node:fs/promises'
import path from 'pathe'
import YAML from 'yaml'
import { getWorkspacePackages } from '../../core/workspace'
import fs from '../../utils/fs'

export const releaseWorkflowMarker = '# repoctl-managed: release/v2'

export type ReleaseWorkflowStatus = 'missing' | 'managed' | 'legacy' | 'custom'

export function isLegacyReleaseWorkflow(content: string) {
  if (!content.includes('changesets/action')) {
    return false
  }

  // The official workflow has used both changesets/action's publish-script
  // input and an explicit `changeset publish` shell command over time.
  return content.includes('publish-script:')
    || content.includes('changeset publish')
    || content.includes('changeset version')
    || content.includes('pnpm exec repo release')
}

export async function classifyReleaseWorkflow(workspaceDir: string): Promise<ReleaseWorkflowStatus> {
  const workflowPath = path.join(workspaceDir, '.github/workflows/release.yml')
  if (!await fs.pathExists(workflowPath)) {
    return 'missing'
  }
  const content = await fs.readFile(workflowPath, 'utf8')
  if (content.includes(releaseWorkflowMarker)) {
    return 'managed'
  }
  if (isLegacyReleaseWorkflow(content)) {
    return 'legacy'
  }
  return 'custom'
}

/**
 * 将 Changesets prerelease 状态迁移到 pnpm lanes，并移除只属于旧 CLI 的元数据。
 * 未识别的 pre.json 会保留，避免静默丢失用户状态。
 */
export async function migrateLegacyVersioning(workspaceDir: string) {
  const changesetDir = path.join(workspaceDir, '.changeset')
  const configPath = path.join(changesetDir, 'config.json')
  const prePath = path.join(changesetDir, 'pre.json')
  let migratedLane = false

  if (await fs.pathExists(prePath)) {
    try {
      const state = JSON.parse(await readFile(prePath, 'utf8')) as { mode?: string, tag?: string }
      if (state.mode === 'pre' && typeof state.tag === 'string' && state.tag.length > 0) {
        const workspacePath = path.join(workspaceDir, 'pnpm-workspace.yaml')
        const manifest = YAML.parse(await readFile(workspacePath, 'utf8')) as Record<string, unknown>
        const versioningValue = manifest['versioning']
        const versioning = (versioningValue && typeof versioningValue === 'object' && !Array.isArray(versioningValue))
          ? versioningValue as Record<string, unknown>
          : {}
        const lanesValue = versioning['lanes']
        const lanes = (lanesValue && typeof lanesValue === 'object' && !Array.isArray(lanesValue))
          ? lanesValue as Record<string, string>
          : {}
        const packages = await getWorkspacePackages(workspaceDir)
        for (const pkg of packages) {
          if (pkg.manifest.name) {
            lanes[pkg.manifest.name] = state.tag
          }
        }
        versioning['lanes'] = lanes
        manifest['versioning'] = versioning
        await fs.writeFile(workspacePath, YAML.stringify(manifest, { singleQuote: true }), 'utf8')
        await fs.remove(prePath)
        migratedLane = true
      }
    }
    catch {
      // Keep malformed or unknown prerelease state for manual recovery.
    }
  }

  if (await fs.pathExists(configPath)) {
    await fs.remove(configPath)
  }

  return { migratedLane }
}
