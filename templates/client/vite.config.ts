import type { PluginOption } from 'vite'
import path from 'node:path'
import { cloudflare } from '@cloudflare/vite-plugin'
import Tailwindcss from '@tailwindcss/vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'

const ensureVitePlugin = <T>(plugin: T) => plugin as unknown as PluginOption
// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '~': import.meta.dirname,
    },
  },
  plugins: [
    ensureVitePlugin(
      VueRouter(
        {
          dts: path.resolve(import.meta.dirname, 'src/types/typed-router.d.ts'),
        },
      ),
    ),
    ensureVitePlugin(Vue()),
    ensureVitePlugin(VueJsx()),
    ensureVitePlugin(Tailwindcss()),
    ensureVitePlugin(cloudflare()),
    ensureVitePlugin(VueDevTools()),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'query-vendor': ['@tanstack/vue-query'],
          'trpc-vendor': ['@trpc/client'],
        },
      },
    },
  },
  server: {
    // proxy: {
    //   '/api': {
    //     target: `http://localhost:8787`,
    //     changeOrigin: true,
    //     // rewrite: path => path.replace(/^/api/, ''),
    //   },
    // },
  },
})
