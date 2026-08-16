import type { DocsLocale } from '../navigation/routes'
import type { HomeContent } from './types'

const english = {
  hero: {
    label: 'Task-first monorepo operations',
    title: 'Run monorepo work.',
    description: 'One CLI for setup, diagnosis, scaffolding, verification, and release work in pnpm monorepos.',
    primary: { label: 'Get Started', href: '/repoctl/getting-started' },
    secondary: { label: 'Explore Commands', href: '/repoctl/commands' },
    imageAlt: 'A real repoctl doctor report for this workspace',
  },
  proof: ['pnpm-native', 'Turborepo-aware', 'Dry-run first', 'JSON and Markdown reports', 'Built for CI'],
  lifecycle: {
    title: 'A stable task lifecycle',
    description: 'Each command answers one repository question and leaves a reportable result.',
    steps: [
      { title: 'Initialize', body: 'Install managed root assets and the standard repo scripts.', command: 'repo init' },
      { title: 'Diagnose', body: 'Inspect workspace structure, tool versions, hooks, and release configuration.', command: 'repo doctor' },
      { title: 'Create', body: 'Choose a known template and preview every planned file before writing.', command: 'repo new' },
      { title: 'Verify', body: 'Route lint, typecheck, build, test, and tsd through one repeatable plan.', command: 'repo check' },
      { title: 'Release', body: 'Record change intent, version fixed groups, publish, and complete hooks.', command: 'repo release' },
    ],
  },
  paths: {
    title: 'Start where your repository is',
    description: 'repoctl supports greenfield workspaces and careful adoption without forcing the same migration path.',
    items: [
      {
        title: 'Create a new workspace',
        body: 'Bootstrap the managed conventions, then scaffold only the packages and applications you need.',
        commands: ['pnpm create repoctl', 'pnpm run repo:new'],
        href: '/repoctl/getting-started',
        linkLabel: 'Create a repository',
      },
      {
        title: 'Adopt an existing workspace',
        body: 'Capture a redacted baseline, preview asset drift, and opt into changes in reviewable steps.',
        commands: ['repo doctor --markdown --redact', 'repo upgrade --no-overwrite'],
        href: '/repoctl/adopt-existing',
        linkLabel: 'Plan an adoption',
      },
    ],
  },
  capabilities: {
    title: 'Repository work with explicit boundaries',
    description: 'The CLI keeps templates, managed assets, checks, and reports separate so automation stays understandable.',
    items: [
      { title: 'Managed assets', body: 'Compare standard root files before replacing local decisions.' },
      { title: 'Template catalog', body: 'Create libraries, CLIs, services, clients, and docs from named templates.' },
      { title: 'Verification planner', body: 'See the exact task graph in dry-run, JSON, or Markdown before execution.' },
      { title: 'Environment reports', body: 'Share redacted support context without leaking repository paths or tokens.' },
    ],
  },
  commands: {
    title: 'A command map you can remember',
    description: 'Daily commands stay short. Explicit modes are available when scripts need stable output.',
    items: [
      { command: 'repo init', purpose: 'Set up conventions' },
      { command: 'repo doctor', purpose: 'Diagnose repository health' },
      { command: 'repo templates', purpose: 'Inspect available templates' },
      { command: 'repo new', purpose: 'Create a workspace project' },
      { command: 'repo check', purpose: 'Plan or run verification' },
      { command: 'repo env', purpose: 'Report runtime context' },
      { command: 'repo upgrade', purpose: 'Reconcile managed assets' },
      { command: 'repo release', purpose: 'Version and publish packages' },
    ],
  },
  automation: {
    title: 'Readable by people and automation',
    description: 'Preview destructive work, write stable artifacts, and redact support output at the command boundary.',
    formats: ['Terminal', 'JSON', 'Markdown', 'File output'],
    code: 'repo check --full --dry-run --json --out reports/check-plan.json\nrepo env support --markdown --redact --out reports/support.md',
  },
  quickstart: {
    title: 'Get to a useful diagnosis first',
    description: 'Install repoctl locally, inspect the repository, then choose the next task from evidence.',
    code: 'pnpm add -D repoctl\npnpm exec repo init\npnpm exec repo doctor\npnpm exec repo check --dry-run',
    link: { label: 'Read the full setup guide', href: '/repoctl/getting-started' },
  },
  docs: {
    title: 'Continue with the task in front of you',
    description: 'The documentation is organized by repository outcome, with deeper references when you need implementation details.',
    items: [
      { label: 'Choose by scenario', href: '/repoctl/scenarios', body: 'Map a repository goal to the smallest command sequence.' },
      { label: 'Execution model', href: '/repoctl/execution-model', body: 'Understand planning, writes, subprocesses, and output.' },
      { label: 'Configuration', href: '/repoctl/config', body: 'Set defaults without hiding command-line overrides.' },
      { label: 'Workflows and CI', href: '/repoctl/workflows', body: 'Build local and automated verification paths.' },
      { label: 'Troubleshooting', href: '/repoctl/troubleshooting', body: 'Diagnose common setup, template, and release failures.' },
      { label: 'AI documentation', href: '/ai/', body: 'Give coding tools concise or full Markdown context.' },
    ],
  },
} satisfies HomeContent

const chinese = {
  hero: {
    label: '面向任务的 monorepo 操作入口',
    title: '运行 monorepo 工作。',
    description: '用一套 CLI 完成 pnpm monorepo 的初始化、诊断、创建、校验与发布。',
    primary: { label: '快速开始', href: '/zh/repoctl/getting-started' },
    secondary: { label: '查看命令', href: '/zh/repoctl/commands' },
    imageAlt: 'repoctl 对当前仓库生成的真实 doctor 报告',
  },
  proof: ['原生支持 pnpm', '理解 Turborepo', '优先 dry-run', 'JSON 与 Markdown 报告', '适用于 CI'],
  lifecycle: {
    title: '稳定的任务生命周期',
    description: '每条命令回答一个仓库问题，并留下可以复查和保存的结果。',
    steps: [
      { title: '初始化', body: '安装受管根目录资产和标准 repo 脚本。', command: 'repo init' },
      { title: '诊断', body: '检查 workspace 结构、工具版本、hooks 与发布配置。', command: 'repo doctor' },
      { title: '创建', body: '选择已知模板，在写入前预览完整文件计划。', command: 'repo new' },
      { title: '校验', body: '用一份可复现计划串联 lint、typecheck、build、test 与 tsd。', command: 'repo check' },
      { title: '发布', body: '记录变更意图、更新固定版本组、发布并执行收尾 hook。', command: 'repo release' },
    ],
  },
  paths: {
    title: '从仓库当前状态开始',
    description: 'repoctl 同时支持新建项目和渐进接入，不强迫两类仓库走同一条迁移路线。',
    items: [
      {
        title: '创建新 workspace',
        body: '先生成受管约定，再按需创建具体的包和应用。',
        commands: ['pnpm create repoctl', 'pnpm run repo:new'],
        href: '/zh/repoctl/getting-started',
        linkLabel: '创建仓库',
      },
      {
        title: '接入已有 workspace',
        body: '保存脱敏基线，预览资产差异，再用可审查的小步骤逐项接入。',
        commands: ['repo doctor --markdown --redact', 'repo upgrade --no-overwrite'],
        href: '/zh/repoctl/adopt-existing',
        linkLabel: '制定接入计划',
      },
    ],
  },
  capabilities: {
    title: '边界清楚的仓库任务',
    description: '模板、受管资产、校验与报告相互独立，让自动化保持透明。',
    items: [
      { title: '受管资产', body: '覆盖本地决策前，先比较标准根目录文件。' },
      { title: '模板目录', body: '按名称创建类库、CLI、服务、客户端与文档站。' },
      { title: '校验计划', body: '执行前通过 dry-run、JSON 或 Markdown 查看完整任务图。' },
      { title: '环境报告', body: '隐藏仓库路径和 token 后再共享排障上下文。' },
    ],
  },
  commands: {
    title: '记得住的命令地图',
    description: '日常入口保持简短，脚本需要稳定输出时再使用显式模式。',
    items: [
      { command: 'repo init', purpose: '建立仓库约定' },
      { command: 'repo doctor', purpose: '诊断仓库健康状态' },
      { command: 'repo templates', purpose: '查看可用模板' },
      { command: 'repo new', purpose: '创建 workspace 项目' },
      { command: 'repo check', purpose: '规划或执行校验' },
      { command: 'repo env', purpose: '输出运行环境' },
      { command: 'repo upgrade', purpose: '同步受管资产' },
      { command: 'repo release', purpose: '更新版本并发布' },
    ],
  },
  automation: {
    title: '同时服务人和自动化',
    description: '在命令边界预览写入、保存稳定产物，并对支持信息执行脱敏。',
    formats: ['终端', 'JSON', 'Markdown', '文件输出'],
    code: 'repo check --full --dry-run --json --out reports/check-plan.json\nrepo env support --markdown --redact --out reports/support.md',
  },
  quickstart: {
    title: '先得到一份有效诊断',
    description: '本地安装 repoctl，检查仓库，再根据证据选择下一项任务。',
    code: 'pnpm add -D repoctl\npnpm exec repo init\npnpm exec repo doctor\npnpm exec repo check --dry-run',
    link: { label: '阅读完整安装指南', href: '/zh/repoctl/getting-started' },
  },
  docs: {
    title: '继续处理眼前的任务',
    description: '文档按仓库目标组织，需要实现细节时再进入对应参考页。',
    items: [
      { label: '按场景选命令', href: '/zh/repoctl/scenarios', body: '把仓库目标映射为最短命令链路。' },
      { label: '执行模型', href: '/zh/repoctl/execution-model', body: '理解计划、写入、子进程和输出。' },
      { label: '配置文件', href: '/zh/repoctl/config', body: '设置默认值，同时保留命令行覆盖。' },
      { label: '工作流与 CI', href: '/zh/repoctl/workflows', body: '建立本地和自动化校验路径。' },
      { label: '排障', href: '/zh/repoctl/troubleshooting', body: '诊断常见的安装、模板与发布问题。' },
      { label: 'AI 文档', href: '/zh/ai/', body: '为编程工具提供精简或完整 Markdown 上下文。' },
    ],
  },
} satisfies HomeContent

export const homeContent: Record<DocsLocale, HomeContent> = { en: english, zh: chinese }
