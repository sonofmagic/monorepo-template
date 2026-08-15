import { error } from './error'
import { help } from './help'
import { prompt } from './prompt'
import { report } from './report'

export const en = {
  ...help,
  ...prompt,
  ...report,
  ...error,
} as const
