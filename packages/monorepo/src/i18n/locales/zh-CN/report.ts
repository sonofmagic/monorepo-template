import type { reportMessages as english } from '../en/report'

export const reportMessages = {
  wrote: '已写入 {path}',
  dryRunOnly: '仅执行预览；未写入任何文件。',
  nextInstallBuild: '下一步：运行 `pnpm install` 和 `pnpm build`。',
  nextInstallStart: '下一步：运行 `pnpm install`，然后启动新 workspace 包。',
  doctorBlocking: 'Doctor 发现 {count} 个阻断问题。',
  doctorStrictWarnings: '严格模式下 doctor 发现 {count} 个警告。',
  doctorSuggestions: 'Doctor 提供了 {count} 条建议。',
} as const satisfies Record<keyof typeof english, string>
