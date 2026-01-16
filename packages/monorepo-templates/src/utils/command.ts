import { execa } from 'execa'

export interface RunCommandOptions {
  cwd?: string
}

export async function runCommand(command: string, args: string[], options: RunCommandOptions = {}) {
  await execa(command, args, {
    stdio: 'inherit',
    ...options,
  })
}
