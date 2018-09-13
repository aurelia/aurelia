import { join } from 'path';
import * as rollup from 'rollup';
import project from './project';
import resolve from 'rollup-plugin-node-resolve';
import typescript2 from 'rollup-plugin-typescript2';
import ts from 'typescript';
import { createLogger, c } from './logger';

const log = createLogger('bundle');

async function bundle() {
  // ensure the bundles are created in the correct order of dependency
  const packages = project.packages.slice().sort((a, b) => {
    switch (a.name) {
      case 'kernel':
        return 0;
      case 'runtime':
        return 1;
      case 'debug':
      case 'jit':
      case 'plugin-requirejs':
      case 'plugin-svg':
      case 'router':
        return 2;
      case 'aot':
        return 3;
    }
  })
  for (const pkg of packages) {
    log(`${c.green(pkg.scopedName)} creating regular bundles`);

    const input = join(pkg.src, 'index.ts');
    const plugins = [
      resolve({
        jsnext: true // use the jsnext:main field from our packages package.json files to resolve dependencies
      }),
      typescript2({
        tsconfig: join(pkg.path, 'tsconfig.json'),
        typescript: ts // ensure we're using the same typescript (3.x) for rollup as for regular builds etc
      })
    ];

    // mark all packages that are not *this* package as external so they don't get included in the bundle
    // include tslib in the bundles since only __decorate is really used by multiple packages (we can figure out a way to deduplicate that later on if need be)
    const external = project.packages.filter(p => p.name !== pkg.name).map(p => p.scopedName);

    let bundle = await rollup.rollup({ input, plugins, external });

    let file = join(pkg.path, 'dist', 'index.es6.js');

    log(`${c.green(pkg.scopedName)} writing ${file}`);

    await bundle.write({
      file,
      name: pkg.jsName,
      format: 'esm',
      sourcemap: true
    });

    file = join(pkg.path, 'dist', 'index.js');

    log(`${c.green(pkg.scopedName)} writing ${file}`);

    await bundle.write({
      file,
      exports: 'named',
      name: pkg.jsName,
      globals: {
        ...project.packages.reduce((g, pkg) => {
          g[pkg.scopedName] = pkg.jsName;
          return g;
        }, {}),
        'tslib': 'tslib'
      },
      format: 'umd',
      sourcemap: true
    });

    log(`${c.green(pkg.scopedName)} creating iife bundle`);

    bundle = await rollup.rollup({ input, plugins, external });

    file = join(pkg.path, 'dist', 'index.iife.js');

    log(`${c.green(pkg.scopedName)} writing ${file}`);

    await bundle.write({
      file,
      exports: 'named',
      name: pkg.fullName,
      globals: {
        ...project.packages.reduce((g, pkg) => {
          g[pkg.scopedName] = pkg.fullName;
          return g;
        }, {}),
        'tslib': 'tslib'
      },
      format: 'iife',
      sourcemap: true
    });
  }
}

bundle().then(() => {
  console.log('done');
})
