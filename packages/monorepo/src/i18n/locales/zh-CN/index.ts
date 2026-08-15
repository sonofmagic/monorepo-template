import type { enMessages } from '../en'
import { errorMessages } from './error'
import { helpMessages } from './help'
import { promptMessages } from './prompt'
import { reportMessages } from './report'

export const zhCNMessages = {
  ...helpMessages,
  ...promptMessages,
  ...reportMessages,
  ...errorMessages,
} as const satisfies Record<keyof typeof enMessages, string>
