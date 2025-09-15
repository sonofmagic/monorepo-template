import path from 'node:path'
import { port } from '@icebreakers/server/config'
import Tailwindcss from '@tailwindcss/vite'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'

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
  ],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${port}`,
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
