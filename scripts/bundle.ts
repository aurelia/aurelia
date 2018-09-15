import { join } from 'path';
import * as rollup from 'rollup';
import project from './project';
import resolve from 'rollup-plugin-node-resolve';
import typescript2 from 'rollup-plugin-typescript2';
import ts from 'typescript';
import { createLogger, c } from './logger';

const log = createLogger('bundle');

async function bundle() {
  const outputs = process.argv.slice(2)[0].split(',');

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
  });
  const count = packages.length;
  let cur = 0;
  for (const pkg of packages) {
    const logPrefix = c.grey(`[${++cur}/${count}] ${pkg.scopedName}`)
    log(`${logPrefix} creating bundle`);

    const bundle = await rollup.rollup({
      input: join(pkg.src, 'index.ts'),
      plugins: [
        resolve({
          jsnext: true // use the jsnext:main field from our packages package.json files to resolve dependencies
        }),
        typescript2({
          tsconfig: join(pkg.path, 'tsconfig.json'),
          typescript: ts, // ensure we're using the same typescript (3.x) for rollup as for regular builds etc
          tsconfigOverride: {
            module: 'esnext',
            stripInternal: true,
            emitDeclarationOnly: false,
            composite: false,
            declaration: false,
            declarationMap: false,
            sourceMap: true
          }
        })
      ],
      // mark all packages that are not *this* package as external so they don't get included in the bundle
      // include tslib in the bundles since only __decorate is really used by multiple packages (we can figure out a way to deduplicate that later on if need be)
      external: project.packages.filter(p => p.name !== pkg.name).map(p => p.scopedName)
    });

//'amd' | 'cjs' | 'system' | 'es' | 'esm' | 'iife' | 'umd'
    if (outputs.indexOf('esm') === -1) {
      log(`${logPrefix} skipping esm`);
    } else {
      log(`${logPrefix} writing esm - ${pkg.es6}`);

      await bundle.write({
        file: pkg.es6,
        name: pkg.jsName,
        format: 'esm',
        sourcemap: true
      });
    }

    if (outputs.indexOf('system') === -1) {
      log(`${logPrefix} skipping system`);
    } else {
      log(`${logPrefix} writing system - ${pkg.system}`);

      await bundle.write({
        file: pkg.system,
        name: pkg.jsName,
        format: 'system',
        sourcemap: true
      });
    }

    if (outputs.indexOf('cjs') === -1) {
      log(`${logPrefix} skipping cjs`);
    } else {
      log(`${logPrefix} writing cjs - ${pkg.cjs}`);

      await bundle.write({
        file: pkg.cjs,
        name: pkg.jsName,
        format: 'cjs',
        sourcemap: true
      });
    }

    if (outputs.indexOf('umd') === -1) {
      log(`${logPrefix} skipping umd`);
    } else {
      log(`${logPrefix} writing umd - ${pkg.umd}`);

      await bundle.write({
        file: pkg.umd,
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
    }

    if (outputs.indexOf('amd') === -1) {
      log(`${logPrefix} skipping amd`);
    } else {
      log(`${logPrefix} writing amd - ${pkg.amd}`);

      await bundle.write({
        file: pkg.amd,
        exports: 'named',
        name: pkg.jsName,
        globals: {
          ...project.packages.reduce((g, pkg) => {
            g[pkg.scopedName] = pkg.jsName;
            return g;
          }, {}),
          'tslib': 'tslib'
        },
        format: 'amd',
        sourcemap: true
      });
    }

    if (outputs.indexOf('iife') === -1) {
      log(`${logPrefix} skipping iife`);
    } else {
      log(`${logPrefix} writing iife - ${pkg.iife}`);

      await bundle.write({
        file: pkg.iife,
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
        sourcemap: false
      });
    }

    log(`${logPrefix} ${c.greenBright('done')}`);
  }


  if (outputs.indexOf('iife') !== -1) {
    const logPrefix = c.grey(`au.bundle.js`);

    log(`${logPrefix} creating iife full bundle`);

    const pkg = project.packages.find(p => p.name === 'jit');

    const bundle = await rollup.rollup({
      input: join(pkg.src, 'index.full.ts'),
      plugins: [
        resolve({ jsnext: true }),
        typescript2({
          tsconfig: join(pkg.path, 'tsconfig.json'),
          typescript: ts,
          tsconfigOverride: {
            module: 'esnext',
            stripInternal: true,
            emitDeclarationOnly: false,
            composite: false,
            declaration: false,
            declarationMap: false
          }
        })
      ]
    });

    const fullBundle = pkg.iife.replace('jit', 'au.bundle');
    log(`${logPrefix} writing iife - ${fullBundle}`);

    await bundle.write({
      file: fullBundle,
      exports: 'named',
      name: 'au',
      globals: {
        ...project.packages.reduce((g, pkg) => {
          g[pkg.scopedName] = pkg.fullName;
          return g;
        }, {}),
        'tslib': 'tslib'
      },
      format: 'iife',
      sourcemap: false
    });
  }
}

bundle();
