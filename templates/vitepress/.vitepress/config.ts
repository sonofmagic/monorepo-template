import Tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

const repoctlSidebar = [
  {
    text: 'repoctl',
    items: [
      { text: '概览', link: '/repoctl/' },
      { text: '快速开始', link: '/repoctl/getting-started' },
      { text: '接入已有仓库', link: '/repoctl/adopt-existing' },
      { text: '按场景选命令', link: '/repoctl/scenarios' },
      { text: '命令速查', link: '/repoctl/commands' },
      { text: '配置文件', link: '/repoctl/config' },
      { text: '模板与创建', link: '/repoctl/templates' },
      { text: '工作流与 CI', link: '/repoctl/workflows' },
      { text: '排障与报告', link: '/repoctl/troubleshooting' },
      { text: '命令别名', link: '/repoctl/aliases' },
    ],
  },
  {
    text: '知识库',
    items: [
      { text: '为什么往 monorepo 方向演进', link: '/monorepo/' },
      { text: '如何管理 monorepo', link: '/monorepo/manage' },
      { text: '发包与变更日志', link: '/monorepo/publish' },
      { text: '如何复用 js 代码', link: '/why/how-to-reuse-js-code' },
      { text: 'JS 文件的各种后缀', link: '/why/js-cjs-mjs' },
      { text: 'CJS 和 ESM 关键字/全局变量对比', link: '/why/js-keywords' },
      { text: '什么是 npm 包', link: '/why/what-is-npm-package' },
      { text: '如何发布 npm 包', link: '/why/publish-basic-npm-package' },
      { text: '改进并发布现代 npm 包', link: '/why/index' },
    ],
  },
  {
    text: '工具专题',
    items: [
      { text: 'pnpm', link: '/tools/pnpm' },
      { text: 'turborepo', link: '/tools/turborepo' },
      { text: 'changeset', link: '/tools/changeset' },
      { text: 'husky', link: '/tools/husky' },
      { text: 'lint-staged', link: '/tools/lint-staged' },
      { text: 'renovate', link: '/tools/renovate' },
    ],
  },
]

const enSidebar = [
  {
    text: 'repoctl',
    items: [
      { text: 'Overview', link: '/en/repoctl/' },
      { text: 'Getting Started', link: '/en/repoctl/getting-started' },
      { text: 'Adopt Existing Repos', link: '/en/repoctl/adopt-existing' },
      { text: 'Choose By Scenario', link: '/en/repoctl/scenarios' },
      { text: 'Command Reference', link: '/en/repoctl/commands' },
      { text: 'Configuration', link: '/en/repoctl/config' },
      { text: 'Templates', link: '/en/repoctl/templates' },
      { text: 'Workflows and CI', link: '/en/repoctl/workflows' },
      { text: 'Troubleshooting', link: '/en/repoctl/troubleshooting' },
      { text: 'Command Aliases', link: '/en/repoctl/aliases' },
    ],
  },
  {
    text: 'Knowledge Base',
    items: [
      { text: 'Why Monorepo', link: '/en/knowledge/monorepo' },
    ],
  },
]

export default withMermaid(defineConfig({
  outDir: '.vitepress/dist',
  title: 'repoctl',
  description: 'repoctl documentation for practical pnpm and Turborepo monorepos.',
  lastUpdated: true,
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', href: '/logo.jpg' }],
  ],
  themeConfig: {
    logo: '/logo.jpg',
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/sonofmagic/monorepo-template' },
    ],
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'repoctl',
      description: '围绕 repoctl 的 pnpm + Turborepo monorepo 使用文档。',
      themeConfig: {
        nav: [
          { text: 'repoctl', link: '/repoctl/' },
          { text: '快速开始', link: '/repoctl/getting-started' },
          { text: '命令', link: '/repoctl/commands' },
          { text: '知识库', link: '/monorepo/' },
          { text: '工具专题', link: '/tools/turborepo' },
        ],
        outline: {
          label: '目录',
          level: [2, 3],
        },
        sidebar: {
          '/': repoctlSidebar,
        },
        editLink: {
          pattern: 'https://github.com/sonofmagic/monorepo-template/edit/main/templates/vitepress/:path',
          text: '为此页提供修改建议',
        },
        docFooter: {
          prev: '上一页',
          next: '下一页',
        },
        lastUpdated: {
          text: '最后更新',
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'repoctl',
      description: 'Documentation for using repoctl in practical pnpm and Turborepo monorepos.',
      themeConfig: {
        nav: [
          { text: 'repoctl', link: '/en/repoctl/' },
          { text: 'Getting Started', link: '/en/repoctl/getting-started' },
          { text: 'Commands', link: '/en/repoctl/commands' },
          { text: 'Knowledge Base', link: '/en/knowledge/monorepo' },
        ],
        outline: {
          label: 'On This Page',
          level: [2, 3],
        },
        sidebar: {
          '/en/': enSidebar,
        },
        editLink: {
          pattern: 'https://github.com/sonofmagic/monorepo-template/edit/main/templates/vitepress/:path',
          text: 'Edit this page',
        },
        docFooter: {
          prev: 'Previous page',
          next: 'Next page',
        },
        lastUpdated: {
          text: 'Last updated',
        },
      },
    },
  },
  vite: {
    plugins: [
      // @ts-ignore
      Tailwindcss(),
    ],
  },
  mermaid: {},
}))
