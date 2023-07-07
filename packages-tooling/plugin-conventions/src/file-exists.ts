/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import * as fs from 'fs';
import * as path from 'path';
import { IFileUnit } from './options';

export function resolveFilePath(unit: IFileUnit, relativeOrAbsolutePath: string): string {
  if (relativeOrAbsolutePath.startsWith('.')) {
    // ./foo or ../foo/bar
    return path.resolve(unit.base || '', path.dirname(unit.path), relativeOrAbsolutePath);
  } else {
    // foo or foo/bar
    return path.resolve(unit.base || '', relativeOrAbsolutePath);
  }
}

export function fileExists(unit: IFileUnit, relativeOrAbsolutePath: string): boolean {
  const p = resolveFilePath(unit, relativeOrAbsolutePath);

  try {
    const stats = fs.statSync(p);
    return stats.isFile();
  } catch (e) {
    return false;
  }
}
