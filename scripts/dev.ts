/* eslint-disable no-console */
import concurrently from 'concurrently';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import type { Writable } from 'stream';
import yargs from 'yargs/yargs';
import {
  closeDevLogStream,
  createDevLogStream,
  createTestBuildToken,
  createTestCommandConfig,
  waitForDevProcesses,
} from './dev-utils';
import { c } from './logger';

const args = yargs(process.argv.slice(2))
  .usage('$0 <cmd> [args]')
  .option('d', {
    alias: 'dev',
    describe: 'add extra packages to development',
    array: true,
  })
  .option('l', {
    alias: 'tooling',
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
  .option('node-tests', {
    describe: 'run node test watcher instead of the chrome debugger runner',
    type: 'boolean',
    default: false,
  })
  .option('log-file', {
    describe: 'write all dev output to this file while still echoing to stdout',
    type: 'string',
  })
  .parseSync();

const envVars = { DEV_MODE: true };
const rawTestPatterns = (args.t ?? []) as string[];
const hasValidTestPatterns = rawTestPatterns.join(' ') !== '';

const e2e = args.e2e;
const validE2e = [
  '1-gh-issues',
  '2-hmr-vite',
  '3-hmr-webpack',
  '4-i18n',
  '5-router-direct',
  '6-router',
  'hmr-parcel',
  '7-select-safari16',
  '8-ui-virtualization',
  '15-ts6-webpack-smoke',
  '16-ts7-webpack-smoke',
];
const hasValidE2e = e2e?.length && e2e.every(e => validE2e.includes(e));

if (!hasValidTestPatterns && !hasValidE2e) {
  console.log(
`There are no test pattern or e2e tests specified. Aborting...
If it is intended to run all test, then specified --test '*'
If it is intended to run e2e test, then specified --e2e + one of the following: ${validE2e}`);
  process.exit(0);
}

const devCmd = 'npm run dev';
const buildCmd = 'npm run build';
const logFile = typeof args['log-file'] === 'string'
  ? path.resolve(process.cwd(), args['log-file'])
  : null;

const alwaysBuildPackages = [
  'kernel',
  'runtime',
  'runtime-html',
  'template-compiler',
];

const validPackages = [
  'metadata',
  'platform',
  'platform-browser',
  'kernel',
  'expression-parser',
  'runtime',
  'template-compiler',
  'runtime-html',
  'dialog',
  'web-components',
  'i18n',
  'fetch-client',
  'route-recognizer',
  'router',
  'router-direct',
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

const devPackages = ((args.d ?? []) as string[]).filter(pkg => !alwaysBuildPackages.includes(pkg));
if (devPackages.some(d => !validPackages.includes(d))) {
  throw new Error(`Invalid package config, valid packages are: ${validPackages}`);
}
// Core tests resolve framework development builds; tooling packages have their own test workspaces.
const activePackageDistRoots = [...new Set([...alwaysBuildPackages, ...devPackages])]
  .map(pkg => `packages/${pkg}/dist`);
const testCommandConfig = createTestCommandConfig(
  rawTestPatterns,
  args['node-tests'],
  activePackageDistRoots,
  createTestBuildToken(),
);
const testEnvVars = { ...envVars, ...testCommandConfig.env };

validPackages
  .filter(pkg => !isEsmBuilt(path.resolve(__dirname, `../packages/${pkg}`)))
  .forEach((pkgName) => {
    const start = Date.now();
    const pkgDisplay = c.green(pkgName);
    console.log(`${pkgDisplay} has not been built before, building...`);
    execSync(buildCmd, { cwd: `packages/${pkgName}` });
    console.log(`${pkgDisplay} built in ${getElapsed(Date.now(), start)}s`);
  });

const validToolingPackages =  [
  'plugin-conventions',
  'plugin-gulp',
  'ts-jest',
  'babel-jest',
  'parcel-transformer',
  'vite-plugin',
  'webpack-loader'
];

validToolingPackages
  .filter(pkg => !isFullyBuilt(path.resolve(__dirname, `../packages-tooling/${pkg}`)))
  .forEach(pkgName => {
    const start = Date.now();
    const pkgDisplay = c.green(pkgName);
    console.log(`${pkgDisplay} has not been built before, building...`);
    try {
      execSync(buildCmd, { cwd: `packages-tooling/${pkgName}` });
    } catch (ex) {
      const $ex = ex as { stdout?: string; stderr?: string };
      if ($ex.stdout) process.stdout.write($ex.stdout);
      if ($ex.stderr) process.stderr.write($ex.stderr);
      process.exit(1);
    }
    console.log(`${pkgDisplay} built in ${getElapsed(Date.now(), start)}s`);
  });

const apps = (args.a ?? []) as string[];
const validApps = [
  'ui-virtualization',
  'router-animation',
  'router-hooks',
];
const toolings = args.l;

if (apps.length > 0) {
  if (apps.some(a => !validApps.includes(a))) {
    throw new Error(`Invalid apps, valid options are: ${validApps}`);
  }
}

const baseAppPort = 9000;
const outputStream = logFile === null ? undefined : createDevLogStream(logFile);
const logFailure = outputStream === undefined
  ? undefined
  : new Promise<Error>(resolve => outputStream.once('error', resolve));
if (logFile !== null) {
  console.log(`Writing dev output to ${c.green(logFile)}`);
}

const devProcesses = concurrently([
  { command: devCmd, cwd: 'packages/kernel', name: 'kernel', env: envVars },
  { command: devCmd, cwd: 'packages/runtime', name: 'runtime', env: envVars },
  { command: devCmd, cwd: 'packages/template-compiler', name: 'template-compiler', env: envVars },
  { command: devCmd, cwd: 'packages/runtime-html', name: 'runtime-html', env: envVars },
  hasValidTestPatterns
    ? {
      command: testCommandConfig.buildCommand,
      cwd: 'packages/__tests__',
      name: '__tests__(build)',
      env: testEnvVars
    }
    : null!,
  ...devPackages.map((folder: string) => ({
    command: devCmd,
    cwd: `packages/${folder}`,
    name: folder,
    env: envVars
  })),
  hasValidTestPatterns
    ? {
      command: testCommandConfig.runCommand,
      cwd: 'packages/__tests__',
      name: args['node-tests'] ? '__tests__(run:node)' : '__tests__(run)',
      env: testEnvVars
    }
    : null!,
  ...(e2e ?? []).map(e => ({ command: 'npm run test:watch', cwd: `packages/__e2e__/${e}`, env: envVars, name: `__e2e__(${e})` })),
  ...apps.map((appFolder, i) => ({
    command: devCmd,
    cwd: `examples/${appFolder}`,
    name: `${appFolder} (app)`,
    env: { ...envVars, WEBPACK_PORT: baseAppPort + i },
  })),
  ...(toolings ?? []).map(tl => ({
    command: 'npm run dev',
    cwd: `packages-tooling/${tl}`,
    env: envVars,
    name: `${tl}`
  }))
].filter(Boolean), {
  prefix: '[{name}]',
  killOthers: ['failure', 'success'],
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
  outputStream,
});

// Concurrently owns signal propagation and child-tree cleanup. Finalize the log only after it settles.
void settleDevProcesses(devProcesses, outputStream, logFailure);

function isEsmBuilt(pkgPath: string): boolean {
  return fs.existsSync(`${pkgPath}/dist/esm/index.mjs`);
}

function isCjsBuilt(pkgPath: string): boolean {
  return fs.existsSync(`${pkgPath}/dist/cjs/index.cjs`);
}

function isFullyBuilt(pkgPath: string): boolean {
  return isEsmBuilt(pkgPath) && isCjsBuilt(pkgPath);
}

function getElapsed(now: number, then: number) {
  return ((now - then) / 1000).toFixed(2);
}

async function settleDevProcesses(
  devProcesses: { commands: readonly { kill(): void }[]; result: Promise<unknown> },
  logStream: Writable | undefined,
  logFailure: Promise<Error> | undefined,
): Promise<void> {
  let failed = await waitForDevProcesses(devProcesses, logFailure);

  try {
    await closeDevLogStream(logStream);
  } catch (error) {
    console.error('Failed to finish the development log:', error);
    failed = true;
  }

  if (failed) {
    process.exitCode = 1;
  }
}
