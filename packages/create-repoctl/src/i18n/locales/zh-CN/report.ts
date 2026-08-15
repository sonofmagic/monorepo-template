import type { report as english } from '../en/report'

export const report = {
  unknownTemplates: '忽略未知模板：{templates}',
  complete: '工作区创建完成。后续步骤：',
} as const satisfies Record<keyof typeof english, string>
