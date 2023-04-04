import typescript from '@rollup/plugin-typescript';
import { createRequire } from 'node:module';
import { exec } from 'node:child_process';

const pkg = createRequire(import.meta.url)('./package.json');

export default [
  {
    input: 'src/index.ts',
    external: Object.keys(pkg.dependencies).concat('os', 'path', 'fs', 'http', 'https', 'http2', 'url', 'stream'),
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
  },
  {
    input: 'src/cli.ts',
    external: Object.keys(pkg.dependencies).concat('os', 'path', 'fs', 'http', 'https', 'http2', 'url', 'stream'),
    output: [
      {
        file: 'dist/esm/cli.mjs',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/cjs/cli.cjs',
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
  }
];
