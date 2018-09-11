import { join, resolve } from 'path';
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
  'coverage': {
    'path': join(rootPath, 'coverage')
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
    const src = join(path, 'src');
    const scopedName = `@aurelia/${name}`;
    const coverage = join(rootPath, 'coverage', name);
    return { name, path, src, scopedName, coverage };
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
    'path': join(rootPath, 'package.json')
  }
}
