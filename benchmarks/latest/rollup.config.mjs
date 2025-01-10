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
  input: '../app-startup',
  output: '../app-startup/dist/app.latest.js',
}, {
  input: '../app-repeat-ce',
  output: 'dist/app-repeat-ce.latest.js',
}, {
  input: '../app-big-template',
  output: 'dist/app-big-template.latest.js',
}, {
  input: '../app-repeat-keyed-string/startup.index',
  output: '../app-repeat-keyed-string/dist/startup.latest.js',
}, {
  input: '../app-repeat-keyed-expr/startup.index',
  output: '../app-repeat-keyed-expr/dist/startup.latest.js',
}].map(input => ({
  ...input,
  output: {
    file: input.output,
    sourcemap: true
  },
  plugins: [
    alias({
      entries: aliases
    }),
    nodeResolve(),
    terser()
  ]
})));
