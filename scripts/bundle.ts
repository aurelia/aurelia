import { join } from 'path';
import * as rollup from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import typescript2 from 'rollup-plugin-typescript2';
import ts from 'typescript';
import { c, createLogger } from './logger';
import project from './project';
import { loadPackageJson } from './package.json';

const log = createLogger('bundle');

// automatically sort packages in the correct dependency order by
// reading the package.json dependencies and performing a topological sort
async function sortByDependencies(packages: any[]) {
  const sorted = [];
  const visited = {};

  async function visit(current) {
    const json = await loadPackageJson('packages', current.name);
    const depNames = Object.keys(json.dependencies || {});
    current.deps = packages.filter(p => depNames.indexOf(p.scopedName) !== -1);

    visited[current.name] = true;
    for (const dep of current.deps) {
      if (!visited[dep.name]) {
        await visit(dep);
      }
    }
    if(sorted.indexOf(current) === -1) {
      sorted.push(current);
    }
  }

  for (const pkg of packages) {
    await visit(pkg);
  }
  return sorted;
}

async function createBundle(): Promise<void> {
  const args = process.argv.slice(2);

  const outputs = args[0].split(',');
  let packages = project.packages.slice();
  if (args.length > 1) {
    const filter = args[1].split(',');
    packages = packages.filter(p => filter.indexOf(p.name) !== -1);
  }
  packages = await sortByDependencies(packages);

  const count = packages.length;
  let cur = 0;
  for (const pkg of packages) {
    const logPrefix = c.grey(`[${++cur}/${count}] ${pkg.scopedName}`);
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
          ...project.packages.reduce(
            (g, packg) => {
              g[packg.scopedName] = packg.jsName;
              return g;
            },
            {}
          ),
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
          ...project.packages.reduce(
            (g, packg) => {
              g[packg.scopedName] = packg.jsName;
              return g;
            },
            {}
          ),
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
          ...project.packages.reduce(
            (g, packg) => {
              g[packg.scopedName] = packg.fullName;
              return g;
            },
            {}
          ),
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

    const jitPkg = project.packages.find(p => p.name === 'jit');

    const bundle = await rollup.rollup({
      input: join(jitPkg.src, 'index.full.ts'),
      plugins: [
        resolve({ jsnext: true }),
        typescript2({
          tsconfig: join(jitPkg.path, 'tsconfig.json'),
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

    const fullBundle = jitPkg.iife.replace('jit', 'au.bundle');
    log(`${logPrefix} writing iife - ${fullBundle}`);

    await bundle.write({
      file: fullBundle,
      exports: 'named',
      name: 'au',
      globals: {
        ...project.packages.reduce(
          (g, packg) => {
            g[packg.scopedName] = packg.fullName;
            return g;
          },
          {}
        ),
        'tslib': 'tslib'
      },
      format: 'iife',
      sourcemap: false
    });
  }
}

createBundle();
