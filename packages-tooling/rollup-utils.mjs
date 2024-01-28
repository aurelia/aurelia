// @ts-check
import replace from "@rollup/plugin-replace";
import typescript from '@rollup/plugin-typescript';
import { execSync } from 'child_process';

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
 */
export function rollupTypeScript(overrides) {
  return typescript({
    tsconfig: 'tsconfig.build.json',
    sourceMap: true,
    include: ['./**/*.ts'],
    noEmitOnError: false,
    removeComments: true,
    ...overrides,
  });
}

/**
 * @param {{ name: string; script: string }[]} scripts
 * @returns {import('rollup').Plugin}
 */
export function runPostbuildScript(...scripts) {
  return {
    name: 'aurelia-packages-post-build',
    closeBundle() {
      const now = Date.now();
      scripts.forEach(s => {
        try {
          execSync(s.script.replace(/^(?:npm run\s*)?/, 'npm run '));
        } catch (ex) {
          process.stdout.write(ex.stdout);
        }
      });
      console.log(`run: ${scripts.map(s => `"${s.name}"`).join(', ')} in ${((Date.now() - now) / 1000).toFixed(2)}s`);
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
 * @param {(env: NormalizedEnvVars) => import('terser').MinifyOptions} [configureTerser]
 * a callback that takes a record of env variables, and returns overrides for terser plugin config
 * @param {{ name: string; script: string }[]} [postBuildScript]
 */
// eslint-disable-next-line default-param-last
export function getRollupConfig(pkg, configure = identity, configureTerser, postBuildScript = [{ name: 'build dts', script: 'postrollup'}]) {
  /** @type {NormalizedEnvVars} */
  const envVars = {
    __DEV__: process.env.__DEV__,
    NO_MINIFIED: process.env.NO_MINIFIED
  };
  // const isDevMode = /^true$/.test(process.env.DEV_MODE);
  const inputFile = 'src/index.ts';
  // const esmDevDist = 'dist/esm/index.dev.mjs';
  // const cjsDevDist = 'dist/cjs/index.dev.cjs';
  const esmDist = 'dist/esm/index.mjs';
  const cjsDist = 'dist/cjs/index.cjs';
  // const typingsDist = 'dist/types/index.d.ts';
  /** @type {import('rollup').WarningHandlerWithDefault} */
  const onWarn = (warning, warn) => {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    if (warning.message.includes('Mixing named and default exports')) return;
    warn(warning);
  };

  const prodConfig = configure({
    input: inputFile,
    external: Object.keys(pkg.dependencies ?? {})
      .concat(Object.keys(pkg.devDependencies ?? {}))
      .concat('os', 'path', 'fs', 'http', 'https', 'http2', 'url', 'stream'),
    output: [
      {
        file: esmDist,
        format: 'es',
        sourcemap: true,
      },
      {
        file: cjsDist,
        format: 'cjs',
        sourcemap: true,
        externalLiveBindings: false,
        exports: 'named',
      },
    ],
    plugins: [
      rollupReplace({ ...envVars, __DEV__: false }),
      rollupTypeScript(),
      runPostbuildScript(...postBuildScript),
    ],
    onwarn: onWarn,
  }, false, envVars);

  return [prodConfig];
}

/**
 * @template T
 * @param {T} a
 * @returns {T}
 */
function identity(a) {
  return a;
}
