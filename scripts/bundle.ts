import { c, createLogger } from './logger';
import { loadPackageJson } from './package.json';
import project from './project';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript2 from 'rollup-plugin-typescript2';
import * as rollup from 'rollup';
import ts from 'typescript';
import { readFile } from 'fs';


const log = createLogger('bundle');

async function getTerserOptions(file: string) {
  const content = await new Promise<string>((resolve, reject) => {
    readFile(file, (err, data) => {
      if (err) {
        reject(err);
      }
      const str = data.toString('utf8');
      resolve(str);
    })
  });
  log('Finding exported identifiers to exclude from mangling');
  const prefixes = project.packages.map(p => p.name.camel).concat('au', 'exports');
  const regex = new RegExp(`(?:${prefixes.join('|')})\\.([a-zA-Z$_][a-zA-Z0-9$_]+)\\s*=`, 'g');
  const exclusions = new Set<string>();
  let m: RegExpExecArray;

  do {
    m = regex.exec(content);
    if (m !== null) {
      exclusions.add(m[1]);
    }
  } while (m !== null)
  const result = Array.from(exclusions).sort();
  log(`Detected the following exports:\n  ${result.join('\n  ')}`);

  const terserOpts = {
    parse: {
      bare_returns: false,
      ecma: 8,
      html5_comments: false,
      shebang: false
    },
    compress: {
      arrows: true,
      arguments: true,
      booleans: true,
      booleans_as_integers: true,
      collapse_vars: true,
      comparisons: true,
      computed_props: true,
      conditionals: true,
      dead_code: true,
      defaults: true,
      directives: true,
      drop_console: true,
      drop_debugger: true,
      ecma: 8,
      evaluate: true,
      expression: false,
      global_defs: {
        'Tracer.enabled': false
      },
      hoist_funs: true,
      hoist_props: true,
      hoist_vars: false,
      if_return: true,
      inline: true,
      join_vars: true,
      keep_classnames: false,
      keep_fargs: false,
      keep_fnames: false,
      keep_infinity: false,
      loops: true,
      module: false,
      negate_iife: false,
      passes: 2,
      properties: true,
      pure_funcs: null,
      pure_getters: 'strict',
      reduce_funcs: true,
      reduce_vars: true,
      sequences: true,
      side_effects: false,
      switches: true,
      toplevel: false,
      top_retain: null,
      typeofs: true,
      unsafe: true,
      unsafe_arrows: true,
      unsafe_comps: true,
      unsafe_Function: true,
      unsafe_math: true,
      unsafe_methods: true,
      unsafe_proto: true,
      unsafe_regexp: true,
      unsafe_undefined: true,
      unused: true,
      warnings: true
    },
    mangle: {
      eval: false,
      keep_classnames: false,
      keep_fnames: false,
      module: false,
      reserved: [],
      toplevel: false,
      safari10: false,
      properties: {
        builtins: false,
        debug: false,
        keep_quoted: false,
        regex: null,
        reserved: result
      }
    },
    output: {
      ascii_only: false,
      beautify: false,
      braces: false,
      comments: false,
      ecma: 8,
      indent_level: 2,
      indent_start: 0,
      inline_script: true,
      keep_quoted_props: false,
      max_line_len: false,
      preamble: null,
      quote_keys: false,
      quote_style: 0,
      safari10: false,
      semicolons: true,
      shebang: false,
      width: 260,
      wrap_iife: true
    },
    ecma: 8,
    keep_classnames: false,
    keep_fnames: false,
    ie8: false,
    nameCache: null,
    safari10: null,
    toplevel: false,
    warnings: true
  };
  return terserOpts;
}

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
  { $format: 'esm',    $exports: 'auto',  $name: 'camel', $minify: false },
  { $format: 'system', $exports: 'auto',  $name: 'camel', $minify: false },
  { $format: 'cjs',    $exports: 'auto',  $name: 'camel', $minify: false },
  { $format: 'umd',    $exports: 'named', $name: 'camel', $minify: false },
  { $format: 'amd',    $exports: 'named', $name: 'camel', $minify: false },
  { $format: 'iife',   $exports: 'named', $name: 'iife',  $minify: true  }
] = [
  { $format: 'esm',    $exports: 'auto',  $name: 'camel', $minify: false },
  { $format: 'system', $exports: 'auto',  $name: 'camel', $minify: false },
  { $format: 'cjs',    $exports: 'auto',  $name: 'camel', $minify: false },
  { $format: 'umd',    $exports: 'named', $name: 'camel', $minify: false },
  { $format: 'amd',    $exports: 'named', $name: 'camel', $minify: false },
  { $format: 'iife',   $exports: 'named', $name: 'iife',  $minify: true  }
];

const iife_full_packages = ['jit-html'];

async function createBundle(): Promise<void> {
  const args = process.argv.slice(2);

  const outputs = args[0].split(',');
  let packages = project.packages.slice();
  packages = await sortByDependencies(packages);
  if (args.length > 1) {
    const filter = args[1].split(',');
    packages = packages.filter(p => filter.indexOf(p.name.kebab) !== -1);
  }

  const globals: rollup.GlobalsOption = {
    'tslib': 'tslib'
  };
  for (const pkg of project.packages) {
    globals[pkg.name.npm] = pkg.name.camel;
  }
  const write_iife = outputs.indexOf('iife') !== -1;


  const count = packages.length;
  let cur = 0;
  for (const pkg of packages) {
    const logPrefix = c.grey(`[${++cur}/${count}] ${pkg.name.npm}`);

    const external = project.packages.filter(p => p.name.npm !== pkg.name.npm).map(p => p.name.npm);
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
    let minifiedBundle: rollup.RollupSingleFileBuild = null;

    //'amd' | 'cjs' | 'system' | 'es' | 'esm' | 'iife' | 'umd'

    for (const { $format: format, $exports, $name, $minify } of formatDefinitions) {
      if (outputs.indexOf(format) === -1) {
        log(`${logPrefix} skipping ${format}`);
      } else {
        let file = pkg.dist[format];

        log(`${logPrefix} writing ${format} - ${file}`);
        const name = pkg.name[$name];
        const options: rollup.OutputOptions = {
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

        if ($minify) {
          if (minifiedBundle === null) {
            log(`${logPrefix} creating minified bundle`);
            const terserOpts = await getTerserOptions(file);
            minifiedBundle = await rollup.rollup({
              input: pkg.src.entry,
              plugins: [...plugins, terser(terserOpts)],
              external
            });
          }
          file = `${file.slice(0, -3)}.min.js`;

          log(`${logPrefix} writing ${format} - ${file}`);
          const options: rollup.OutputOptions = {
            file,
            name,
            format,
            sourcemap: true
          };
          if ($exports === 'named') {
            options.exports = 'named';
            options.globals = globals;
          }
          await minifiedBundle.write(options);
        }
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
      const options: rollup.OutputOptions = {
        file,
        name: pkg.name.namespace,
        format: 'iife',
        sourcemap: true,
        exports: 'named',
        globals
      };

      await fullBundle.write(options);

      log(`${logPrefix} creating iife full minified bundle`);
      const terserOpts = await getTerserOptions(file);
      const minifiedFullBundle = await rollup.rollup({
        input: pkg.src.entryFull,
        plugins: [...plugins, terser(terserOpts)]
      });

      file = `${file.slice(0, -3)}.min.js`;

      log(`${logPrefix} writing iife - ${file}`);
      options.file = file;

      await minifiedFullBundle.write(options);
    }

    log(`${logPrefix} ${c.greenBright('done')}`);
  }
}

createBundle();
