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
  .option('e2e', {
    alias: 'e',
    describe: 'add extra e2e test setup to development',
    type: 'string',
    array: true,
  })
  .parseSync();

const envVars = { DEV_MODE: true };
const testPatterns = (args.t ?? []).join(' ');
const hasValidTestPatterns = testPatterns !== '';

const e2e = args.e2e;
const validE2e = [
  'router',
  'router-lite',
  'hmr-vite',
  'hmr-webpack',
  'hmr-parcel',
  'select-safari16',
  'i18n',
  'ui-virtualization',
];
const hasValidE2e = e2e?.length && e2e.every(e => validE2e.includes(e));

if (!hasValidTestPatterns && !hasValidE2e) {
  console.log(
`There are no test pattern or e2e tests specified. Aborting...
If it is intended to run all test, then specified --test *
If it is intended to run e2e test, then specified --e2e + one of the following: ${validE2e}`);
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
  'dialog',
  'web-components',
  'i18n',
  'fetch-client',
  'route-recognizer',
  'router-lite',
  'router',
  'validation',
  'validation-html',
  'validation-i18n',
  'state',
  'store-v1',
  'ui-virtualization',
  'compat-v1',
  'aurelia',
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
  'vite-plugin',
  'webpack-loader',
];

const apps = (args.a ?? []) as string[];
const validApps = [
  'ui-virtualization',
  'router-animation',
];

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
  hasValidTestPatterns
    ? { command: `npm run test-chrome:debugger ${testPatterns === '*' ? '' : testPatterns}`, cwd: 'packages/__tests__', name: '__tests__(run)', env: envVars }
    : null,
  ...(e2e ?? []).map(e => ({ command: 'npm run test:watch', cwd: `packages/__e2e__/${e}`, env: envVars, name: `__e2e__(${e})` })),
  ...apps.map((appFolder, i) => ({
    command: devCmd,
    cwd: `examples/${appFolder}`,
    name: `${appFolder} (app)`,
    env: { ...envVars, WEBPACK_PORT: baseAppPort + i },
  })),
].filter(Boolean), {
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
