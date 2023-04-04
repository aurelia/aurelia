import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  server: {
    port: process.env.APP_PORT ?? 5173,
  },
  resolve: {
    alias: (() => {
      const aliases = {};
      [
        'aurelia',
        'fetch-client',
        'router-lite',
        'platform',
        'platform-browser',
        'router',
        'kernel',
        'metadata',
        'i18n',
        'state',
        'route-recognizer',
        'compat-v1',
        'dialog',
        'runtime',
        'runtime-html',
        'router-lite',
      ].forEach((pkg) => {
        const name = pkg === 'aurelia' ? pkg : `@aurelia/${pkg}`;
        const packageLocation = require.resolve(name);
        aliases[name] = require('path').resolve(packageLocation, `../../esm/index.dev.mjs`);
      });
      return aliases;
    })()
  },
  build: {
    minify: false
  },
  plugins: [
    aurelia()
  ]
});
