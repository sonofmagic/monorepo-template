#!/usr/bin/env node
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

async function main() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const distCliPath = path.resolve(currentDir, '../dist/cli.mjs')
  const sourceCliPath = path.resolve(currentDir, '../src/cli.ts')

  if (existsSync(distCliPath)) {
    await import(pathToFileURL(distCliPath).href)
  }
  else {
    const { register } = await import('tsx/esm/api')
    const unregister = register()
    try {
      await import(pathToFileURL(sourceCliPath).href)
    }
    finally {
      unregister()
    }
  }
}

void main()
