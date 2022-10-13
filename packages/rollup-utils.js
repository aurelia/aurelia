// @ts-check
import replace from "@rollup/plugin-replace";
import typescript from '@rollup/plugin-typescript';
import { terser }  from 'rollup-plugin-terser';
import { terserNameCache } from "./mangle-namecache";
import { execSync } from 'child_process';
import esbuild from 'rollup-plugin-esbuild';

// most important function is getRollupConfig at the bottom of this file

/**
 * @typedef EnvVars
 * @property {boolean} [__DEV__] development build flag
 */

/**
 * @typedef NormalizedEnvVars
 * @property {string} [__DEV__] development build flag
 * @property {string} [NO_MINIFIED] terser build flag
 */

/** @type {EnvVars} */
const defaultEnvVars = {};

/**
 * @param {EnvVars} [overrides] - overriding values for env variables
 * @returns {NormalizedEnvVars} final env variables
 */
export function getEnvVars(overrides) {
  return Object.fromEntries(
    Object
      .entries({ ...defaultEnvVars, ...overrides })
      .map(([key, value]) => [key, String(value)])
  );
}

/**
 * @param {EnvVars} envVars
 */
export function rollupReplace(envVars) {
  return replace({
    values: getEnvVars(envVars),
    preventAssignment: true,
  });
}

/**
 * @param {import('@rollup/plugin-typescript').RollupTypescriptOptions} [overrides]
 * @param {boolean} [isDevMode]
 */
export function rollupTypeScript(overrides, isDevMode) {
  return typescript({
    tsconfig: 'tsconfig.build.json',
    sourceMap: true,
    include: ['../global.d.ts', 'src/**/*.ts'],
    noEmitOnError: false,
    removeComments: true,
    inlineSourceMap: isDevMode,
    ...overrides,
  });
}

/**
 * @param {import('rollup-plugin-terser').Options} [overrides]
 */
export function rollupTerser(overrides) {
  return terser({
    compress: {
      defaults: false,
    },
    mangle: {
      properties: {
        regex: /^_/,
        reserved: ['__esModule', '_stateSubscriptions', '_state', '__REDUX_DEVTOOLS_EXTENSION__']
      }
    },
    nameCache: terserNameCache,
    format: {
      beautify: true,
    },
    keep_classnames: true,
    ...overrides,
  });
}

/**
 * @param {{ name: string; script: string }[]} scripts
 * @return {import('rollup').Plugin}
 */
export function runPostbuildScript(...scripts) {
  return {
    name: 'aurelia-packages-post-build',
    closeBundle() {
      const now = Date.now();
      scripts.forEach(s => {
        try {
          execSync(s.script.replace(/^(?:npm run\s*)?/, 'npm run '))
        } catch (ex) {
          process.stdout.write(ex.stdout);
        }
      });
      console.log(`run: ${scripts.map(s => `"${s.name}"`).join('\, ')} in ${((Date.now() - now) / 1000).toFixed(2)}s`);
    }
  };
}

/**
 * @typedef PackageJson
 * @property {string} name
 * @property {Record<string, string>} [dependencies]
 * @property {Record<string, string>} [devDependencies]
 */

/**
 * @callback ConfigCallback
 * @param {import('rollup').RollupOptions} config
 * @param {boolean} dev
 * @param {NormalizedEnvVars} envVars
 * @returns {import('rollup').RollupOptions}
 */

/**
 * @param {PackageJson} pkg
 * @param {ConfigCallback} [configure]
 * @param {(env: NormalizedEnvVars) => import('rollup-plugin-terser').Options} [configureTerser]
 *  a callback that takes a record of env variables, and returns overrides for terser plugin config
 * @param {{ name: string; script: string }[]} [postBuildScript]
 */
export function getRollupConfig(pkg, configure = identity, configureTerser, postBuildScript = [{ name: 'build dts', script: 'postrollup'}]) {
  const isReleaseBuild = /true/.test(process.env.RELEASE_BUILD + '');
  const cwd = process.cwd();
  /** @type {NormalizedEnvVars} */
  const envVars = {
    __DEV__: process.env.__DEV__,
    NO_MINIFIED: process.env.NO_MINIFIED
  };
  // @ts-ignore
  const isDevMode = /^true$/.test(process.env.DEV_MODE);
  const inputFile = 'src/index.ts';
  const esmDevDist = 'dist/esm/index.dev.mjs';
  const cjsDevDist = 'dist/cjs/index.dev.cjs';
  const esmDist = 'dist/esm/index.mjs';
  const cjsDist = 'dist/cjs/index.cjs';
  const typingsDist = 'dist/types/index.d.ts';
  /** @type {import('rollup').WarningHandlerWithDefault} */
  const onWarn = (warning, warn) => {
    if (warning.code === 'CIRCULAR_DEPENDENCY' || warning.code === 'MIXED_EXPORTS') return;
    if (warning.message.includes('Mixing named and default exports')) return;
    warn(warning);
  };

  const devConfig = configure({
    input: inputFile,
    // @ts-ignore
    external: Object.keys(pkg.dependencies),
    output: [
      {
        file: esmDevDist,
        format: 'es',
        sourcemap: isDevMode ? 'inline' : true,
      },
      {
        file: cjsDevDist,
        format: 'cjs',
        sourcemap: isDevMode ? 'inline' : true,
        esModule: true,
        externalLiveBindings: false,
      },
    ],
    plugins: [
      ...(
        isDevMode
        ? [
          // @ts-ignore
          rollupReplace({ '_START_CONST_ENUM': '(() => {})', '_END_CONST_ENUM': '(() => {})' }),
          esbuild({
            minify: false,
            target: 'es2020',
            define: { ...envVars, __DEV__: 'true' },
            sourceMap: true,
          }),
        ]
        : [
          rollupReplace({ ...envVars, __DEV__: true }),
          rollupTypeScript({}, isDevMode),
          stripInternalConstEnum(),
        ]
      ),
      // ...(isReleaseBuild
      //     ? [{
      //       name: 'generate-native-modules',
      //       closeBundle() {
      //         generateNativeImport(cwd, 'index.dev.mjs');
      //       }
      //     }]
      //     : [])
    ],
    onwarn: onWarn
  }, true, envVars);

  const prodConfig = configure({
    input: inputFile,
    // @ts-ignore
    external: Object.keys(pkg.dependencies),
    output: [
      {
        file: esmDist,
        format: 'es',
        sourcemap: isDevMode ? 'inline' : true,
        plugins: isDevMode
          ? []
          : [
            rollupTerser(),
          ],
      },
      {
        file: cjsDist,
        format: 'cjs',
        sourcemap: isDevMode ? 'inline' : true,
        externalLiveBindings: false,
        plugins: isDevMode
          ? []
          : [
            rollupTerser(),
          ],
      },
    ],
    plugins: [
      ...(
        isDevMode
        ? [
          // @ts-ignore
          rollupReplace({ '_START_CONST_ENUM': '(() => {})', '_END_CONST_ENUM': '(() => {})' }),
          esbuild({
            minify: false,
            target: 'es2020',
            define: { ...envVars, __DEV__: 'false' },
            sourceMap: true,
          }),
        ]
        : [
          rollupReplace({ ...envVars, __DEV__: false }),
          rollupTypeScript({}, isDevMode),
          stripInternalConstEnum(),
        ]
      ),
      runPostbuildScript(...postBuildScript),
      ...(isReleaseBuild
          ? [{
            name: 'generate-native-modules',
            closeBundle() {
              generateNativeImport(cwd, 'index.mjs');
            }
          }]
          : [])
    ],
    onwarn: onWarn,
  }, false, envVars);

  return [devConfig, prodConfig];
}

/**
 * @template T
 * @param {T} a
 * @returns {T}
 */
function identity(a) {
  return a;
}

import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';

/** @return {import('rollup').Plugin} */
function stripInternalConstEnum (options = {}) {
  const { include, exclude } = options

  const filter = createFilter(include, exclude)

  return {
    name: 'stripCode',

    transform (source, id) {
      if (!filter(id)) return

      const s = new MagicString(source);
      const indexPairs = [];

      let startIndex = 0;
      let endIndex = 0;
      while (true) {
        startIndex = source.indexOf('_START_CONST_ENUM();', endIndex);
        if (startIndex === -1) {
          break;
        }

        endIndex = source.indexOf('_END_CONST_ENUM();', startIndex);
        if (endIndex === -1) {
          break;
        }
        indexPairs.push([startIndex, endIndex]);
      }

      if (indexPairs.length === 0) {
        return;
      }

      indexPairs.forEach(([startIndex, endIndex]) => {
        s.overwrite(startIndex, endIndex + '_END_CONST_ENUM();'.length, '');
      })
      
      const map = s.generateMap({ hires: true })

      return { code: s.toString(), map };
    }
  }
}

import path from 'path';
import fs from 'fs-extra';
/**
 * @param {string} cwd
 * @param {string} fileName
 */
async function generateNativeImport(cwd, fileName) {
  const code = await fs.readFile(path.resolve(cwd, `dist/esm/${fileName}`), { encoding: 'utf-8' });
  const regex = /from\s+(['"])@aurelia\/([-a-z]+)['"];/g;
  const transformed = code.replace(regex, `from $1../$2/dist/native-modules/${fileName}$1;`).replace(`//# sourceMappingURL=${fileName}.map`, '');
  await fs.ensureDir(path.resolve(cwd, 'dist/native-modules'));
  await fs.writeFile(path.resolve(cwd, `dist/native-modules/${fileName}`), transformed, { encoding: 'utf-8' });
}
