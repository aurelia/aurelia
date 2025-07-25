/* eslint-disable */
const { existsSync, writeFileSync, unlinkSync } = require('fs');
const { resolve } = require('path');
const { execSync } = require('child_process');

const testPatterns = process.argv.slice(2);
const baseConfig = require('./tsconfig.json');
const config = {
  ...baseConfig,
  compilerOptions: {
    ...baseConfig.compilerOptions,
    composite: false,
    incremental: false,
    tsBuildInfoFile: null,
  },
  include: [
    'assets-modules.d.ts',
    'src/*.ts',
    ...testPatterns.flatMap(pattern => {
      pattern = pattern.replace(/\.ts$/, '');
      return [
        `src/**/*${pattern}*.ts`,
        `src/**/*${pattern}*.tsx`,
        `src/**/${pattern}/**/*.ts`,
        `src/**/${pattern}/**/*.tsx`,
        `src/**/*${pattern}*/**/*.ts`,
        `src/**/*${pattern}*/**/*.tsx`,
      ]
    })
  ],
  exclude: [
    ...baseConfig.exclude,
    'src/3-runtime/generated',
  ]
};

if (existsSync(resolve(__dirname, './dist/.tsbuildinfo'))) {
  unlinkSync(resolve(__dirname, './dist/.tsbuildinfo'));
}

writeFileSync(
  resolve(__dirname, '.tsconfig.dev.json'),
  JSON.stringify(config, null, 2)
);

execSync('tsc -p .tsconfig.dev.json --watch', { stdio: 'inherit' });
