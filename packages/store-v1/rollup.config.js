import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const BUILD = process.env.BUILD ?? '';
const isDevBuild = BUILD === 'dev';
const isProduction = BUILD === 'prod';

export default {
  input: 'src/index.ts',
  external: Object.keys(pkg.dependencies).concat('rxjs/operators', 'rxjs/operators/index.js'),
  output: [
    {
      file: `dist/esm/index${BUILD ? `.${BUILD}` : ''}.js`,
      format: 'es',
      sourcemap: isDevBuild,
    },
    {
      file: `dist/cjs/index${BUILD ? `.${BUILD}` : ''}.js`,
      format: 'cjs',
      sourcemap: isDevBuild,
    },
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json',
      sourceMap: isDevBuild,
      inlineSources: isDevBuild,
      include: ['../global.d.ts', 'src/**/*.ts'],
    }),
    replace({
      values: {
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
