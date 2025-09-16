import Tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  outDir: '../../dist',
  title: 'icebreaker\'s monorepo',
  description: 'icebreaker\'s monorepo. upgrade your monorepo',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '使用手册', link: '/' },
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
        { text: '使用手册', link: '/' },
        { text: '一些思考', link: 'thinking' },
        {
          text: 'npm 发包',
          base: '/why/',
          items: [
            { text: '如何复用 js 代码', link: '/how-to-reuse-js-code' },
            { text: 'JS 文件的各种后缀', link: '/js-cjs-mjs' },
            { text: 'CJS和ESM关键字/全局变量对比', link: '/js-keywords' },
            { text: '什么是 npm 包', link: '/what-is-npm-package' },
            { text: '如何发布 npm 包', link: '/publish-basic-npm-package' },
            {
              text: '改进并发布现代 npm 包',
              link: 'index',
              base: 'why/modern/',
              items: [
                { text: 'package entry points 字段', link: '/package-entry-points' },
                { text: '添加 DTS', link: '/dts' },
                { text: 'ESM vs CJS', link: '/esm-vs-cjs' },
                { text: '使用 TypeScript', link: '/typescript' },
                { text: '使用打包器', link: '/bundlers' },
              ],
            },
          ],
        },
        {
          text: 'Monorepo',
          base: '/monorepo/',
          items: [
            { text: '为什么往 monorepo 方向演进', link: '/' },
            { text: '如何管理 monorepo', link: '/manage' },
            { text: 'monorepo 发包生成变更日志', link: '/publish' },
          ],
        },
        {
          text: '相关的工具',
          base: '/tools/',
          items: [
            { text: 'pnpm', link: '/pnpm' },
            { text: 'turborepo', link: '/turborepo' },
            { text: 'changeset', link: '/changeset' },
            { text: 'husky', link: '/husky' },
            { text: 'lint-staged', link: '/lint-staged' },
            { text: 'renovate', link: '/renovate' },
          ],
        },
      ],
    },
    editLink: {
      pattern: 'https://github.com/sonofmagic/monorepo-template/edit/main/apps/website/:path',
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
