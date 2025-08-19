import Vue from '@vitejs/plugin-vue'
import path from 'pathe'
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
  ],
})
