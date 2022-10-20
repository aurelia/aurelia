import { defineConfig } from 'vite';
import { preprocess } from '@aurelia/plugin-conventions';
import { createFilter } from '@rollup/pluginutils';
import path, { resolve } from 'path';

export default defineConfig({
  mode: 'production',
  server: {
    port: process.env.APP_PORT ?? 5173,
  },
  build: {
    minify: false
  },
  resolve: {
    alias: {
      ...[
        'fetch-client',
        'router-lite',
        'kernel',
        'runtime',
        'runtime-html',
        'router-lite',
      ].reduce((map, pkg) => {
        const name = `@aurelia/${pkg}`;
        map[name] = resolve(__dirname, `../../../node_modules/${name}/dist/esm/index.dev.mjs`);
        return map;
      }, {})
    }
  },
  plugins: [
    au2({ include: 'src/**/*.{ts,js}', pre: true }),
  ]
});

function au2(options = {}) {
  const fs = require('fs');
  const modules = {};
  const filter = createFilter(options.include, options.exclude);
  const findHtmlPartner = (id) => id.replace(/\.[tj]s$/i, '.html');
  const normalize = path => path.replace(/\\/g, '/');

  /** @type {import('rollup').Plugin} */
  const auPlugin = {
    name: 'au2',
    enforce: options.pre ? 'pre' : 'post',
    async transform(code, id) {
      if (!filter(id)) return;

      const result = preprocess({
        path: id,
        contents: code,
        // The enableConventions: true can be removed after this bug fix:
        // https://github.com/aurelia/aurelia/pull/1493
      }, { hmr: false })
      const htmlPartner = findHtmlPartner(id);
      if (fs.existsSync(htmlPartner)) {
        const contents = await fs.promises.readFile(htmlPartner, { encoding: 'utf-8' });
        modules[normalize(htmlPartner.replace(/\.html$/, '\.$au.ts'))] = preprocess({
          path: htmlPartner,
          contents,
        }, { hmr: false });
        result.code = result.code.replace(/from ['"]\.\/(.+)\.html['"]/g, `from './$1.$au.ts'`);
      }
      return result;
    },

    resolveId(id, importer) {
      const fullPath = normalize((id.includes('$au.ts') ? path.resolve(path.dirname(importer), id) : ''));
      if (fullPath in modules) return fullPath;
      return null;
    },

    load(id) {
      return modules[id.replace(/\.html$/, '\.$au.ts')]?.code ?? null;
    }
  };

  return auPlugin;
}


const PREFIX = `\0virtual:`;

/**
 * @param {Record<string, string>} modules
 * @returns {import('rollup').Plugin}
 */
function virtual(modules) {
  const resolvedIds = new Map();

  Object.keys(modules).forEach((id) => {
    resolvedIds.set(path.resolve(id), modules[id]);
  });

  return {
    name: 'virtual',

    resolveId(id, importer) {
      if (id in modules) return PREFIX + id;

      if (importer) {
        const importerNoPrefix = importer.startsWith(PREFIX)
          ? importer.slice(PREFIX.length)
          : importer;
        const resolved = path.resolve(path.dirname(importerNoPrefix), id);
        if (resolvedIds.has(resolved)) return PREFIX + resolved;
      }

      return null;
    },

    load(id) {
      if (id.startsWith(PREFIX)) {
        const idNoPrefix = id.slice(PREFIX.length);

        return idNoPrefix in modules ? modules[idNoPrefix] : resolvedIds.get(idNoPrefix);
      }

      return null;
    }
  };
}
