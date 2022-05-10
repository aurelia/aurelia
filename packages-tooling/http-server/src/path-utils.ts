import { join, resolve } from 'path';

export const normalizePath = (function () {
  const cache: Record<string, string | undefined> = Object.create(null);
  const regex = /\\/g;
  return function (path: string) {
    let normalized = cache[path];
    if (normalized === void 0) {
      normalized = cache[path] = path.replace(regex, '/');
    }
    return normalized;
  };
})();

export function joinPath(...paths: string[]): string {
  return normalizePath(join(...paths));
}

export function resolvePath(...paths: string[]): string {
  return normalizePath(resolve(...paths));
}
