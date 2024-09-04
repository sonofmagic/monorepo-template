import process from 'node:process'
import { execa } from 'execa'
import { getWorkspacePackages } from './utils'

const cwd = process.cwd()

const packages = await getWorkspacePackages(cwd)

for (const project of packages) {
  if (project.pkgJson.name) {
    await execa({
      stdout: ['pipe', 'inherit'],
    })`cnpm sync ${project.pkgJson.name}`
  }
}
