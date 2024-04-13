import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import path from 'path';
import url from 'url';

// const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/** @type {import('rollup').RollupOptions[]} */
export default [{
  input: '../app',
  output: {
    file: 'dist/app.latest.js',
    sourcemap: true
  },
  plugins: [
    alias({
      entries: [
        ...[
          'kernel',
          'metadata',
          'expression-parser',
          'runtime',
          'runtime-html',
          'platform',
          'platform-browser',
        ].map(name => ({
          find: `@aurelia/${name}`,
          replacement: path.resolve(__dirname, `node_modules/@aurelia/${name}/dist/esm/index.mjs`)
        }))
      ]
    }),
    nodeResolve(),
    terser()
  ]
}, {
  input: '../app-big-template',
  output: {
    file: 'dist/app-big-template.latest.js',
    sourcemap: true
  },
  plugins: [
    alias({
      entries: [
        ...[
          'kernel',
          'metadata',
          'expression-parser',
          'runtime',
          'runtime-html',
          'platform',
          'platform-browser',
        ].map(name => ({
          find: `@aurelia/${name}`,
          replacement: path.resolve(__dirname, `node_modules/@aurelia/${name}/dist/esm/index.mjs`)
        }))
      ]
    }),
    nodeResolve(),
    terser()
  ]
}]
