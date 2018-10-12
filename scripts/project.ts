import { join, resolve } from 'path';
import { PLATFORM } from '../packages/kernel/src/platform';
import * as lernaJson from '../lerna.json';
import * as packageJson from '../package.json';

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
    const name = p.split('/')[1];
    const path = join(packagesPath, name);
    const changelog = {
      path: join(path, 'CHANGELOG.md')
    };
    const src = join(path, 'src');
    const scopedName = `@aurelia/${name}`;
    const coverage = join(rootPath, 'coverage', name);
    const jsName = PLATFORM.camelCase(name);
    const namespace = `au`;
    const fullName = `${namespace}.${jsName}`;
    const dist = join(path, 'dist');
    const umd = join(dist, `index.umd.js`);
    const es6 = join(dist, `index.es6.js`);
    const system = join(dist, `index.system.js`);
    const amd = join(dist, `index.amd.js`);
    const cjs = join(dist, `index.cjs.js`);
    const iife = join(rootPath, 'dist', `${name}.js`);
    return { name, jsName, namespace, fullName, path, changelog, iife, umd, es6, system, amd, cjs, src, dist, scopedName, coverage };
  }),
  'scripts': {
    'path': join(rootPath, 'scripts')
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
}
