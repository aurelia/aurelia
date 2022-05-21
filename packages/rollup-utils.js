// @ts-check
import replace from "@rollup/plugin-replace";
import typescript from '@rollup/plugin-typescript';
import { terser }  from 'rollup-plugin-terser';
import { esbuildNameCache, terserNameCache } from "./mangle-namecache";
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
  /** @type {NormalizedEnvVars} */
  const envVars = {
    __DEV__: process.env.__DEV__,
    NO_MINIFIED: process.env.NO_MINIFIED
  };
  const isDevMode = /^true$/.test(process.env.DEV_MODE);
  const inputFile = 'src/index.ts';
  const esmDevDist = 'dist/esm/index.dev.mjs';
  const cjsDevDist = 'dist/cjs/index.dev.cjs';
  const esmDist = 'dist/esm/index.mjs';
  const cjsDist = 'dist/cjs/index.cjs';
  const typingsDist = 'dist/types/index.d.ts';
  /** @type {import('rollup').WarningHandlerWithDefault} */
  const onWarn = (warning, warn) => {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    if (warning.message.includes('Mixing named and default exports')) return;
    warn(warning);
  };

  const devConfig = configure({
    input: inputFile,
    external: Object.keys(pkg.dependencies),
    output: [
      {
        file: esmDevDist,
        format: 'es',
        sourcemap: true,
      },
      {
        file: cjsDevDist,
        format: 'cjs',
        sourcemap: true,
        esModule: true,
        externalLiveBindings: false,
      },
    ],
    plugins: [
      ...(false/* isDevMode */ // there's something wrong with sourcemap
        ? [
          esbuild({
            minify: false,
            target: 'es2018',
            define: { ...envVars, __DEV__: 'true' },
            sourceMap: true,
          }),
        ]
        : [
          rollupReplace({ ...envVars, __DEV__: true }),
          rollupTypeScript({}, isDevMode),
        ]
      ),
    ],
    onwarn: onWarn
  }, true, envVars);

  const prodConfig = configure({
    input: inputFile,
    external: Object.keys(pkg.dependencies),
    output: [
      {
        file: esmDist,
        format: 'es',
        sourcemap: true,
        plugins: isDevMode
          ? []
          : [
            rollupTerser(),
          ],
      },
      {
        file: cjsDist,
        format: 'cjs',
        sourcemap: true,
        externalLiveBindings: false,
        plugins: isDevMode
          ? []
          : [
            rollupTerser(),
          ],
      },
    ],
    plugins: [
      ...(false/* isDevMode */ // there's something wrong with sourcemap
        ? [
          esbuild({
            minify: false,
            target: 'es2018',
            define: { ...envVars, __DEV__: 'false' },
            mangleProps: /^_/,
            reserveProps: /^__.*__$|__esModule|_stateSubscriptions|_state|__REDUX_DEVTOOLS_EXTENSION__/,
            mangleCache: esbuildNameCache,
            sourceMap: true,
          })
        ]
        : [
          rollupReplace({ ...envVars, __DEV__: false }),
          rollupTypeScript({}, isDevMode),
        ]
      ),
      runPostbuildScript(...postBuildScript),
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
