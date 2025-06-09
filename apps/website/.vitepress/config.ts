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
          items: [
            { text: '如何复用 js 代码', link: '/why/how-to-reuse-js-code' },
            { text: '什么是 npm 包', link: '/why/what-is-npm-package' },
            { text: '如何发布 npm 包', link: '/why/publish-basic-npm-package' },
            {
              text: '改进并发布现代 npm 包',
              link: '/why/publish-modern-npm-package',
              items: [
                { text: '添加 DTS', link: '/why/dts' },
                { text: 'ESM vs CJS', link: '/why/esm-vs-cjs' },
                { text: 'package entry points 详解', link: '/why/package-entry-points' },
              ],
            },
            { text: '为什么往 monorepo 方向演进', link: '/why/monorepo' },
            { text: 'monorepo 的管理工具们', link: '/why/turborepo' },
            { text: 'monorepo 如何发包和生成变更日志', link: '/why/turborepo' },
          ],
        },
      ],
    },
  },
  vite: {
    plugins: [
      Tailwindcss(),
    ],
  },
})
