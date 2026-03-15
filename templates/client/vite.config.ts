import path from 'node:path'
import { cloudflare } from '@cloudflare/vite-plugin'
import Tailwindcss from '@tailwindcss/vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import VueRouter from 'vue-router/vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    target: 'baseline-widely-available',
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '~': import.meta.dirname,
    },
  },
  plugins: [
    VueRouter(
      {
        dts: path.resolve(import.meta.dirname, 'src/route-map.d.ts'),
      },
    ),
    Vue(),
    VueJsx(),
    Tailwindcss(),
    cloudflare(),
    VueDevTools(),
  ],
})
