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
    const json = await loadPackageJson('packages', current.name.kebab);
    const depNames = Object.keys(json.dependencies || {});
    current.deps = packages.filter(p => depNames.indexOf(p.name.npm) !== -1);

    visited[current.name.kebab] = true;
    for (const dep of current.deps) {
      if (!visited[dep.name.kebab]) {
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

const formatDefinitions: [
  { format: 'esm',    $exports: 'auto',  name: 'camel'  },
  { format: 'system', $exports: 'auto',  name: 'camel'  },
  { format: 'cjs',    $exports: 'auto',  name: 'camel'  },
  { format: 'umd',    $exports: 'named', name: 'camel'  },
  { format: 'amd',    $exports: 'named', name: 'camel'  },
  { format: 'iife',   $exports: 'named', name: 'iife' }
] = [
  { format: 'esm',    $exports: 'auto',  name: 'camel'  },
  { format: 'system', $exports: 'auto',  name: 'camel'  },
  { format: 'cjs',    $exports: 'auto',  name: 'camel'  },
  { format: 'umd',    $exports: 'named', name: 'camel'  },
  { format: 'amd',    $exports: 'named', name: 'camel'  },
  { format: 'iife',   $exports: 'named', name: 'iife' }
];

const iife_full_packages = ['jit-html'];

async function createBundle(): Promise<void> {
  const args = process.argv.slice(2);

  const outputs = args[0].split(',');
  let packages = project.packages.slice();
  if (args.length > 1) {
    const filter = args[1].split(',');
    packages = packages.filter(p => filter.indexOf(p.name.camel) !== -1);
  }
  packages = await sortByDependencies(packages);

  const globals: rollup.GlobalsOption = {
    'tslib': 'tslib'
  };
  for (const pkg of packages) {
    globals[pkg.name.npm] = pkg.name.camel;
  }
  const write_iife = outputs.indexOf('iife') !== -1;

  const count = packages.length;
  let cur = 0;
  for (const pkg of packages) {
    const logPrefix = c.grey(`[${++cur}/${count}] ${pkg.name.npm}`);

    const external = packages.filter(p => p !== pkg).map(p => p.name.npm);
    const plugins = [
      resolve({jsnext: true }), // use the jsnext:main field from our packages package.json files to resolve dependencies
      typescript2({
        tsconfig: pkg.tsconfig,
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
    ];

    log(`${logPrefix} creating standalone bundle`);

    const standaloneBundle = await rollup.rollup({ input: pkg.src.entry, plugins, external });

    //'amd' | 'cjs' | 'system' | 'es' | 'esm' | 'iife' | 'umd'

    for (const { format, $exports, name } of formatDefinitions) {
      if (outputs.indexOf(format) === -1) {
        log(`${logPrefix} skipping ${format}`);
      } else {
        log(`${logPrefix} writing ${format} - ${pkg.dist[format]}`);

        const options: rollup.OutputOptions = {
          file: pkg.dist[format],
          name: pkg.name[name],
          format,
          sourcemap: true
        };
        if ($exports === 'named') {
          options.exports = 'named';
          options.globals = globals;
        }
        await standaloneBundle.write(options);
      }
    }

    if (write_iife && iife_full_packages.indexOf(pkg.name.kebab) !== -1) {
      log(`${logPrefix} creating iife full bundle`);

      const fullBundle = await rollup.rollup({ input: pkg.src.entryFull, plugins });

      log(`${logPrefix} writing iife - ${pkg.dist.iifeFull}`);

      const options: rollup.OutputOptions = {
        file: pkg.dist.iifeFull,
        name: pkg.name.namespace,
        format: 'iife',
        sourcemap: false,
        exports: 'named',
        globals
      };

      await fullBundle.write(options);
    }

    log(`${logPrefix} ${c.greenBright('done')}`);
  }
}

createBundle();
