import typescript from 'rollup-plugin-typescript2';
import * as RollupUtils from 'rollup-pluginutils';

export default {
  input: 'compiler/index.ts',
  indent: false,
  output: {
    file: 'compiler/dist/aurelia-compiler.js',
    format: 'cjs'
  },
  name: 'core',
  plugins: [
    typescript({
      tsconfig: 'compiler/tsconfig.json',
      tsconfigOverride: {
        compilerOptions: {
          noUnusedLocals: false,
        }
      },
      cacheRoot: '.rollupcache'
    })
  ]
};
