import type { prompt as english } from '../en/prompt'

export const prompt = {
  targetPrompt: '项目目录（默认：{defaultDir}）',
  templatesPrompt: '选择要包含的模板（默认不选择）',
} as const satisfies Record<keyof typeof english, string>
