import process from 'node:process'
import { en } from './locales/en'
import { zhCN } from './locales/zh-CN'

export type CreateRepoctlLocale = 'en' | 'zh-CN'
export type CreateRepoctlMessageKey = keyof typeof en

const supportedLocales = ['en', 'zh-CN'] as const

export function isCreateRepoctlLocale(value: string | undefined): value is CreateRepoctlLocale {
  return supportedLocales.includes(value as CreateRepoctlLocale)
}

function readArgvLocale(argv: readonly string[]) {
  const equalsArg = argv.find(arg => arg.startsWith('--lang='))
  if (equalsArg) {
    return equalsArg.slice('--lang='.length)
  }
  const index = argv.indexOf('--lang')
  return index >= 0 ? argv[index + 1] : undefined
}

export function resolveCreateRepoctlLocale(argv: readonly string[] = process.argv, env: Record<string, string | undefined> = process.env) {
  const argvLocale = readArgvLocale(argv)
  if (isCreateRepoctlLocale(argvLocale)) {
    return argvLocale
  }
  const envLocale = env['REPOCTL_LANG']
  return isCreateRepoctlLocale(envLocale) ? envLocale : 'en'
}

export function createTranslator(locale: CreateRepoctlLocale) {
  const catalog = locale === 'zh-CN' ? zhCN : en
  return (key: CreateRepoctlMessageKey, values: Record<string, string> = {}) => {
    return Object.entries(values).reduce<string>(
      (result, [name, value]) => result.replaceAll(`{${name}}`, value),
      catalog[key],
    )
  }
}
