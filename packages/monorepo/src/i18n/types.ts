export type RepoctlLocale = 'en' | 'zh-CN'

export interface LocaleEnvironment {
  REPOCTL_LANG?: string
}

export interface ResolveLocaleOptions {
  argv?: readonly string[]
  env?: LocaleEnvironment
}
