import type { DocsLocale } from '../navigation/routes'
import type { HomeContent } from './types'

const english = {
  hero: {
    label: 'repoctl documentation',
    title: 'What do you need to do in your repository?',
    description: 'A task-first CLI for pnpm and Turborepo monorepos. Start with one command, then follow the evidence.',
  },
  tasks: {
    title: 'Choose a task',
    description: 'Pick the result you need. Each path starts with the smallest safe command.',
    items: [
      { title: 'Start a new repository', body: 'Set up the shared conventions before you add projects.', command: 'repo init', link: { label: 'Start here', href: '/start/' } },
      { title: 'Adopt an existing repository', body: 'Inspect current choices and preview changes before writing.', command: 'repo doctor', link: { label: 'Plan adoption', href: '/tasks/adopt-existing' } },
      { title: 'Create a package or app', body: 'Use a known template so names, scripts, and boundaries stay consistent.', command: 'repo new', link: { label: 'Create a project', href: '/tasks/create-project' } },
      { title: 'Run a repository check', body: 'Plan lint, types, builds, and tests before a commit or CI run.', command: 'repo check', link: { label: 'Run checks', href: '/tasks/checks' } },
    ],
  },
  firstRun: {
    title: 'The first useful run takes three commands',
    description: 'Install repoctl in the workspace, initialize its managed defaults, and ask for a diagnosis.',
    steps: [
      { title: 'Install', command: 'pnpm add -D repoctl', body: 'Keep repoctl with the repository so teammates and CI use the same version.' },
      { title: 'Initialize', command: 'pnpm exec repo init', body: 'Review the file plan before adding managed scripts and configuration.' },
      { title: 'Diagnose', command: 'pnpm exec repo doctor', body: 'Use the first blocker as your next task. Run the diagnosis again after each fix.' },
    ],
  },
  evidence: {
    title: 'Start from evidence, not a long setup checklist',
    description: 'The real doctor report shows the repository facts repoctl uses to choose safe next steps.',
    imageAlt: 'A real repoctl doctor report showing repository checks',
    code: 'pnpm exec repo init\npnpm exec repo doctor\npnpm exec repo check --dry-run',
    link: { label: 'Read the diagnosis guide', href: '/start/diagnose' },
  },
  layers: {
    title: 'Go deeper when the task requires it',
    description: 'The rest of the site is grouped by the kind of decision you are making.',
    items: [
      { title: 'Daily tasks', body: 'Adoption, project creation, checks, CI, reports, releases, and troubleshooting.', link: { label: 'Open tasks', href: '/tasks/' } },
      { title: 'Understand the system', body: 'Monorepo boundaries, modern npm packages, templates, and the tools underneath.', link: { label: 'Open Learn', href: '/learn/' } },
      { title: 'Look up exact behavior', body: 'Commands, configuration, output formats, aliases, and execution details.', link: { label: 'Open Reference', href: '/reference/' } },
    ],
  },
} satisfies HomeContent

const chinese = {
  hero: {
    label: 'repoctl 文档',
    title: '你现在要在仓库里做什么？',
    description: '面向 pnpm 与 Turborepo monorepo 的任务型 CLI。先执行一条命令，再根据证据继续。',
  },
  tasks: {
    title: '选择一项任务',
    description: '先选择你要得到的结果，每条路径都会从最小的安全命令开始。',
    items: [
      { title: '新建仓库', body: '先建立共享约定，再开始添加项目。', command: 'repo init', link: { label: '从这里开始', href: '/zh/start/' } },
      { title: '接入已有仓库', body: '先检查当前决策，预览变化后再写入。', command: 'repo doctor', link: { label: '制定接入计划', href: '/zh/tasks/adopt-existing' } },
      { title: '创建包或应用', body: '使用已知模板，让名称、脚本和边界保持一致。', command: 'repo new', link: { label: '创建项目', href: '/zh/tasks/create-project' } },
      { title: '运行仓库校验', body: '提交或运行 CI 前，先规划 lint、类型、构建和测试。', command: 'repo check', link: { label: '运行校验', href: '/zh/tasks/checks' } },
    ],
  },
  firstRun: {
    title: '第一次有效运行只需要三条命令',
    description: '在 workspace 中安装 repoctl，初始化受管默认值，再请求一份诊断报告。',
    steps: [
      { title: '安装', command: 'pnpm add -D repoctl', body: '把 repoctl 保存在仓库中，让成员和 CI 使用相同版本。' },
      { title: '初始化', command: 'pnpm exec repo init', body: '写入受管脚本和配置前，先检查文件计划。' },
      { title: '诊断', command: 'pnpm exec repo doctor', body: '把第一个阻塞项作为下一项任务，修复后再次运行诊断。' },
    ],
  },
  evidence: {
    title: '从证据开始，不必先读完长清单',
    description: '真实的 doctor 报告展示 repoctl 用来选择安全下一步的仓库事实。',
    imageAlt: '真实 repoctl doctor 报告，展示仓库检查结果',
    code: 'pnpm exec repo init\npnpm exec repo doctor\npnpm exec repo check --dry-run',
    link: { label: '阅读诊断指南', href: '/zh/start/diagnose' },
  },
  layers: {
    title: '任务需要时再深入理解',
    description: '网站其余内容按你正在做的决策类型组织，不会把所有命令同时压给新用户。',
    items: [
      { title: '日常任务', body: '接入、创建项目、校验、CI、报告、发布和排障。', link: { label: '打开任务', href: '/zh/tasks/' } },
      { title: '理解系统', body: 'Monorepo 边界、现代 npm 包、模板和底层工具。', link: { label: '打开理解', href: '/zh/learn/' } },
      { title: '查找准确行为', body: '命令、配置、输出格式、别名和执行细节。', link: { label: '打开参考', href: '/zh/reference/' } },
    ],
  },
} satisfies HomeContent

export const homeContent: Record<DocsLocale, HomeContent> = { en: english, zh: chinese }
