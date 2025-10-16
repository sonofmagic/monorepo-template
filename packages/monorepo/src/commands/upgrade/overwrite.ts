import { Buffer } from 'node:buffer'
import checkbox from '@inquirer/checkbox'
import fs from 'fs-extra'
import pc from 'picocolors'
import { isFileChanged } from '../../utils'

type WriteIntent
  = (
      { type: 'write', reason: 'missing' }
      | { type: 'skip', reason: 'skipOverwrite' | 'identical' }
      | { type: 'prompt', reason: 'changed' }
  )

function asBuffer(data: Buffer | string) {
  return typeof data === 'string' ? Buffer.from(data) : data
}

export async function evaluateWriteIntent(
  targetPath: string,
  options: {
    skipOverwrite?: boolean
    source: Buffer | string
  },
): Promise<WriteIntent> {
  const { skipOverwrite, source } = options
  const exists = await fs.pathExists(targetPath)
  if (!exists) {
    return {
      type: 'write',
      reason: 'missing',
    }
  }

  if (skipOverwrite) {
    return {
      type: 'skip',
      reason: 'skipOverwrite',
    }
  }

  const src = asBuffer(source)
  let destSize = 0
  try {
    const stat = await fs.stat(targetPath)
    destSize = stat.size
  }
  catch {
    return {
      type: 'write',
      reason: 'missing',
    }
  }

  if (destSize !== src.length) {
    return {
      type: 'prompt',
      reason: 'changed',
    }
  }

  const dest = await fs.readFile(targetPath)
  if (!isFileChanged(src, dest)) {
    return {
      type: 'skip',
      reason: 'identical',
    }
  }

  return {
    type: 'prompt',
    reason: 'changed',
  }
}

export interface PendingOverwrite {
  relPath: string
  targetPath: string
  action: () => Promise<void>
}

export async function scheduleOverwrite(
  intent: WriteIntent,
  options: {
    relPath: string
    targetPath: string
    action: () => Promise<void>
    pending: PendingOverwrite[]
  },
) {
  const { relPath, targetPath, action, pending } = options

  if (intent.type === 'write') {
    await action()
    return
  }

  if (intent.type === 'prompt') {
    pending.push({
      relPath,
      targetPath,
      action,
    })
  }
}

export async function flushPendingOverwrites(pending: PendingOverwrite[]) {
  if (!pending.length) {
    return
  }

  const selected = await checkbox({
    message: '检测到以下文件内容与当前仓库不同，选择需要覆盖的文件',
    choices: pending.map(item => ({
      name: pc.greenBright(item.relPath),
      value: item.targetPath,
      checked: false,
    })),
    loop: false,
  })

  const selectedSet = new Set(selected)
  for (const item of pending) {
    if (selectedSet.has(item.targetPath)) {
      await item.action()
    }
  }
}
