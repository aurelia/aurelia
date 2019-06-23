import ts from 'typescript';
import { OutputOptions, GlobalsOption } from 'rollup';

import { c, createLogger } from './logger';
import { loadPackageJson } from './package.json';
import project from './project';
import { getFiles, File } from './files';

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
  { $format: 'esm',    $exports: 'auto',  $name: 'camel' },
  { $format: 'system', $exports: 'auto',  $name: 'camel' },
  { $format: 'cjs',    $exports: 'auto',  $name: 'camel' },
  { $format: 'umd',    $exports: 'named', $name: 'camel' },
  { $format: 'amd',    $exports: 'named', $name: 'camel' },
  { $format: 'iife',   $exports: 'named', $name: 'iife'  }
] = [
  { $format: 'esm',    $exports: 'auto',  $name: 'camel' },
  { $format: 'system', $exports: 'auto',  $name: 'camel' },
  { $format: 'cjs',    $exports: 'auto',  $name: 'camel' },
  { $format: 'umd',    $exports: 'named', $name: 'camel' },
  { $format: 'amd',    $exports: 'named', $name: 'camel' },
  { $format: 'iife',   $exports: 'named', $name: 'iife'  }
];

const iife_full_packages = ['jit-html-browser'];

async function createBundle(): Promise<void> {
  const args = process.argv.slice(2);
  console.log(args);

  const outputs = args[0].split(',');
  let packages = project.packages.slice().filter(p => p.name.npm !== '@aurelia/__tests__');
  packages = await sortByDependencies(packages);
  if (args.length > 1 && args[1] !== 'all') {
    const filter = args[1].split(',');
    packages = packages.filter(p => filter.indexOf(p.name.kebab) !== -1);
  }

  const globals: GlobalsOption = {
    'tslib': 'tslib'
  };
  for (const pkg of project.packages) {
    globals[pkg.name.npm] = pkg.name.camel;
  }
  const write_iife = outputs.indexOf('iife') !== -1;

  const typeDefFiles = (
    await Promise.all(
      packages.map(async pkg => await getFiles(pkg.dist.path, (dir, name) => /\.d\.ts(?:\.map)?$/.test(name)))
    )
  ).flat();

  await Promise.all(typeDefFiles.map(file => file.readContent()));

  const count = packages.length;
  let cur = 0;
  for (const pkg of packages) {
    const { default: resolve } = await import('rollup-plugin-node-resolve');
    const { default: typescript2 } = await import('rollup-plugin-typescript2');
    const rollup = await import('rollup');

    const logPrefix = c.grey(`[${++cur}/${count}] ${pkg.name.npm}`);

    const external = [
      'jsdom',
      'pixi.js',
      ...project.packages.filter(p => p.name.npm !== pkg.name.npm).map(p => p.name.npm)
    ];
    const plugins = [
      resolve({ jsnext: true }), // use the jsnext:main field from our packages package.json files to resolve dependencies
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
    const standaloneBundle = await rollup.rollup({
      input: pkg.src.entry,
      plugins,
      external
    });

    //'amd' | 'cjs' | 'system' | 'es' | 'esm' | 'iife' | 'umd'

    for (const { $format: format, $exports, $name } of formatDefinitions) {
      if (outputs.indexOf(format) === -1) {
        log(`${logPrefix} skipping ${format}`);
      } else {
        let file = pkg.dist[format];

        log(`${logPrefix} writing ${format} - ${file}`);
        const name = pkg.name[$name];
        const options: OutputOptions = {
          file,
          name,
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
      const fullBundle = await rollup.rollup({
        input: pkg.src.entryFull,
        plugins
      });
      let file = pkg.dist.iifeFull;

      log(`${logPrefix} writing iife - ${file}`);
      const options: OutputOptions = {
        file,
        name: pkg.name.namespace,
        format: 'iife',
        sourcemap: true,
        exports: 'named',
        globals
      };

      await fullBundle.write(options);
    }

    const filesWithChanges: File[] = [];
    await Promise.all(
      typeDefFiles.map(async file => {
        if (await file.hasChanges()) {
          filesWithChanges.push(file);
        }
      })
    );

    log(`${logPrefix} ${filesWithChanges.length} type def files were changed by rollup. ${filesWithChanges.length > 0 ? ' Restoring..' : ''}`);

    await Promise.all(filesWithChanges.map(file => file.restore));

    log(`${logPrefix} ${c.greenBright('done')}`);
  }
}

createBundle();
