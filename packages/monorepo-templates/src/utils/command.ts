import { spawn } from 'node:child_process'

export interface RunCommandOptions {
  cwd?: string
  stdio?: 'inherit' | 'pipe'
}

function waitForProcess(command: string, child: ReturnType<typeof spawn>) {
  return new Promise<{ exitCode: number | null }>((resolve, reject) => {
    child.once('error', reject)
    child.once('close', (exitCode) => {
      if (exitCode === 0) {
        resolve({ exitCode })
        return
      }
      reject(new Error(`Command failed with exit code ${exitCode ?? 'unknown'}: ${command}`))
    })
  })
}

export async function runCommand(command: string, args: string[], options: RunCommandOptions = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd,
    stdio: options.stdio ?? 'inherit',
  })
  return waitForProcess([command, ...args].join(' '), child)
}

export async function execaCommand(command: string, options: RunCommandOptions = {}) {
  const child = spawn(command, {
    cwd: options.cwd,
    shell: true,
    stdio: options.stdio ?? 'pipe',
  })
  return waitForProcess(command, child)
}
