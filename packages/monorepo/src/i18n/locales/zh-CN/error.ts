import type { errorMessages as english } from '../en/error'

export const errorMessages = {
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
  tasksFileRequired: '使用 tasks 模式时必须提供任务文件路径。',
  unknownCreateIntent: '未找到创建意图：{intent}',
  unknownInitTooling: '未知的 init tooling 目标：{targets}',
  missingPackageJsonForTooling: '未找到 package.json，无法初始化 tooling：{path}',
  missingDependencyVersion: '未找到依赖 {name} 的版本信息。',
} as const satisfies Record<keyof typeof english, string>
