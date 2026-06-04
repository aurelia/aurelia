/* eslint-disable no-console */
import concurrently from 'concurrently';
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { c } from './logger';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
const args = yargs
  .usage('$0 <cmd> [args]')
  .option('d', {
    alias: 'dev',
    describe: 'Add extra packages to development watch',
    array: true,
  })
  .option('t', {
    alias: 'test',
    describe: 'Add extra test folders to development watch',
    array: true,
  })
  .option('a', {
    alias: 'app',
    describe: 'Add extra example apps to development watch',
    array: true,
  })
  .parseSync();

// ---------------------------------------------------------------------------
// Environment and test pattern setup
// ---------------------------------------------------------------------------

/** Signals to watched processes that they are running in dev/watch mode. */
const envVars = { DEV_MODE: true };

/** Space-separated test patterns provided via --test / -t flags. */
const testPatterns = (args.t ?? []).join(' ');

// Require at least one test pattern to avoid accidentally running the entire suite.
if (testPatterns === '') {
  console.log(
    `No test pattern specified. This would run ALL tests if continued. Aborting...
If you intended to run all tests, pass --test *
`
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Reusable npm commands
// ---------------------------------------------------------------------------
const devCmd = 'npm run dev';
const buildCmd = 'npm run build';

// ---------------------------------------------------------------------------
// Package configuration
// ---------------------------------------------------------------------------

/** Root directory that contains all tooling packages. */
const baseToolingPath = 'packages-tooling';

/** Core packages that must always be watched during development. */
const basePackages = [
  'kernel',
];

/** All recognised tooling packages that can be opted into via --dev / -d. */
const validToolingPackages = [
  'plugin-conventions',
  'plugin-gulp',
  'ts-jest',
  'babel-jest',
  'parcel-transformer',
  'webpack-loader',
];

/** Extra tooling packages requested by the caller via --dev / -d. */
const extraDevPackages = (args.d ?? []) as string[];

// Validate that every requested package is in the allow-list.
if (extraDevPackages.some(pkg => !validToolingPackages.includes(pkg))) {
  throw new Error(`Invalid package config. Valid packages are: ${validToolingPackages.join(', ')}`);
}

// ---------------------------------------------------------------------------
// Test file glob patterns
// ---------------------------------------------------------------------------

/** Directory that contains the compiled CJS output used by the test runner. */
const cjsOutputDir = './dist/cjs';

/**
 * Expand the user-supplied test patterns into concrete glob patterns that
 * Mocha can consume.  A wildcard ('*') selects every spec file under the
 * CJS output directory.
 */
const testFilePatterns = testPatterns === '*'
  ? [`${cjsOutputDir}/**/*.spec.js`]
  : testPatterns.split(' ').flatMap(pattern => [
    `${cjsOutputDir}/**/*${pattern.replace(/(?:\.spec)?(?:\.[tj]s)?$/, '*.spec.js')}`,
    `${cjsOutputDir}/**/${pattern}/**/*.spec.js`,
  ]);

console.log('Test patterns  (raw):', testPatterns);
console.log('Test patterns (glob):', testFilePatterns);

// ---------------------------------------------------------------------------
// Pre-build any packages that have not been compiled yet
// ---------------------------------------------------------------------------

// Ensure all base packages have an ESM build before starting the watcher.
basePackages
  .filter(pkg => !isEsmBuilt(path.resolve(__dirname, `../packages/${pkg}`)))
  .forEach(pkg => buildPackage(pkg, `packages/${pkg}`));

// Ensure all tooling packages have a CJS build before starting the watcher.
validToolingPackages
  .filter(pkg => !isCjsBuilt(path.resolve(__dirname, `../${baseToolingPath}/${pkg}`)))
  .forEach(pkgName => buildPackage(pkgName, `${baseToolingPath}/${pkgName}`));

// ---------------------------------------------------------------------------
// Concurrent watch processes
// ---------------------------------------------------------------------------

concurrently([
  // Core kernel package — always watched.
  { command: devCmd, cwd: 'packages/kernel', name: 'kernel', env: envVars },

  // plugin-conventions is the baseline for all other tooling, so always watch it.
  { command: devCmd, cwd: `${baseToolingPath}/plugin-conventions`, name: 'plugin-conventions', env: envVars },

  // Build watcher for the shared test suite.
  { command: devCmd, cwd: `${baseToolingPath}/__tests__`, name: '__tests__(build)', env: envVars },

  // Any additional tooling packages requested via --dev (excluding plugin-conventions,
  // which is already included above).
  ...extraDevPackages
    .filter(pkg => pkg !== 'plugin-conventions')
    .map((folder: string) => ({
      command: devCmd,
      cwd: `${baseToolingPath}/${folder}`,
      name: folder,
      env: envVars,
    })),

  // Mocha test runner in watch mode.
  {
    command: `cross-env TS_NODE_CACHE=true npm run ::mocha -- ${[
      `-r ts-node/register`,
      `--exclude dist/*`,
      `--exclude node_modules/*`,
      `--watch-files ${
        Array.from(new Set(['plugin-conventions', ...extraDevPackages]))
          .map(pkg => getToolingPackageDist(pkg))
          .join(',')
      },${testFilePatterns.join(',')}`,
      `-w`,
      testFilePatterns.join(' '),
    ].join(' ')}`,
    cwd: `${baseToolingPath}/__tests__`,
    name: '__tests__(run)',
    env: envVars,
  },
], {
  prefix: '[{name}]',
  killOthers: 'failure',
  prefixColors: [
    'green',
    'blue',
    'cyan',
    'greenBright',
    'blueBright',
    'magentaBright',
    'cyanBright',
    'white',
  ],
});

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Returns the absolute path to the CJS dist entry-point of a tooling package. */
function getToolingPackageDist(pkg: string): string {
  return `${process.cwd()}/${baseToolingPath}/${pkg}/dist/cjs/index.cjs`;
}

/** Returns true if the given package directory contains an ESM build. */
function isEsmBuilt(pkgPath: string): boolean {
  return fs.existsSync(`${pkgPath}/dist/esm/index.mjs`);
}

/** Returns true if the given package directory contains a CJS build. */
function isCjsBuilt(pkgPath: string): boolean {
  return fs.existsSync(`${pkgPath}/dist/cjs/index.cjs`);
}

/** Returns the elapsed time in seconds between two Date.now() timestamps. */
function getElapsed(startTime: number, endTime: number): string {
  return ((endTime - startTime) / 1000).toFixed(2);
}

/**
 * Synchronously builds a package if it has not been compiled yet,
 * logging the time taken.
 */
function buildPackage(pkgName: string, pkgPath: string): void {
  const startTime = Date.now();
  const pkgDisplay = c.green(pkgName);
  console.log(`${pkgDisplay} has not been built yet — building now...`);
  execSync(buildCmd, { cwd: pkgPath });
  console.log(`${pkgDisplay} built in ${getElapsed(startTime, Date.now())}s`);
}
