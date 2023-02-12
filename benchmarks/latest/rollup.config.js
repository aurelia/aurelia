import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import path from 'path';

/** @type {import('rollup').RollupOptions} */
export default {
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
}
