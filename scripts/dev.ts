/* eslint-disable no-console */
import concurrently from 'concurrently';
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Writable } from 'stream';
import { c } from './logger';

const args = yargs
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
    default: '.tmp/dev.log',
  })
  .parseSync();

const envVars = { DEV_MODE: true };
const testPatterns = (args.t ?? []).join(' ');
const hasValidTestPatterns = testPatterns !== '';

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
If it is intended to run all test, then specified --test *
If it is intended to run e2e test, then specified --e2e + one of the following: ${validE2e}`);
  process.exit(0);
}

const devCmd = 'npm run dev';
const buildCmd = 'npm run build';
const logFile = path.resolve(process.cwd(), args['log-file']);

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
      if (ex.stdout) process.stdout.write(ex.stdout);
      if (ex.stderr) process.stderr.write(ex.stderr);
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
const outputStream = createTeeStream(logFile);
console.log(`Writing dev output to ${c.green(logFile)}`);

concurrently([
  { command: devCmd, cwd: 'packages/kernel', name: 'kernel', env: envVars },
  { command: devCmd, cwd: 'packages/runtime', name: 'runtime', env: envVars },
  { command: devCmd, cwd: 'packages/template-compiler', name: 'template-compiler', env: envVars },
  { command: devCmd, cwd: 'packages/runtime-html', name: 'runtime-html', env: envVars },
  hasValidTestPatterns
    ? {
      command: `npm run dev:tsc ${testPatterns === '*' ? '*' : testPatterns}`,
      cwd: 'packages/__tests__',
      name: '__tests__(build)',
      env: envVars
    }
    : null,
  ...devPackages.map((folder: string) => ({
    command: devCmd,
    cwd: `packages/${folder}`,
    name: folder,
    env: envVars
  })),
  hasValidTestPatterns
    ? {
      command: args['node-tests']
        ? `node -e "new Promise(r => setTimeout(r, 6000))" && npm run test-node:watch:focus -- ${testPatterns === '*' ? '*' : testPatterns}`
        : `node -e "new Promise(r => setTimeout(r, 6000))" && npm run test-chrome:debugger ${testPatterns === '*' ? '' : testPatterns}`,
      cwd: 'packages/__tests__',
      name: args['node-tests'] ? '__tests__(run:node)' : '__tests__(run)',
      env: envVars
    }
    : null,
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

function createTeeStream(filePath: string): Writable {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `# aurelia dev log\n# started ${new Date().toISOString()}\n\n`);
  const fileStream = fs.createWriteStream(filePath, { flags: 'a' });

  const close = () => fileStream.end();
  process.on('exit', close);
  process.on('SIGINT', () => {
    close();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    close();
    process.exit(143);
  });

  return new Writable({
    write(chunk, encoding, callback) {
      process.stdout.write(chunk, encoding);
      fileStream.write(chunk, encoding, callback);
    }
  });
}
