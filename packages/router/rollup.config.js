// @ts-check
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

// todo: fix the issue with the tests getting affected by minification
const noMinified = process.env.NO_MINIFIED === 'true';

const tsPluginConfig = typescript({
  tsconfig: 'tsconfig.build.json',
  sourceMap: true,
  include: ['../global.d.ts', 'src/**/*.ts'],
});
const replacePluginCfg = replace({
  values: {
    __DEV__: String(false)
  },
  preventAssignment: true,
});
const terserPluginCfg = terser({
  compress: {
    defaults: false,
  },
  mangle: {
    properties: {
      regex: /^_/
    }
  },
  format: {
    beautify: true,
  },
  keep_classnames: true,
});

export default [{
  input: 'src/index.ts',
  external: Object.keys(pkg.dependencies),
  output: [
    {
      file: `dist/esm/index.js`,
      format: 'es',
      sourcemap: true,
      plugins: noMinified ? [] : [terserPluginCfg]
    },
    {
      file: `dist/cjs/index.js`,
      format: 'cjs',
      sourcemap: true,
      plugins: noMinified ? [] : [terserPluginCfg]
    },
  ],
  plugins: [tsPluginConfig, replacePluginCfg],
}, {
  input: 'src/index.ts',
  external: Object.keys(pkg.dependencies),
  output: [
    {
      file: `dist/esm/index.dev.js`,
      format: 'es',
      sourcemap: true,
    },
    {
      file: `dist/cjs/index.dev.js`,
      format: 'cjs',
      sourcemap: true,
      esModule: true,
    },
  ],
  plugins: [tsPluginConfig, replacePluginCfg],
}];
