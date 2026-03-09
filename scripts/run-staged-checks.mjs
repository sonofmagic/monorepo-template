import { execFile, spawn } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import config from '../lint-staged.config.js'

const execFileAsync = promisify(execFile)
const BRACE_EXTENSION_PATTERN = /^\*\.\{(.+)\}$/

function quoteShellArg(value) {
  return `'${value.replaceAll('\'', '\'\\\'\'')}'`
}

function parseExtensionPattern(pattern) {
  const match = BRACE_EXTENSION_PATTERN.exec(pattern)
  if (!match) {
    return null
  }
  return new Set(match[1].split(',').map(ext => `.${ext}`))
}

function matchesPattern(pattern, filePath) {
  const base = path.basename(filePath)
  if (pattern === '*.vue') {
    return base.endsWith('.vue')
  }

  const extensionSet = parseExtensionPattern(pattern)
  if (extensionSet) {
    return extensionSet.has(path.extname(base))
  }

  return false
}

async function getStagedFiles() {
  const { stdout } = await execFileAsync('git', [
    'diff',
    '--cached',
    '--name-only',
    '--diff-filter=ACMR',
  ])

  return stdout
    .split('\n')
    .map(file => file.trim())
    .filter(Boolean)
}

async function runCommand(command, files) {
  const child = spawn(`${command} ${files.map(quoteShellArg).join(' ')}`, {
    shell: true,
    stdio: 'inherit',
  })

  await new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`Command failed with exit code ${code ?? 'unknown'}: ${command}`))
    })
  })
}

async function main() {
  const stagedFiles = await getStagedFiles()
  if (!stagedFiles.length) {
    return
  }

  for (const [pattern, commands] of Object.entries(config)) {
    const matchedFiles = stagedFiles.filter(file => matchesPattern(pattern, file))
    if (!matchedFiles.length) {
      continue
    }

    for (const command of commands) {
      await runCommand(command, matchedFiles)
    }
  }
}

await main()
