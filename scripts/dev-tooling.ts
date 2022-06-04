/* eslint-disable no-console */
import concurrently from 'concurrently';
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { c } from './logger';

const args = yargs
  .usage('$0 <cmd> [args]')
  .option('d', {
    alias: 'dev',
    describe: 'add extra packages to development',
    array: true,
  })
  .option('t', {
    alias: 'test',
    describe: 'add extra test folders to development',
    array: true,
  })
  .option('a', {
    alias: 'app',
    describe: 'add extra example apps to development',
    array: true,
  })
  .argv;

const envVars = { DEV_MODE: true };
const testPatterns = (args.t ?? []).join(' ');

if (testPatterns === '') {
  console.log(
    `There are no test pattern specified. This will run all tests if go ahead. Aborting...
If it is intended to run all test, then specified --test *
`);
  process.exit(0);
}

const devCmd = 'npm run dev';
const buildCmd = 'npm run build';

const baseToolingPath = 'packages-tooling';
const basePackages = [
  'kernel',
];

const validToolingPackages = [
  'plugin-conventions',
  'plugin-gulp',
  'ts-jest',
  'babel-jest',
  'parcel-transformer',
  'webpack-loader',
];

const devPackages = (args.d ?? []) as string[];
if (devPackages.some(d => !validToolingPackages.includes(d))) {
  throw new Error(`Invalid package config, valid packages are: ${validToolingPackages}`);
}

const baseUrl = 'dist/cjs/__tests__';
const testFilePatterns = testPatterns === '*'
  ? [`${baseUrl}/**/*.spec.js`]
  : testPatterns.split(' ').flatMap(pattern => [
    `${baseUrl}/**/*${pattern.replace(/(?:\.spec)?(?:\.[tj]s)?$/, '*.spec.js')}`,
    `${baseUrl}/**/${pattern}/**/*.spec.js`,
  ]);

console.log('test patterns preprocess:', testPatterns, 'post-process:', testFilePatterns);

basePackages
  .filter(pkg => !isEsmBuilt(path.resolve(__dirname, `../packages/${pkg}`)))
  .forEach(pkg => buildPackage(pkg, `packages/${pkg}`));
validToolingPackages
  .filter(pkg => !isCjsBuilt(path.resolve(__dirname, `../${baseToolingPath}/${pkg}`)))
  .forEach((pkgName) => buildPackage(pkgName, `${baseToolingPath}/${pkgName}`));

concurrently([
  { command: devCmd, cwd: 'packages/kernel', name: 'kernel', env: envVars },
  // always watch plugin-convention by default, since this is the base line of all the things
  { command: devCmd, cwd: `${baseToolingPath}/plugin-conventions`, name: 'plugin-conventions', env: envVars },
  { command: devCmd, cwd: `${baseToolingPath}/__tests__`, name: '__tests__(build)', env: envVars },
  ...devPackages
    .filter(pkg => pkg !== 'plugin-conventions').
    map((folder: string) => ({
      command: devCmd,
      cwd: `${baseToolingPath}/${folder}`,
      name: folder,
      env: envVars
    })),
  {
    command: `npm run ::mocha -- --watch-files ${Array.from(new Set(['plugin-conventions', ...devPackages])).map(pkg => getToolingPackageDist(pkg)).join(',')} -w ${testFilePatterns.join(' ')}`,
    cwd: `${baseToolingPath}/__tests__`,
    name: '__tests__(run)',
    env: envVars
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
  ]
});

function getToolingPackageDist(pkg: string) {
  return `${process.cwd()}/${baseToolingPath}/${pkg}/dist/cjs/index.cjs`;
}

function isEsmBuilt(pkgPath: string): boolean {
  return fs.existsSync(`${pkgPath}/dist/esm/index.mjs`);
}

function isCjsBuilt(pkgPath: string): boolean {
  return fs.existsSync(`${pkgPath}/dist/cjs/index.cjs`);
}

function getElapsed(now: number, then: number) {
  return ((now - then) / 1000).toFixed(2);
}

function buildPackage(pkgName: string, path: string) {
  const start = Date.now();
  const pkgDisplay = c.green(pkgName);
  console.log(`${pkgDisplay} has not been built before, building...`);
  execSync(buildCmd, { cwd: path });
  console.log(`${pkgDisplay} built in ${getElapsed(Date.now(), start)}s`);
}
