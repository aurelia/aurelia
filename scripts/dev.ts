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

const validPackages = [
  'metadata',
  'platform',
  'platform-browser',
  'kernel',
  'runtime',
  'runtime-html',
  'i18n',
  'fetch-client',
  'aurelia',
  'route-recognizer',
  'router-lite',
  'router',
  'validation',
  'validation-html',
  'validation-i18n',
  'state',
  'store-v1',
  'ui-virtualization',
  'addons',
  'testing',
];

const devPackages = (args.d ?? []) as string[];
if (devPackages.some(d => !validPackages.includes(d))) {
  throw new Error(`Invalid package config, valid packages are: ${validPackages}`);
}

validPackages
  .filter(pkg => !isEsmBuilt(path.resolve(__dirname, `../packages/${pkg}`)))
  .forEach((pkgName) => {
    const start = Date.now();
    const pkgDisplay = c.green(pkgName);
    console.log(`${pkgDisplay} has not been built before, building...`);
    execSync(buildCmd, { cwd: `packages/${pkgName}` });
    console.log(`${pkgDisplay} built in ${getElapsed(Date.now(), start)}s`);
  });

const toolingPackages = [
  'plugin-conventions',
  'plugin-gulp',
  'ts-jest',
  'babel-jest',
  'parcel-transformer',
  'webpack-loader',
];

const apps = (args.a ?? []) as string[];
const validApps = ['ui-virtualization'];

if (apps.length > 0) {
  if (apps.some(a => !validApps.includes(a))) {
    throw new Error(`Invalid apps, valid options are: ${validApps}`);
  }

  toolingPackages
    .filter(pkg => !isCjsBuilt(path.resolve(__dirname, `../packages-tooling/${pkg}`)))
    .forEach(pkgName => {
      const start = Date.now();
      const pkgDisplay = c.green(pkgName);
      console.log(`${pkgDisplay} has not been built before, building...`);
      try {
        execSync(buildCmd, { cwd: `packages-tooling/${pkgName}` });
      } catch (ex) {
        process.stdout.write(ex.stdout);
        process.exit(1);
      }
      console.log(`${pkgDisplay} built in ${getElapsed(Date.now(), start)}s`);
    });
}

const baseAppPort = 9000;
concurrently([
  { command: devCmd, cwd: 'packages/runtime', name: 'runtime', env: envVars },
  { command: devCmd, cwd: 'packages/runtime-html', name: 'runtime-html', env: envVars },
  { command: devCmd, cwd: 'packages/__tests__', name: '__tests__(build)', env: envVars },
  ...devPackages.map((folder: string) => ({
    command: devCmd,
    cwd: `packages/${folder}`,
    name: folder,
    env: envVars
  })),
  { command: `npm run test-chrome:debugger ${testPatterns === '*' ? '' : testPatterns}`, cwd: 'packages/__tests__', name: '__tests__(run)', env: envVars },
  ...apps.map((appFolder, i) => ({
    command: devCmd,
    cwd: `examples/${appFolder}`,
    name: `${appFolder} (app)`,
    env: { ...envVars, WEBPACK_PORT: baseAppPort + i },
  })),
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

function isEsmBuilt(pkgPath: string): boolean {
  return fs.existsSync(`${pkgPath}/dist/esm/index.mjs`);
}

function isCjsBuilt(pkgPath: string): boolean {
  return fs.existsSync(`${pkgPath}/dist/cjs/index.cjs`);
}

function getElapsed(now: number, then: number) {
  return ((now - then) / 1000).toFixed(2);
}
