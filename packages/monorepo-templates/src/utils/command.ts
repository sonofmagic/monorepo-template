import exec from 'nanoexec'

export interface RunCommandOptions {
  cwd?: string
  stdio?: 'inherit' | 'pipe'
}

export async function runCommand(command: string, args: string[], options: RunCommandOptions = {}) {
  const result = await exec(command, args, {
    cwd: options.cwd,
    stdio: options.stdio ?? 'inherit',
  })
  if (!result.ok) {
    throw new Error(`Command failed with exit code ${result.code ?? 'unknown'}: ${[command, ...args].join(' ')}`)
  }
  return { exitCode: result.code }
}

export async function execaCommand(command: string, options: RunCommandOptions = {}) {
  const result = await exec(command, {
    cwd: options.cwd,
    shell: true,
    stdio: options.stdio ?? 'pipe',
  })
  if (!result.ok) {
    throw new Error(`Command failed with exit code ${result.code ?? 'unknown'}: ${command}`)
  }
  return { exitCode: result.code }
}
