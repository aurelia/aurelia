import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  server: {
    port: Number(process.env.APP_PORT ?? 5173),
    strictPort: true,
  },
  build: {
    minify: false,
    target: 'es2022',
  },
  plugins: [
    aurelia(),
  ],
});
