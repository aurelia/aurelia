import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';
import { exec } from 'child_process';

export default {
  input: 'src/index.ts',
  external: Object.keys(pkg.dependencies).concat('fs', 'path'),
  output: [
    {
      file: 'dist/esm/index.mjs',
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/cjs/index.cjs',
      format: 'cjs',
      sourcemap: true
    },
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json',
      inlineSources: true,
    }),
    {
      closeBundle() {
        exec('npm run postrollup')
      }
    }
  ]
};
