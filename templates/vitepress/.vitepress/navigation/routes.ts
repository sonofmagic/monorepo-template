import type { DefaultTheme } from 'vitepress'

export type DocsLocale = 'en' | 'zh'

interface LocalizedText {
  en: string
  zh: string
}

interface RouteItem {
  slug: string
  label: LocalizedText
}

interface RouteSection {
  id: 'repoctl' | 'monorepo' | 'why' | 'ai' | 'tools'
  label: LocalizedText
  items: RouteItem[]
}

const item = (slug: string, en: string, zh: string): RouteItem => ({ slug, label: { en, zh } })

export const routeSections = [
  {
    id: 'repoctl',
    label: { en: 'repoctl', zh: 'repoctl' },
    items: [
      item('', 'Overview', '概览'),
      item('getting-started', 'Getting Started', '快速开始'),
      item('adopt-existing', 'Adopt Existing Repos', '接入已有仓库'),
      item('scenarios', 'Choose By Scenario', '按场景选命令'),
      item('execution-model', 'Execution Model', '执行模型'),
      item('commands', 'Command Reference', '命令速查'),
      item('checks', 'Verification', '校验链路'),
      item('doctor', 'Doctor', 'Doctor 诊断'),
      item('config', 'Configuration', '配置文件'),
      item('templates', 'Templates', '模板与创建'),
      item('template-assets', 'Template Assets', '模板资产治理'),
      item('workflows', 'Workflows and CI', '工作流与 CI'),
      item('reports', 'Reports', '报告与自动化输出'),
      item('troubleshooting', 'Troubleshooting', '排障'),
      item('aliases', 'Command Aliases', '命令别名'),
    ],
  },
  {
    id: 'monorepo',
    label: { en: 'Knowledge Base', zh: '知识库' },
    items: [
      item('', 'Why Monorepo', '为什么使用 Monorepo'),
      item('manage', 'Managing A Monorepo', '管理 Monorepo'),
      item('publish', 'Publishing and Changelogs', '发包与变更日志'),
      item('commands', 'Monorepo Commands', 'Monorepo 命令'),
      item('templates', 'Template Systems', '模板体系'),
      item('troubleshooting', 'Troubleshooting', '常见问题排障'),
    ],
  },
  {
    id: 'why',
    label: { en: 'Modern Packages', zh: '现代 npm 包' },
    items: [
      item('how-to-reuse-js-code', 'Reusing JavaScript', '复用 JavaScript'),
      item('js-cjs-mjs', 'Module Extensions', '模块文件后缀'),
      item('js-keywords', 'Runtime Globals', '运行时关键字'),
      item('what-is-npm-package', 'What Is An npm Package?', '什么是 npm 包'),
      item('publish-basic-npm-package', 'Publishing A Package', '发布 npm 包'),
      item('', 'Package Evolution', '包的演进'),
      item('modern/', 'Modern Package Guide', '现代包指南'),
      item('modern/esm-vs-cjs', 'ESM vs CommonJS', 'ESM 与 CommonJS'),
      item('modern/dts', 'Type Declarations', '类型声明'),
      item('modern/package-entry-points', 'Package Entry Points', '包入口'),
      item('modern/bundlers', 'Bundlers', '构建工具'),
      item('modern/typescript', 'TypeScript', 'TypeScript'),
    ],
  },
  {
    id: 'ai',
    label: { en: 'AI', zh: 'AI' },
    items: [item('', 'AI Documentation', 'AI 文档'), item('llms-txt', 'llms.txt', 'llms.txt')],
  },
  {
    id: 'tools',
    label: { en: 'Tool Guides', zh: '工具专题' },
    items: [
      item('', 'Overview', '概览'),
      item('pnpm', 'pnpm', 'pnpm'),
      item('turborepo', 'Turborepo', 'Turborepo'),
      item('changeset', 'pnpm Versioning', 'pnpm Versioning'),
      item('husky', 'Husky', 'Husky'),
      item('lint-staged', 'lint-staged', 'lint-staged'),
      item('renovate', 'Renovate', 'Renovate'),
      item('llms-txt', 'llms.txt', 'llms.txt'),
    ],
  },
] as const satisfies readonly RouteSection[]

function prefixFor(locale: DocsLocale) {
  return locale === 'zh' ? '/zh' : ''
}

function sectionItems(section: RouteSection, locale: DocsLocale): DefaultTheme.SidebarItem[] {
  const prefix = prefixFor(locale)
  return section.items.map(route => ({
    text: route.label[locale],
    link: `${prefix}/${section.id}/${route.slug}`.replace(/\/+/g, '/'),
  }))
}

export function createSidebars(locale: DocsLocale): DefaultTheme.SidebarMulti {
  const prefix = prefixFor(locale)
  const groups = Object.fromEntries(routeSections.map(section => [
    section.id,
    { text: section.label[locale], items: sectionItems(section, locale) },
  ])) as Record<RouteSection['id'], DefaultTheme.SidebarItem>
  const knowledge = [groups.monorepo, groups.why]

  return {
    [`${prefix}/repoctl/`]: [groups.repoctl],
    [`${prefix}/knowledge/`]: knowledge,
    [`${prefix}/monorepo/`]: knowledge,
    [`${prefix}/why/`]: knowledge,
    [`${prefix}/ai/`]: [groups.ai],
    [`${prefix}/tools/`]: [groups.tools],
    [`${prefix || ''}/`]: [groups.repoctl],
  }
}

export function createNav(locale: DocsLocale): DefaultTheme.NavItem[] {
  const zh = locale === 'zh'
  const prefix = prefixFor(locale)
  return [
    { text: 'repoctl', link: `${prefix}/repoctl/` },
    { text: zh ? '快速开始' : 'Getting Started', link: `${prefix}/repoctl/getting-started` },
    { text: zh ? '命令' : 'Commands', link: `${prefix}/repoctl/commands` },
    { text: zh ? '知识库' : 'Knowledge Base', link: `${prefix}/knowledge/` },
    { text: zh ? 'AI 文档' : 'AI Docs', link: `${prefix}/ai/` },
    { text: zh ? '工具专题' : 'Tool Guides', link: `${prefix}/tools/` },
  ]
}
