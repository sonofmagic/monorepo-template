import type { error as english } from '../en/error'

export const error = {
  commanderAllowedChoices: '可选值为',
  commanderArgumentMissing: '缺少参数',
  commanderDidYouMean: '你是否想输入',
  commanderDidYouMeanOneOf: '你是否想输入以下之一',
  commanderErrorPrefix: '错误：',
  commanderMissingRequiredArgument: '缺少必填参数',
  commanderNotSpecified: '未指定',
  commanderRequiredOption: '必填选项',
  commanderTooManyArguments: '参数过多',
  commanderUnknownCommand: '未知命令',
  commanderUnknownOption: '未知选项',
  invalidLocale: '不支持的语言：{locale}。请使用 en 或 zh-CN。',
} as const satisfies Record<keyof typeof english, string>
