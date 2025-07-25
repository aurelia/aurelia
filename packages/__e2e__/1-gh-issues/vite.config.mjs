import { defineConfig } from 'vite';
import au from '@aurelia/vite-plugin';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: process.env.APP_PORT ?? 5173,
  },
  build: {
    minify: false,
    target: "es2022",
  },
  resolve: {
    alias: {
      ...[
        'fetch-client',
        'router',
        'kernel',
        'expression-parser',
        'runtime',
        'template-compiler',
        'runtime-html',
        'router-direct',
      ].reduce((map, pkg) => {
        const name = `@aurelia/${pkg}`;
        map[name] = resolve(__dirname, `../../../node_modules/${name}/dist/esm/index.dev.mjs`);
        return map;
      }, {})
    }
  },
  plugins: [
    au({ useDev: true })
  ],
  esbuild: {
    target: "es2022"
  },
});
