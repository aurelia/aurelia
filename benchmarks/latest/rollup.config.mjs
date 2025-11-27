import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import { existsSync } from 'fs';
import path from 'path';
import url from 'url';

// const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const localNodeModules = path.resolve(__dirname, 'node_modules');
const workspaceNodeModules = path.resolve(__dirname, '../../node_modules');
const hasLocalDevBuild = existsSync(path.join(localNodeModules, '@aurelia', 'runtime-html', 'dist', 'esm', 'index.mjs'));
const aureliaModuleRoot = hasLocalDevBuild ? localNodeModules : workspaceNodeModules;
if (!hasLocalDevBuild) {
  // Keep CI using published @aurelia/* packages (installed in benchmarks/latest),
  // but fall back to workspace builds for local workflows when the dev packages
  // are not installed to avoid hard failures.
  console.warn('[benchmarks/latest] Falling back to workspace @aurelia/* builds; run `npm i` in benchmarks/latest to use published dev packages.');
}
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
  replacement: path.resolve(aureliaModuleRoot, `@aurelia/${name}/dist/esm/index.mjs`)
}));

export default defineConfig([{
  input: '../app-repeat-view',
  output: '../app-repeat-view/dist/app.latest.js',
}, {
  input: '../app-repeat-ce',
  output: '../app-repeat-ce/dist/app.latest.js',
}, {
  input: '../app-repeat-view-big-template',
  output: '../app-repeat-view-big-template/dist/app.latest.js',
}, {
  input: '../app-repeat-view-keyed-string',
  output: '../app-repeat-view-keyed-string/dist/app.latest.js',
}, {
  input: '../app-repeat-view-keyed-expr',
  output: '../app-repeat-view-keyed-expr/dist/app.latest.js',
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
