import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  outDir: '../../dist',
  title: 'icebreaker\'s monorepo',
  description: 'icebreaker\'s monorepo. upgrade your monorepo',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '思考', link: '/thinking' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/sonofmagic/monorepo-template' },
    ],
    outline: {
      label: '目录',
      level: [2, 3],
    },
    logo: '/logo.jpg',
  },
})
