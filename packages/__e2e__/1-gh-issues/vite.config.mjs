import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import au from '@aurelia/vite-plugin';

export default defineConfig({
  server: {
    port: process.env.APP_PORT ?? 5173,
  },
  resolve: {
    alias: {
      'conditional-browser-package': resolve(import.meta.dirname, 'vendor/conditional-browser-package'),
    },
  },
  build: {
    minify: false,
    target: "es2022",
  },
  plugins: [
    au({ useDev: true })
  ],
  esbuild: {
    target: "es2022"
  },
});
