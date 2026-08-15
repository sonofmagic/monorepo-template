import { errorMessages } from './error'
import { helpMessages } from './help'
import { promptMessages } from './prompt'
import { reportMessages } from './report'

export const enMessages = {
  ...helpMessages,
  ...promptMessages,
  ...reportMessages,
  ...errorMessages,
} as const
