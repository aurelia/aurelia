// @ts-check
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import { exec } from 'child_process';

const tsPluginConfig = typescript({
  tsconfig: 'tsconfig.build.json',
  sourceMap: true,
  include: ['../global.d.ts', 'src/**/*.ts'],
  noEmitOnError: false,
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
  // mangle: {
  //   properties: {
  //     regex: /^_/,
  //     reserved: ['__esModule']
  //   }
  // },
  format: {
    beautify: true,
  },
  keep_classnames: true,
});

export default {
  input: 'src/index.ts',
  external: Object.keys(pkg.dependencies),
  output: [
    {
      file: `dist/esm/index.dev.js`,
      format: 'es',
      sourcemap: true,
    },
    {
      file: `dist/esm/index.js`,
      format: 'es',
      sourcemap: true,
      plugins: [terserPluginCfg],
    },
    {
      file: `dist/cjs/index.dev.js`,
      format: 'cjs',
      sourcemap: true,
      esModule: true,
      externalLiveBindings: false,
    },
    {
      file: `dist/cjs/index.js`,
      format: 'cjs',
      sourcemap: true,
      externalLiveBindings: false,
      plugins: [terserPluginCfg],
    },
  ],
  plugins: [
    tsPluginConfig,
    replacePluginCfg,
    {
      closeBundle() {
        exec('npm run postrollup')
      }
    }
  ].filter(Boolean),
};
