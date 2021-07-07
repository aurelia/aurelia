import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  external: Object.keys(pkg.dependencies),
  output: [
    {
      file: 'dist/bundle/index.js',
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/bundle/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/bundle/index.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.build.json',
      inlineSources: true,
    })
  ]
};
