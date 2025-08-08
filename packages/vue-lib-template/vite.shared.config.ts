import Vue from '@vitejs/plugin-vue'
import path from 'pathe'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
// https://vite.dev/guide/build.html#library-mode
import { defineConfig } from 'vite'

export const sharedConfig = defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '~': path.resolve(import.meta.dirname, 'lib'),
    },
  },
  plugins: [
    VueRouter(),
    Vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
