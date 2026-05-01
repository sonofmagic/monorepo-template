import { verifyCommitMsg, verifyPreCommit, verifyPrePush, verifyStagedTypecheck } from './verify'

export interface RecommendedCheckOptions {
  cwd: string
  full?: boolean
  staged?: boolean
  editFile?: string
}

export type RecommendedCheckMode = 'commit-msg' | 'full' | 'staged' | 'default'

export interface RecommendedCheckPlanCommand {
  name: string
  command: string
  description: string
}

export interface RecommendedCheckPlan {
  cwd: string
  mode: RecommendedCheckMode
  commands: RecommendedCheckPlanCommand[]
}

export function resolveRecommendedCheckPlan(options: RecommendedCheckOptions): RecommendedCheckPlan {
  const { cwd, full, staged, editFile } = options

  if (editFile) {
    return {
      cwd,
      mode: 'commit-msg',
      commands: [
        {
          name: 'commit-msg',
          command: `repo verify commit-msg ${editFile}`,
          description: '校验 commit message 文件是否符合提交规范。',
        },
      ],
    }
  }

  if (full) {
    return {
      cwd,
      mode: 'full',
      commands: [
        {
          name: 'pre-push',
          command: 'repo verify pre-push',
          description: '执行完整 pre-push 校验，包含整仓 lint/typecheck，并按变更范围运行 build/test/tsd。',
        },
      ],
    }
  }

  if (staged) {
    return {
      cwd,
      mode: 'staged',
      commands: [
        {
          name: 'pre-commit',
          command: 'repo verify pre-commit',
          description: '执行 pre-commit 校验。',
        },
        {
          name: 'staged-typecheck',
          command: 'repo verify staged-typecheck <staged files>',
          description: '按暂存 TypeScript/Vue 文件所在 workspace 路由 typecheck。',
        },
      ],
    }
  }

  return {
    cwd,
    mode: 'default',
    commands: [
      {
        name: 'pre-commit',
        command: 'repo verify pre-commit',
        description: '执行默认轻量本地校验。',
      },
    ],
  }
}

export async function runRecommendedCheck(options: RecommendedCheckOptions) {
  const { cwd, full, staged, editFile } = options

  if (editFile) {
    await verifyCommitMsg({ cwd, editFile })
    return
  }

  if (full) {
    await verifyPrePush({ cwd })
    return
  }

  if (staged) {
    await verifyPreCommit({ cwd })
    verifyStagedTypecheck([], { cwd })
    return
  }

  await verifyPreCommit({ cwd })
}
