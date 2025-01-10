import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import path from 'path';
import url from 'url';

// const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const aliases = [
  'kernel',
  'metadata',
  'expression-parser',
  'runtime',
  'template-compiler',
  'runtime-html',
  'platform',
  'platform-browser',
].map(name => ({
  find: `@aurelia/${name}`,
  replacement: path.resolve(__dirname, `node_modules/@aurelia/${name}/dist/esm/index.mjs`)
}));

export default defineConfig([{
  input: '../app',
  output: {
    file: 'dist/app.latest.js',
    sourcemap: true
  },
}, {
  input: '../app-repeat-ce',
  output: {
    file: 'dist/app-repeat-ce.latest.js',
    sourcemap: true
  },
}, {
  input: '../app-big-template',
  output: {
    file: 'dist/app-big-template.latest.js',
    sourcemap: true
  },
}, {
  input: '../app-repeat-keyed-string/startup.index',
  output: {
    file: '../app-repeat-keyed-string/dist/startup.latest.js',
    sourcemap: true
  },
}, {
  input: '../app-repeat-keyed-expr/startup.index',
  output: {
    file: '../app-repeat-keyed-expr/dist/startup.latest.js',
    sourcemap: true
  },
}].map(input => ({
  ...input,
  plugins: [
    alias({
      entries: aliases
    }),
    nodeResolve(),
    terser()
  ]
})));
