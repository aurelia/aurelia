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
    array: true
  })
  .option('t', {
    alias: 'test',
    describe: 'add extra test folders to development',
    array: true
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

[
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
  'addons',
  'testing',
].filter(isBuilt).forEach((pkgName) => {
  const start = Date.now();
  const pkgDisplay = c.green(pkgName);
  console.log(`${pkgDisplay} has not been built before, building...`);
  execSync(buildCmd, { cwd: `packages/${pkgName}` });
  console.log(`${pkgDisplay} built in ${getElapsed(Date.now(), start)}s`);
});

concurrently([
  { command: devCmd, cwd: 'packages/runtime', name: 'runtime', env: envVars },
  { command: devCmd, cwd: 'packages/runtime-html', name: 'runtime-html', env: envVars },
  { command: devCmd, cwd: 'packages/__tests__', name: '__tests__(build)', env: envVars },
  ...(args.d ?? []).map((folder: string) => ({
    command: 'npm run dev',
    cwd: `packages/${folder}`,
    name: folder,
    env: envVars
  })),
  { command: `npm run test-chrome:debugger ${testPatterns === '*' ? '' : testPatterns}`, cwd: 'packages/__tests__', name: '__tests__(run)', env: envVars },
], {
  prefix: '[{name}]',
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

function isBuilt(name: string): boolean {
  return fs.existsSync(path.resolve(__dirname, `../packages/${name}/dist/esm/index.mjs`));
}

function getElapsed(now: number, then: number) {
  return ((now - then) / 1000).toFixed(2);
}
