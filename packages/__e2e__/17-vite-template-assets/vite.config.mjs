import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  build: {
    assetsInlineLimit: 0,
    target: 'es2022',
  },
  plugins: [
    aurelia(),
  ],
});
