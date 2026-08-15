import type { RepoctlLocale, ResolveLocaleOptions } from './types'
import process from 'node:process'
import { enMessages } from './locales/en'
import { zhCNMessages } from './locales/zh-CN'

const supportedLocales = ['en', 'zh-CN'] as const

function isRepoctlLocale(value: string | undefined): value is RepoctlLocale {
  return supportedLocales.includes(value as RepoctlLocale)
}

function readArgvLocale(argv: readonly string[]) {
  const equalsArg = argv.find(arg => arg.startsWith('--lang='))
  if (equalsArg) {
    return equalsArg.slice('--lang='.length)
  }
  const index = argv.indexOf('--lang')
  return index >= 0 ? argv[index + 1] : undefined
}

export function resolveRepoctlLocale(options: ResolveLocaleOptions = {}): RepoctlLocale {
  const argvLocale = readArgvLocale(options.argv ?? process.argv)
  if (isRepoctlLocale(argvLocale)) {
    return argvLocale
  }
  const envLocale = options.env?.['REPOCTL_LANG'] ?? process.env['REPOCTL_LANG']
  return isRepoctlLocale(envLocale) ? envLocale : 'en'
}

export const repoctlLocale = resolveRepoctlLocale()

export function localize(english: string, simplifiedChinese: string) {
  return repoctlLocale === 'zh-CN' ? simplifiedChinese : english
}

export function message(key: keyof typeof enMessages, values: Record<string, string> = {}) {
  const catalog = repoctlLocale === 'zh-CN' ? zhCNMessages : enMessages
  return Object.entries(values).reduce<string>(
    (result, [name, value]) => result.replaceAll(`{${name}}`, value),
    catalog[key],
  )
}

export { supportedLocales }
export type { RepoctlLocale, ResolveLocaleOptions }
