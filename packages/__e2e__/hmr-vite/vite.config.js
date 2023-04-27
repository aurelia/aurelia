import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  server: {
    port: Number(process.env.APP_PORT) ?? 5173,
  },
  build: {
    minify: false
  },
  plugins: [
    aurelia()
  ]
});
