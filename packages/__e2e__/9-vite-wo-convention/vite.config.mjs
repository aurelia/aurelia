import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  server: {
    port: process.env.APP_PORT ?? 5173,
  },
  build: {
    minify: false,
    target: "es2022",
  },
  plugins: [
    aurelia({ enableConventions: false, hmr: true })
  ],
  esbuild: {
    target: "es2022"
  },
});
