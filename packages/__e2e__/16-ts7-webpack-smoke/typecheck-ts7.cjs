'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const packageJsonPath = require.resolve('@typescript/native/package.json', { paths: [__dirname] });
const { bin, version } = require(packageJsonPath);

if (!version.startsWith('7.0.')) {
  throw new Error(`Expected the TypeScript 7.0 CLI, but resolved ${version} from ${packageJsonPath}`);
}

const result = spawnSync(process.execPath, [path.resolve(path.dirname(packageJsonPath), bin.tsc), '--noEmit'], {
  cwd: __dirname,
  stdio: 'inherit',
});

if (result.error !== void 0) {
  throw result.error;
}
process.exitCode = result.status ?? 1;
