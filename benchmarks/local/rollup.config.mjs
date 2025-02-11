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
  replacement: path.resolve(__dirname, `../../node_modules/@aurelia/${name}/dist/esm/index.mjs`)
}));

export default defineConfig([{
  input: '../app-repeat-view',
  output: '../app-repeat-view/dist/app.local.js',
}, {
  input: '../app-repeat-ce',
  output: '../app-repeat-ce/dist/app.local.js',
}, {
  input: '../app-repeat-view-big-template',
  output: '../app-repeat-view-big-template/dist/app.local.js',
}, {
  input: '../app-repeat-view-keyed-string',
  output: '../app-repeat-view-keyed-string/dist/app.local.js',
}, {
  input: '../app-repeat-view-keyed-expr',
  output: '../app-repeat-view-keyed-expr/dist/app.local.js',
}].map(input => ({
  ...input,
  output: {
    file: input.output,
    sourcemap: true,
  },
  plugins: [
    alias({
      entries: aliases
    }),
    nodeResolve(),
    terser()
  ]
})));
