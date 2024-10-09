import { execa } from 'execa'
import { getWorkspacePackages } from './utils'

export async function syncNpmMirror(cwd: string) {
  const packages = await getWorkspacePackages(cwd)

  for (
    const project of packages
  ) {
    if (project.manifest.name) {
      await execa({
        stdout: ['pipe', 'inherit'],
      })`cnpm sync ${project.manifest.name}`
    }
  }
}
