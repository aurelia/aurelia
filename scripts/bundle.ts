import { c, createLogger } from './logger';
import { loadPackageJson } from './package.json';
import project from './project';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript2 from 'rollup-plugin-typescript2';
import * as rollup from 'rollup';
import ts from 'typescript';
import { readFileSync } from 'fs';


const log = createLogger('bundle');

async function getTerserOptions() {
  log('Finding exported identifiers to exclude from mangling');

  // What happens here is we parse all the index.ts files and tell the minifier not to mangle any of those identifiers either if they are classes or properties,
  // and we manually add some of the surface level api properties that are known to break the framework if they are mangled.
  // This is not foolproof however, and we should parse the generated .d.ts files and tell the minifier not to mangle any of the class names, functions, constants, properties, etc
  // that are present there so the public API stays untouched, but it should be able to mangle anything else without breaking stuff
  const names = [
    ...project.packages
    .map(pkg => ts.createSourceFile(pkg.src.entry, readFileSync(pkg.src.entry, { encoding: 'utf8' }), ts.ScriptTarget.ES2018))
    .reduce((acc, cur) => {
      acc.push(...cur.statements.filter(s => ts.isExportDeclaration(s)) as ts.ExportDeclaration[]);
      return acc;
    }, [] as ts.ExportDeclaration[])
    .reduce((acc, cur) => {
      if (cur.exportClause && ts.isNamedExports(cur.exportClause)) {
        acc.push(...cur.exportClause.elements);
      }
      return acc;
    }, [] as ts.ExportSpecifier[])
    .map(specifier => specifier.name.text)
  ];

  const exclusions = new Set<string>(names);
  const result = Array.from(exclusions).sort();
  //log(`Detected the following exports:\n  ${result.join(' ')}`);
  const knownProperties = project.packages.map(p => p.name.camel).concat(
    'au', '$au',
    'host', 'component',
    'cache', 'template', 'instructions', 'dependencies', 'build', 'surrogates', 'bindables', 'containerless', 'shadowOptions', 'hasSlots',
    'defaultBindingMode', 'aliases', 'isTemplateController', 'hasDynamicOptiopns',
    'type', 'from', 'to', 'mode', 'oneTime', 'value', 'res', 'parts', 'def', 'link', 'toViewModel', 'required', 'compiler', 'preventDefault', 'strategy',
    'dom', 'firstChild', 'lastChild', 'childNodes', 'targets',
    'shadowRoot', '$customElement',
    '$hooks', '$state', '$lifecycle', '$context', '$nodes', '$scope', 'name'
  );
  result.push(...knownProperties);

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
      global_defs: null,
      hoist_funs: true,
      hoist_props: true,
      hoist_vars: true,
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
      pure_getters: true,
      reduce_funcs: true,
      reduce_vars: true,
      sequences: true,
      side_effects: true,
      switches: true,
      toplevel: false,
      top_retain: null,
      typeofs: true,
      unsafe: true,
      unsafe_arrows: false,
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
      reserved: result,
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
  { $format: 'esm',    $exports: 'auto',  $name: 'camel', $minify: true },
  { $format: 'system', $exports: 'auto',  $name: 'camel', $minify: true },
  { $format: 'cjs',    $exports: 'auto',  $name: 'camel', $minify: true },
  { $format: 'umd',    $exports: 'named', $name: 'camel', $minify: true },
  { $format: 'amd',    $exports: 'named', $name: 'camel', $minify: true },
  { $format: 'iife',   $exports: 'named', $name: 'iife',  $minify: true }
] = [
  { $format: 'esm',    $exports: 'auto',  $name: 'camel', $minify: true },
  { $format: 'system', $exports: 'auto',  $name: 'camel', $minify: true },
  { $format: 'cjs',    $exports: 'auto',  $name: 'camel', $minify: true },
  { $format: 'umd',    $exports: 'named', $name: 'camel', $minify: true },
  { $format: 'amd',    $exports: 'named', $name: 'camel', $minify: true },
  { $format: 'iife',   $exports: 'named', $name: 'iife',  $minify: true }
];

const iife_full_packages = ['jit-html'];

async function createBundle(): Promise<void> {
  const args = process.argv.slice(2);
  console.log(args);

  const outputs = args[0].split(',');
  let packages = project.packages.slice();
  packages = await sortByDependencies(packages);
  if (args.length > 1 && args[1] !== 'all') {
    const filter = args[1].split(',');
    packages = packages.filter(p => filter.indexOf(p.name.kebab) !== -1);
  }
  const minify = args.length > 2;

  const globals: rollup.GlobalsOption = {
    'tslib': 'tslib'
  };
  for (const pkg of project.packages) {
    globals[pkg.name.npm] = pkg.name.camel;
  }
  const write_iife = outputs.indexOf('iife') !== -1;
  const terserOpts = await getTerserOptions();


  const count = packages.length;
  let cur = 0;
  for (const pkg of packages) {
    const logPrefix = c.grey(`[${++cur}/${count}] ${pkg.name.npm}`);

    const external = project.packages.filter(p => p.name.npm !== pkg.name.npm).map(p => p.name.npm);
    const plugins = [
      replace({
        // We're just replacing `Tracer.enabled` with `false` and let dead code elimination take care of the rest
        'Tracer.enabled': 'false'
      }),
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

        if (minify && $minify) {
          if (minifiedBundle === null) {
            log(`${logPrefix} creating minified bundle`);
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
            sourcemap: false
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

      if (minify) {
        log(`${logPrefix} creating iife full minified bundle`);
        const minifiedFullBundle = await rollup.rollup({
          input: pkg.src.entryFull,
          plugins: [...plugins, terser(terserOpts)]
        });

        file = `${file.slice(0, -3)}.min.js`;

        log(`${logPrefix} writing iife - ${file}`);
        options.file = file;
        options.sourcemap = false;

        await minifiedFullBundle.write(options);
      }
    }

    log(`${logPrefix} ${c.greenBright('done')}`);
  }
}

createBundle();
