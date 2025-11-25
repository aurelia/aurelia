import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import fs from 'node:fs';
import path from 'path';
import url from 'url';

// const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const packageNames = [
  'kernel',
  'metadata',
  'expression-parser',
  'runtime',
  'template-compiler',
  'runtime-html',
  'platform',
  'platform-browser',
];

const resolveAlias = name => {
  const localPath = path.resolve(__dirname, `node_modules/@aurelia/${name}/dist/esm/index.mjs`);
  const workspacePath = path.resolve(__dirname, `../../node_modules/@aurelia/${name}/dist/esm/index.mjs`);
  const replacement = [localPath, workspacePath].find(candidate => fs.existsSync(candidate));

  if (!replacement) {
    throw new Error(`Unable to locate build output for @aurelia/${name}. Please run npm install at the repository root.`);
  }

  return {
    find: `@aurelia/${name}`,
    replacement
  };
};

const aliases = packageNames.map(resolveAlias);

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
