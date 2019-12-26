import { Char } from '@aurelia/kernel';

export type MaybePromise<T> = T | Promise<T>;

export function awaitIfPromise<T, R>(
  maybePromise: MaybePromise<T>,
  condition: (value: T) => boolean,
  then: (value: T) => R,
): R {
  if (maybePromise instanceof Promise) {
    return maybePromise.then(function (value) {
      if (condition(value)) {
        return then(value);
      }

      return value;
    }) as unknown as R;
  }

  if (condition(maybePromise)) {
    return then(maybePromise);
  }

  return maybePromise as unknown as R;
}

export function computeCommonRootDirectory(dirs: readonly string[]): string {
  let commonRootDir = dirs[0];
  const initialLength = commonRootDir.length;
  let currentLength = initialLength;
  let prevSlashIndex = 0;
  for (let i = 1, ii = dirs.length; i < ii; ++i) {
    const dir = dirs[i];
    for (let j = 0, jj = currentLength; j < jj; ++j) {
      const ch = commonRootDir.charCodeAt(j);
      if (ch === Char.Slash) {
        prevSlashIndex = j;
      }
      if (ch !== dir.charCodeAt(j)) {
        currentLength = prevSlashIndex + 1;
        prevSlashIndex = 0;
        break;
      }
    }
  }

  if (currentLength !== initialLength) {
    commonRootDir = commonRootDir.slice(0, currentLength - 1);
  }

  return commonRootDir;
}
