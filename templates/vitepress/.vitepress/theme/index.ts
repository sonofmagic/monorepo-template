import type { EnhanceAppContext, Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import HomePage from './components/HomePage.vue'
import './tailwind.css'
import './home/index.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('HomePage', HomePage)
  },
} satisfies Theme
