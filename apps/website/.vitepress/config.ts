import Tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
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
          text: '从 0 到 1',
          base: '/why/',
          items: [
            { text: '如何复用 js 代码', link: '/how-to-reuse-js-code' },
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
            { text: '为什么往 monorepo 方向演进', link: '/monorepo' },
            { text: '管理 monorepo', link: '/turborepo' },
            { text: 'monorepo 如何发包和生成变更日志', link: '/changeset' },
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
      Tailwindcss(),
    ],
  },
})
