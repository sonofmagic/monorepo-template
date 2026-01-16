import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { runCommand } from './command'

function normalizeRepo(repo: string) {
  if (repo.startsWith('http')) {
    return repo
  }
  if (repo.startsWith('gh:')) {
    return `https://github.com/${repo.slice(3)}.git`
  }
  if (/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    return `https://github.com/${repo}.git`
  }
  return repo
}

export async function cloneRepo(repo: string, branch: string, targetDir: string) {
  const normalized = normalizeRepo(repo)
  process.stdout.write(`Cloning ${normalized} (branch ${branch})...\n`)
  await runCommand('git', ['clone', '--depth', '1', '--branch', branch, normalized, targetDir])
  await fs.rm(path.join(targetDir, '.git'), { recursive: true, force: true })
}
