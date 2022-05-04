import concurrently, { ConcurrentlyCommandInput } from 'concurrently';
import yargs from 'yargs';
import fs from 'fs';

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
  // eslint-disable-next-line no-console
  console.log(
`There are no test pattern specified. This will run all tests if go ahead. Aborting...
If it is intended to run all test, then specified --test *
`);
  process.exit(0);
}

const devCmd = 'npm run dev';
const buildCmd = 'npm run build';

concurrently([
  ...['metadata', 'platform', 'platform-browser', 'kernel', 'testing'].map(ensurePackageBuiltCmd),
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
].filter(Boolean), {
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

function ensurePackageBuiltCmd(name: string): ConcurrentlyCommandInput | null {
  return fs.existsSync(`packages/${name}/dist/esm/index.mjs`)
    ? null
    : { command: buildCmd, name, env: envVars, cwd: `packages/${name}` };
}
