// @ts-check
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const BUILD = process.env.BUILD ?? '';
const isDevBuild = BUILD === 'dev';
const isProduction = BUILD === 'prod';
const sourceMap = process.env.MAP === 'true';

export default {
  input: 'src/index.ts',
  external: Object.keys(pkg.dependencies),
  output: [
    {
      file: `dist/esm/index${BUILD ? `.${BUILD}` : ''}.js`,
      format: 'es',
      sourcemap: sourceMap,
    },
    {
      file: `dist/cjs/index${BUILD ? `.${BUILD}` : ''}.js`,
      format: 'cjs',
      sourcemap: sourceMap,
    },
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json',
      sourceMap: sourceMap,
      inlineSources: sourceMap && isDevBuild,
      include: ['../global.d.ts', 'src/**/*.ts'],
    }),
    replace({
      values: {
        // @ts-ignore
        __DEV__: isDevBuild
      },
      preventAssignment: true,
    }),
    isProduction
      ? terser({
          module: true,
          compress: {
            ecma: 2015,
            pure_getters: true
          }
        })
      : null,
  ].filter(Boolean)
};
