import type { promptMessages as english } from '../en/prompt'

export const promptMessages = {
  createIntent: '你要创建什么？',
  createName: '请输入名称',
  libraryTemplate: '请选择库模板',
  packageName: '请输入包名',
  templateType: '请选择模板类型',
  upgradeFiles: '选择你需要的文件',
  overwriteFiles: '检测到受管文件内容变化，请选择要覆盖的文件',
  skillTargets: '请选择需要同步的技能目标',
} as const satisfies Record<keyof typeof english, string>
