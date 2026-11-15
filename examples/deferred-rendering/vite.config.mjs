import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  server: {
    port: process.env.APP_PORT ?? 5173,
  },
  // Browsers don't run decorators yet, so they're compiled away in development as well as in the build
  build: {
    target: 'es2022',
  },
  esbuild: {
    target: 'es2022',
  },
  logLevel: 'error',
  plugins: [
    aurelia(),
  ],
});
