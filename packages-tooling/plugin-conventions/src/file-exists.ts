/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import * as fs from 'fs';
import * as path from 'path';
import { IFileSystem, IFileUnit } from './options';

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

export function readFile(unit: IFileUnit, relativeOrAbsolutePath: string): string {
  const p = resolveFilePath(unit, relativeOrAbsolutePath);
  return fs.readFileSync(p, 'utf-8');
}

export const nodeFileSystem: IFileSystem = {
  exists: fileExists,
  read: readFile,
};

export function createMemoryFileSystem(
  files: Record<string, string>,
  root: string = ''
): IFileSystem {
  const normalizedFiles = new Map<string, string>();
  for (const [filePath, contents] of Object.entries(files)) {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(root, filePath);
    normalizedFiles.set(normalizePath(absolutePath), contents);
  }

  return {
    exists(unit, relativeOrAbsolutePath) {
      return normalizedFiles.has(normalizePath(resolveFilePath(unit, relativeOrAbsolutePath)));
    },
    read(unit, relativeOrAbsolutePath) {
      const resolvedPath = normalizePath(resolveFilePath(unit, relativeOrAbsolutePath));
      const contents = normalizedFiles.get(resolvedPath);
      if (contents == null) {
        throw new Error(`File not found in memory file system: ${resolvedPath}`);
      }
      return contents;
    }
  };
}

function normalizePath(filePath: string): string {
  return path.normalize(filePath).replace(/\\/g, '/');
}
