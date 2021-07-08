import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    external: Object.keys(pkg.dependencies).concat('os', 'path', 'fs', 'http', 'https', 'http2', 'url', 'stream'),
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
  },
  {
    input: 'src/cli.ts',
    external: Object.keys(pkg.dependencies).concat('os', 'path', 'fs', 'http', 'https', 'http2', 'url', 'stream'),
    output: [
      {
        file: 'dist/bundle/cli.js',
        format: 'es',
        sourcemap: true
      },
    ],
    plugins: [
      typescript({
        tsconfig: 'tsconfig.build.json',
        inlineSources: true,
      })
    ]
  }
];
