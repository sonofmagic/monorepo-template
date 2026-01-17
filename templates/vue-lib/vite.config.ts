import type { PluginOption, UserConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import path from 'pathe'
import { mergeConfig } from 'vite'
import DTS from 'vite-plugin-dts'
import { sharedConfig } from './vite.shared.config'

// 某些插件仍引用旧版 Vite 类型，这里统一断言到当前工程使用的 PluginOption，避免类型不兼容。
const ensureVitePlugin = <T>(plugin: T) => plugin as unknown as PluginOption

export default mergeConfig(sharedConfig, {
  plugins: [
    ensureVitePlugin(Vue()),
    ensureVitePlugin(
      DTS(
        {
          tsconfigPath: './tsconfig.app.json',
          entryRoot: './src',
        },
      ),
    ),
  ],
  // https://vite.dev/guide/build.html#library-mode
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/index'),
      name: 'icebreaker',
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
} satisfies UserConfig)
