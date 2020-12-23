import { join } from 'path';
import * as packageJson from '../package.json';

// TODO: generate this file automatically

const rootPath = process.cwd();

const testApps = [
  'jit-webpack-conventions-ts',
  'jit-webpack-vanilla-ts'
] as [
  'jit-webpack-conventions-ts',
  'jit-webpack-vanilla-ts'
];

function camelCase(input: string): string {
  const parts = input.split('-');
  return `${parts[0]}${parts.slice(1).map(x => `${x[0].toUpperCase()}${x.slice(1)}`).join('')}`;
}

export default {
  'path': rootPath,
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
  'examples': testApps.reduce((acc, app) => {
    acc[app] = {
      'path': join(rootPath, 'examples', app)
    };
    return acc;
  }, {}),
  'node_modules': {
    'path': join(rootPath, 'node_modules')
  },
  'packages': packageJson.workspaces.map(p => {
    const [folder, kebabName] = p.split('/');
    const camelName = camelCase(kebabName);

    const path = join(rootPath, folder, kebabName);
    const nodeModules = join(path, 'node_modules');
    const coverage = join(rootPath, 'coverage', kebabName);
    const tsconfig = join(path, 'tsconfig.json');
    const changelog = join(path, 'CHANGELOG.md');

    const srcPath = join(path, 'src');
    const src = {
      path: srcPath,
      entry: join(srcPath, 'index.ts'),
    };

    const name = {
      kebab: kebabName,
      camel: camelName,
      npm: kebabName === 'aurelia'
        ? 'aurelia'
        : kebabName === 'au'
          ? 'au'
          : `@aurelia/${kebabName}`
    };
    return { path, folder, nodeModules, coverage, tsconfig, changelog, src, name };
  }),
  'scripts': {
    'path': join(rootPath, 'scripts'),
    'tsconfig.test':  join(rootPath, 'scripts', 'tsconfig.test.json')
  },
  'test': {
    'path': join(rootPath, 'test'),
  },
  'package.json': {
    'path': join(rootPath, 'package.json')
  },
};
