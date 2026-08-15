import Tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'
import { withMermaid } from 'vitepress-plugin-mermaid'

interface SidebarLabels {
  repoctl: string
  repoctlItems: string[]
  knowledge: string
  knowledgeItems: string[]
  packages: string
  packageItems: string[]
  ai: string
  aiItems: string[]
  tools: string
  toolItems: string[]
}

const repoctlPaths = [
  '',
  'getting-started',
  'adopt-existing',
  'scenarios',
  'execution-model',
  'commands',
  'checks',
  'doctor',
  'config',
  'templates',
  'template-assets',
  'workflows',
  'reports',
  'troubleshooting',
  'aliases',
]
const knowledgePaths = ['', 'manage', 'publish', 'commands', 'templates', 'troubleshooting']
const packagePaths = [
  'how-to-reuse-js-code',
  'js-cjs-mjs',
  'js-keywords',
  'what-is-npm-package',
  'publish-basic-npm-package',
  'index',
  'modern/',
  'modern/esm-vs-cjs',
  'modern/dts',
  'modern/package-entry-points',
  'modern/bundlers',
  'modern/typescript',
]
const aiPaths = ['', 'llms-txt']
const toolPaths = ['', 'pnpm', 'turborepo', 'changeset', 'husky', 'lint-staged', 'renovate', 'llms-txt']

const englishLabels: SidebarLabels = {
  repoctl: 'repoctl',
  repoctlItems: ['Overview', 'Getting Started', 'Adopt Existing Repos', 'Choose By Scenario', 'Execution Model', 'Command Reference', 'Verification', 'Doctor', 'Configuration', 'Templates', 'Template Assets', 'Workflows and CI', 'Reports', 'Troubleshooting', 'Command Aliases'],
  knowledge: 'Knowledge Base',
  knowledgeItems: ['Why Monorepo', 'Managing A Monorepo', 'Publishing and Changelogs', 'Monorepo Commands', 'Template Systems', 'Troubleshooting'],
  packages: 'Modern Packages',
  packageItems: ['Reusing JavaScript', 'Module Extensions', 'Runtime Globals', 'What Is An npm Package?', 'Publishing A Package', 'Package Evolution', 'Modern Package Guide', 'ESM vs CommonJS', 'Type Declarations', 'Package Entry Points', 'Bundlers', 'TypeScript'],
  ai: 'AI',
  aiItems: ['AI Documentation', 'llms.txt'],
  tools: 'Tool Guides',
  toolItems: ['Overview', 'pnpm', 'Turborepo', 'pnpm Versioning', 'Husky', 'lint-staged', 'Renovate', 'llms.txt'],
}

const chineseLabels: SidebarLabels = {
  repoctl: 'repoctl',
  repoctlItems: ['概览', '快速开始', '接入已有仓库', '按场景选命令', '执行模型', '命令速查', '校验链路', 'Doctor 诊断', '配置文件', '模板与创建', '模板资产治理', '工作流与 CI', '报告与自动化输出', '排障', '命令别名'],
  knowledge: '知识库',
  knowledgeItems: ['为什么使用 Monorepo', '管理 Monorepo', '发包与变更日志', 'Monorepo 命令', '模板体系', '常见问题排障'],
  packages: '现代 npm 包',
  packageItems: ['复用 JavaScript', '模块文件后缀', '运行时关键字', '什么是 npm 包', '发布 npm 包', '包的演进', '现代包指南', 'ESM 与 CommonJS', '类型声明', '包入口', '构建工具', 'TypeScript'],
  ai: 'AI',
  aiItems: ['AI 文档', 'llms.txt'],
  tools: '工具专题',
  toolItems: ['概览', 'pnpm', 'Turborepo', 'pnpm Versioning', 'Husky', 'lint-staged', 'Renovate', 'llms.txt'],
}

function prefixed(prefix: string, section: string, paths: string[], labels: string[]) {
  return paths.map((path, index) => ({
    text: labels[index]!,
    link: `${prefix}/${section}/${path}`.replace(/\/+/g, '/'),
  }))
}

function createSidebars(prefix: '' | '/zh', labels: SidebarLabels) {
  const repoctl = [{ text: labels.repoctl, items: prefixed(prefix, 'repoctl', repoctlPaths, labels.repoctlItems) }]
  const knowledge = [
    { text: labels.knowledge, items: prefixed(prefix, 'monorepo', knowledgePaths, labels.knowledgeItems) },
    { text: labels.packages, items: prefixed(prefix, 'why', packagePaths, labels.packageItems) },
  ]
  const ai = [{ text: labels.ai, items: prefixed(prefix, 'ai', aiPaths, labels.aiItems) }]
  const tools = [{ text: labels.tools, items: prefixed(prefix, 'tools', toolPaths, labels.toolItems) }]
  return {
    [`${prefix}/repoctl/`]: repoctl,
    [`${prefix}/knowledge/`]: knowledge,
    [`${prefix}/monorepo/`]: knowledge,
    [`${prefix}/why/`]: knowledge,
    [`${prefix}/ai/`]: ai,
    [`${prefix}/tools/`]: tools,
    [`${prefix || ''}/`]: repoctl,
  }
}

export default withMermaid(defineConfig({
  outDir: '.vitepress/dist',
  title: 'repoctl',
  description: 'Task-first CLI for initializing, maintaining, validating, and releasing pnpm and Turborepo monorepos.',
  lastUpdated: true,
  cleanUrls: true,
  head: [['link', { rel: 'icon', href: '/logo.jpg' }]],
  themeConfig: {
    logo: '/logo.jpg',
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/sonofmagic/repoctl' }],
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'repoctl',
      description: 'Task-first CLI for practical pnpm and Turborepo monorepos.',
      themeConfig: {
        nav: [
          { text: 'repoctl', link: '/repoctl/' },
          { text: 'Getting Started', link: '/repoctl/getting-started' },
          { text: 'Commands', link: '/repoctl/commands' },
          { text: 'Knowledge Base', link: '/knowledge/' },
          { text: 'AI Docs', link: '/ai/' },
          { text: 'Tool Guides', link: '/tools/' },
        ],
        outline: { label: 'On This Page', level: [2, 3] },
        sidebar: createSidebars('', englishLabels),
        editLink: {
          pattern: 'https://github.com/sonofmagic/repoctl/edit/main/templates/vitepress/:path',
          text: 'Edit this page',
        },
        docFooter: { prev: 'Previous page', next: 'Next page' },
        lastUpdated: { text: 'Last updated' },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: 'repoctl',
      description: '面向 pnpm 与 Turborepo monorepo 的任务型 CLI。',
      themeConfig: {
        nav: [
          { text: 'repoctl', link: '/zh/repoctl/' },
          { text: '快速开始', link: '/zh/repoctl/getting-started' },
          { text: '命令', link: '/zh/repoctl/commands' },
          { text: '知识库', link: '/zh/knowledge/' },
          { text: 'AI 文档', link: '/zh/ai/' },
          { text: '工具专题', link: '/zh/tools/' },
        ],
        outline: { label: '目录', level: [2, 3] },
        sidebar: createSidebars('/zh', chineseLabels),
        editLink: {
          pattern: 'https://github.com/sonofmagic/repoctl/edit/main/templates/vitepress/:path',
          text: '为此页提供修改建议',
        },
        docFooter: { prev: '上一页', next: '下一页' },
        lastUpdated: { text: '最后更新' },
      },
    },
  },
  vite: {
    plugins: [
      // @ts-ignore vitepress-plugin-llms currently exposes Vite 6 plugin types.
      Tailwindcss(),
      llmstxt({
        title: 'repoctl',
        description: 'Task-first CLI for pnpm and Turborepo monorepos. Simplified Chinese documentation is available under /zh/.',
        domain: 'https://repo.icebreaker.top',
        ignoreFiles: [
          'zh/**',
          'en/**',
          'CHANGELOG.md',
          'thinking.md',
          'why/examples/**',
          '.vitepress/**',
          '**/node_modules/**',
          '**/internal/**',
          '**/fixtures/**',
        ],
      }),
    ],
  },
  mermaid: {},
}))
