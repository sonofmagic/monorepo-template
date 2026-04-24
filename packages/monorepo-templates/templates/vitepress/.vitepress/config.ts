import Tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  outDir: '.vitepress/dist',
  title: 'icebreaker\'s monorepo',
  description: 'A practical pnpm + turbo monorepo template with short onboarding commands and repo tooling.',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '开始使用', link: '/' },
      { text: 'Monorepo', link: '/monorepo/' },
      { text: '工具专题', link: '/tools/turborepo' },
      { text: '一些思考', link: '/thinking' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/sonofmagic/monorepo-template' },
    ],
    outline: {
      label: '目录',
      level: [2, 3],
    },
    logo: '/logo.jpg',
    sidebar: {
      '/': [
        {
          text: '开始使用',
          items: [
            { text: '首页', link: '/' },
            { text: '一些思考', link: '/thinking' },
          ],
        },
        {
          text: 'Monorepo',
          items: [
            { text: '为什么往 monorepo 方向演进', link: '/monorepo/' },
            { text: '如何管理 monorepo', link: '/monorepo/manage' },
            { text: '命令速查', link: '/monorepo/commands' },
            { text: '常见问题排障', link: '/monorepo/troubleshooting' },
            { text: '发包与变更日志', link: '/monorepo/publish' },
          ],
        },
        {
          text: 'npm 与包',
          items: [
            { text: '如何复用 js 代码', link: '/why/how-to-reuse-js-code' },
            { text: 'JS 文件的各种后缀', link: '/why/js-cjs-mjs' },
            { text: 'CJS 和 ESM 关键字/全局变量对比', link: '/why/js-keywords' },
            { text: '什么是 npm 包', link: '/why/what-is-npm-package' },
            { text: '如何发布 npm 包', link: '/why/publish-basic-npm-package' },
            { text: '改进并发布现代 npm 包', link: '/why/index' },
          ],
        },
        {
          text: '相关的工具',
          items: [
            { text: 'pnpm', link: '/tools/pnpm' },
            { text: 'turborepo', link: '/tools/turborepo' },
            { text: 'changeset', link: '/tools/changeset' },
            { text: 'husky', link: '/tools/husky' },
            { text: 'lint-staged', link: '/tools/lint-staged' },
            { text: 'renovate', link: '/tools/renovate' },
          ],
        },
      ],
    },
    editLink: {
      pattern: 'https://github.com/sonofmagic/monorepo-template/edit/main/templates/vitepress/:path',
      text: '为此页提供修改建议',
    },
  },
  vite: {
    plugins: [
      // @ts-ignore
      Tailwindcss(),
    ],
    // server: {
    //   hmr: {
    //     overlay: false,
    //   },
    // },
  },
  mermaid: {

  },
}),
)
