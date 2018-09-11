import * as path from 'path';
import lernaConfig from '../lerna.json';

export function getAlias(packagesDir: string): { [key: string]: string } {
  // get the plain package names from lerna.json
  const packageNames = lernaConfig.packages.map(p => p.split('/')[1]);
  const alias = {};
  for (const name of packageNames) {
    alias[`@aurelia/${name}`] = path.join(packagesDir, name, 'src');
  }
  return alias;
}

export function getNames(): string[] {
  return lernaConfig.packages.map(p => p.split('/')[1]);
}
