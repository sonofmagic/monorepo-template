import type { en } from '../en'
import { error } from './error'
import { help } from './help'
import { prompt } from './prompt'
import { report } from './report'

export const zhCN = {
  ...help,
  ...prompt,
  ...report,
  ...error,
} as const satisfies Record<keyof typeof en, string>
