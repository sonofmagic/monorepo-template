import path from 'node:path'
import { cloudflare } from '@cloudflare/vite-plugin'
import Tailwindcss from '@tailwindcss/vite'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VueRouter(
      {
        dts: path.resolve(import.meta.dirname, 'src/types/typed-router.d.ts'),
      },
    ),
    Vue(),
    Tailwindcss(),
    // @ts-ignore
    cloudflare(),
    // @ts-ignore
    tsconfigPaths(
      {
        root: import.meta.dirname,
      },
    ),
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
