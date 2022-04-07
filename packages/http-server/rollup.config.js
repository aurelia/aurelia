import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';
import { exec } from 'child_process';

export default [
  {
    input: 'src/index.ts',
    external: Object.keys(pkg.dependencies).concat('os', 'path', 'fs', 'http', 'https', 'http2', 'url', 'stream'),
    output: [
      {
        file: 'dist/esm/index.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/cjs/index.js',
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
  },
  {
    input: 'src/cli.ts',
    external: Object.keys(pkg.dependencies).concat('os', 'path', 'fs', 'http', 'https', 'http2', 'url', 'stream'),
    output: [
      {
        file: 'dist/esm/cli.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/cjs/cli.js',
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
  }
];
