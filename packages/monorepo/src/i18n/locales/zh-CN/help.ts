import type { helpMessages as english } from '../en/help'

export const helpMessages = {
  argumentsTitle: '参数：',
  cliDescription: '面向 pnpm 与 Turborepo 工作区的任务型仓库初始化与维护工具。',
  commandsTitle: '命令：',
  choicesLabel: '可选值：',
  defaultLabel: '默认值：',
  envLabel: '环境变量：',
  globalOptionsTitle: '全局选项：',
  helpCommand: '显示指定命令的帮助',
  helpOption: '显示命令帮助',
  languageOption: '输出语言：en 或 zh-CN',
  optionsTitle: '选项：',
  presetLabel: '预设值：',
  quickStart: `
快速开始：
  已有仓库：
    $ {cliName} init
    $ {cliName} doctor
    $ {cliName} templates
    $ {cliName} new my-package
    $ {cliName} check

  生成仓库中的快捷脚本：
    $ pnpm run repo:init
    $ pnpm run repo:doctor
    $ pnpm run repo:new -- my-package
    $ pnpm run repo:check

  保持仓库配置最新：
    $ {cliName} upgrade
`,
  usageTitle: '用法：',
  versionOption: '输出版本号',
} as const satisfies Record<keyof typeof english, string>
