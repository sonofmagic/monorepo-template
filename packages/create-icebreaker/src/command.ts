import { spawn } from 'node:child_process'

export function runCommand(command: string, args: string[], options: { cwd?: string } = {}) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code && code !== 0) {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
        return
      }
      resolve()
    })
  })
}
