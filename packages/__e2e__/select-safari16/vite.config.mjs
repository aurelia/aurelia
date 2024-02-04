import { defineConfig } from 'vite';
import { preprocess } from '@aurelia/plugin-conventions';
import { createFilter } from '@rollup/pluginutils';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: process.env.APP_PORT ?? 5173,
  },
  resolve: {
    alias: {
      ...[
        'fetch-client',
        'router-lite',
        'kernel',
        'runtime',
        'runtime-html',
        'router',
      ].reduce((map, pkg) => {
        const name = `@aurelia/${pkg}`;
        map[name] = resolve(__dirname, `../../../node_modules/${name}/dist/esm/index.dev.mjs`);
        return map;
      }, {})
    }
  },
  plugins: [
    au2({ include: 'src/**/*.ts', pre: true }),
    au2({ include: 'src/**/*.html' }),
  ]
});

function au2(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'au2',
    enforce: options.pre ? 'pre' : 'post',
    transform(code, id) {
      if (!filter(id)) return;
      const result = preprocess({
        path: id,
        contents: code
        // The enableConventions: true can be removed after this bug fix:
        // https://github.com/aurelia/aurelia/pull/1493
      }, { hmr: false });
      return result;
    }
  };
}
