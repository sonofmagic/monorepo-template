import { defineConfig } from 'vite';
import motionCanvas from '@revideo/vite-plugin';

export default defineConfig({
  plugins: [motionCanvas()],
  server: {
    port: 4000
  }
});
