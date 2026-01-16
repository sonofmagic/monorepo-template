import type { SourceType } from './types'

export const DEFAULT_REPO = 'sonofmagic/monorepo-template'
export const DEFAULT_BRANCH = 'main'
export const DEFAULT_TARGET = 'icebreaker-monorepo'
export const DEFAULT_SOURCE: SourceType = 'npm'

export const REQUIRED_REMOVE = [
  'packages/monorepo',
  'packages/create-icebreaker',
  'packages/monorepo-templates',
]
