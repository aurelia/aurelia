import { join, resolve } from 'path';
import * as lernaJson from '../lerna.json';
import * as packageJson from '../package.json';
import { PLATFORM } from '../packages/kernel/src/platform';

// TODO: generate this file automatically

const rootPath = resolve(__dirname, '..');
const packagesPath = join(rootPath, 'packages');

export default {
  'path': rootPath,
  'lerna': lernaJson,
  'pkg': packageJson,
  '.circleci': {
    'path': join(rootPath, '.circleci')
  },
  '.vscode': {
    'path': join(rootPath, '.vscode')
  },
  'changelog': {
    'path': join(rootPath, 'docs', 'CHANGELOG.md')
  },
  'coverage': {
    'path': join(rootPath, 'coverage')
  },
  'dist': {
    'path': join(rootPath, 'dist')
  },
  'docs': {
    'path': join(rootPath, 'docs')
  },
  'node_modules': {
    'path': join(rootPath, 'node_modules')
  },
  'packages': lernaJson.packages.map(p => {
    const kebabName = p.split('/')[1];
    const camelName = PLATFORM.camelCase(kebabName);

    const path = join(packagesPath, kebabName);
    const node_modules = join(path, 'node_modules');
    const coverage = join(rootPath, 'coverage', kebabName);
    const tsconfig = join(path, 'tsconfig.json');
    const changelog = join(path, 'CHANGELOG.md');

    const srcPath = join(path, 'src');
    const src = {
      path: srcPath,
      entry: join(srcPath, 'index.ts'),
      entryFull: join(srcPath, 'index.full.ts')
    };

    const testPath = join(path, 'test');
    const test = {
      path: testPath,
      setup: join(testPath, 'setup.ts'),
      tsconfig: join(testPath, 'tsconfig.json')
    };

    const distPath = join(path, 'dist');
    const dist = {
      path: distPath,
      umd: join(distPath, `index.umd.js`),
      esm: join(distPath, `index.es6.js`),
      system: join(distPath, `index.system.js`),
      amd: join(distPath, `index.amd.js`),
      cjs: join(distPath, `index.cjs.js`),
      iife: join(distPath, `index.iife.js`),
      iifeFull: join(distPath, `index.iife.full.js`)
    };

    const name = {
      kebab: kebabName,
      camel: camelName,
      npm: `@aurelia/${kebabName}`,
      namespace: 'au',
      iife: `au.${camelName}`,
    }
    return { path, node_modules, coverage, tsconfig, changelog, src, test, dist, name };
  }),
  'scripts': {
    'path': join(rootPath, 'scripts'),
    'tsconfig.test':  join(rootPath, 'scripts', 'tsconfig.test.json')
  },
  'test': {
    'path': join(rootPath, 'test')
  },
  'package.json': {
    'path': join(rootPath, 'package.json')
  },
  'lerna.json': {
    'path': join(rootPath, 'lerna.json')
  }
};
