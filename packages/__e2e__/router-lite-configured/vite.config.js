import { defineConfig } from 'vite';
import { preprocess } from '@aurelia/plugin-conventions';
import { createFilter } from '@rollup/pluginutils';

export default defineConfig({
  server: {
    port: process.env.APP_PORT ?? 5173,
  },
  resolve: {
    alias: {
      '@aurelia/router-lite': '/../../../node_modules/@aurelia/router-lite/dist/esm/index.dev.mjs'
    }
  },
  plugins: [
    au2({ include: 'src/**/*.ts', pre: true }),
    au2({ include: 'src/**/*.html' }),
    {
      name: 'route-fallback',
      configureServer(server) {
        server.middlewares.use('/*', (req, res, next) => {
          req.url = '/'
          next()
        })
      }
    }
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
      }, { hmr: false })
      return result;
    }
  };
}