import path from 'node:path'
import { cloudflare } from '@cloudflare/vite-plugin'
import Tailwindcss from '@tailwindcss/vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'
// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '~': import.meta.dirname,
    },
  },
  plugins: [
    VueRouter(
      {
        dts: path.resolve(import.meta.dirname, 'src/types/typed-router.d.ts'),
      },
    ),
    Vue(),
    // @ts-ignore
    VueJsx(),
    Tailwindcss(),
    // @ts-ignore
    cloudflare(),
    VueDevTools(),
  ],
  server: {
    // proxy: {
    //   '/api': {
    //     target: `http://localhost:8787`,
    //     changeOrigin: true,
    //     // rewrite: path => path.replace(/^\/api/, ''),
    //   },
    // },
  },
})
