import { join } from 'path';
import * as rollup from 'rollup';
import project from './project';
import resolve from 'rollup-plugin-node-resolve';
import typescript2 from 'rollup-plugin-typescript2';
import ts from 'typescript';
import { PLATFORM } from '../packages/kernel/src/platform';

async function bundle() {
  for (const pkg of project.packages) {

    const bundle = await rollup.rollup({
      input: join(pkg.src, 'index.ts'),
      plugins: [
        resolve({
          jsnext: true
        }),
        typescript2({
          tsconfig: join(pkg.path, 'tsconfig.json'),
          typescript: ts
        })
      ],
      external: project.packages.filter(p => p.name !== pkg.name).map(p => p.scopedName)
    });

    await bundle.write({
      file: join(pkg.path, 'dist', 'index.es6.js'),
      name: PLATFORM.camelCase(pkg.name),
      format: 'esm',
      sourcemap: 'inline'
    });

    await bundle.write({
      file: join(pkg.path, 'dist', 'index.js'),
      name: PLATFORM.camelCase(pkg.name),
      format: 'umd',
      sourcemap: 'inline'
    });
  }
}

bundle().then(() => {
  console.log('done');
})
