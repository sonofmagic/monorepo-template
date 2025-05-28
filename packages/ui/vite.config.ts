import path from 'pathe'
import { mergeConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { sharedConfig } from './vite.shared.config'

export default mergeConfig(sharedConfig, {
  plugins: [
    dts(
      {
        tsconfigPath: './tsconfig.app.json',
        entryRoot: './lib',
      },
    ),
  ],
  // https://vite.dev/guide/build.html#library-mode
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, 'lib/index'),
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
})
