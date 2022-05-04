import concurrently from 'concurrently';
import yargs from 'yargs';

const args = yargs
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

concurrently([
  { command: 'npm run dev', cwd: 'packages/runtime', name: 'runtime', env: envVars },
  { command: 'npm run dev', cwd: 'packages/runtime-html', name: 'runtime-html', env: envVars },
  { command: 'npm run dev', cwd: 'packages/__tests__', name: '__tests__', env: envVars },
  ...(args.d ?? []).map((folder: string) => ({
    command: 'npm run dev',
    cwd: `packages/${folder}`,
    name: folder,
    env: envVars
  }))
], {
  prefix: '[{name}]',
  prefixColors: [
    'green',
    'blue',
    'cyan',
    'white',
    'greenBright',
    'blueBright',
    'magentaBright',
    'cyanBright',
  ]
});
