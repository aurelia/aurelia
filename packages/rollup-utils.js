// @ts-check
import replace from "@rollup/plugin-replace";
import typescript from '@rollup/plugin-typescript';
import { terser }  from 'rollup-plugin-terser';
import { terserNameCache } from "./terser-namecache.js";
import { execSync } from 'child_process';

// most important function is getRollupConfig at the bottom of this file

/**
 * @typedef EnvVars
 * @property {boolean} [__DEV__] development build flag
 */

/**
 * @typedef StringifiedEnvVars
 * @property {string} [__DEV__] development build flag
 */

/** @type {EnvVars} */
const defaultEnvVars = {};

/**
 * @param {EnvVars} [overrides] - overriding values for env variables
 * @returns {StringifiedEnvVars} final env variables
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
    include: ['../global.d.ts', 'src/**/*.ts'],
    noEmitOnError: false,
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
        reserved: ['__esModule']
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
 * @param {string[]} scripts
 * @return {import('rollup').Plugin}
 */
export function runPostbuildScript(...scripts) {
  return {
    name: 'aurelia-packages-post-build',
    closeBundle() {
      scripts.forEach(s => execSync(s.replace(/^(?:npm run\s*)?/, 'npm run ')));
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
 * @param {PackageJson} pkg
 * @param {(config: import('rollup').RollupOptions) => import("rollup").RollupOptions} [configure]
 * @param {string[]} [postBuildScript]
 */
export function getRollupConfig(pkg, configure = identity, postBuildScript = ['postrollup']) {
  const inputFile = 'src/index.ts';
  const esmDevDist = 'dist/esm/index.dev.js';
  const cjsDevDist = 'dist/cjs/index.dev.js';
  const esmDist = 'dist/esm/index.js';
  const cjsDist = 'dist/cjs/index.js';

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
      rollupReplace({ __DEV__: true }),
      rollupTypeScript(),
      runPostbuildScript(...postBuildScript),
    ],
  });

  const prodConfig = configure({
    input: inputFile,
    external: Object.keys(pkg.dependencies),
    output: [
      {
        file: esmDist,
        format: 'es',
        sourcemap: true,
        plugins: [
          rollupTerser(),
        ],
      },
      {
        file: cjsDist,
        format: 'cjs',
        sourcemap: true,
        externalLiveBindings: false,
        plugins: [
          rollupTerser(),
        ],
      },
    ],
    plugins: [
      rollupReplace({ __DEV__: false }),
      rollupTypeScript(),
      runPostbuildScript(...postBuildScript),
    ],
  });
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
