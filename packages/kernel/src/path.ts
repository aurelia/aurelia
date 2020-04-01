function trimDots(ary: string[]): void {
  const len = ary.length;
  let i = 0;
  let part: string;
  for (; i < len; ++i) {
    part = ary[i];
    if (part === '.') {
      ary.splice(i, 1);
      i -= 1;
    } else if (part === '..') {
      // If at the start, or previous value is still ..,
      // keep them so that when converted to a path it may
      // still work when converted to a path, even though
      // as an ID it is less than ideal. In larger point
      // releases, may be better to just kick out an error.
      if (i === 0 || (i === 1 && ary[2] === '..') || ary[i - 1] === '..') {
        continue;
      }
      if (i > 0) {
        ary.splice(i - 1, 2);
        i -= 2;
      }
    }
  }
}

/**
 * Calculates a path relative to a file.
 *
 * @param name - The relative path.
 * @param file - The file path.
 * @returns The calculated path.
 */
export function relativeToFile(name: string, file: string): string {
  const fileParts = !file ? file : file.split('/');
  const nameParts = name.trim().split('/');

  if (nameParts[0].startsWith('.') && fileParts) {
    // Convert file to array, and lop off the last part,
    // so that . matches that 'directory' and not name of the file's
    // module. For instance, file of 'one/two/three', maps to
    // 'one/two/three.js', but we want the directory, 'one/two' for
    // this normalization.
    const normalizedBaseParts = fileParts.slice(0, fileParts.length - 1);
    nameParts.unshift(...normalizedBaseParts);
  }

  trimDots(nameParts);

  return nameParts.join('/');
}

/**
 * Joins two paths.
 *
 * @param path1 - The first path.
 * @param path2 - The second path.
 * @returns The joined path.
 */
export function join(path1: string, path2: string): string {
  if (!path1) {
    return path2;
  }
  if (!path2) {
    return path1;
  }
  const schemeMatch = /^([^/]*?:)\//.exec(path1);
  const scheme = (schemeMatch && schemeMatch.length > 0) ? schemeMatch[1] : '';
  path1 = path1.slice(scheme.length);

  let urlPrefix: string;
  if (path1.startsWith('///') && scheme === 'file:') {
    urlPrefix = '///';
  } else if (path1.startsWith('//')) {
    urlPrefix = '//';
  } else if (path1.startsWith('/')) {
    urlPrefix = '/';
  } else {
    urlPrefix = '';
  }

  const trailingSlash = path2.endsWith('/') ? '/' : '';

  const url1 = path1.split('/');
  const url2 = path2.split('/');
  const url3 = [];

  for (let i = 0, ii = url1.length; i < ii; ++i) {
    if (url1[i] === '..') {
      url3.pop();
    } else if (url1[i] !== '.' && url1[i] !== '') {
      url3.push(url1[i]);
    }
  }

  for (let i = 0, ii = url2.length; i < ii; ++i) {
    if (url2[i] === '..') {
      url3.pop();
    } else if (url2[i] !== '.' && url2[i] !== '') {
      url3.push(url2[i]);
    }
  }

  return scheme + urlPrefix + url3.join('/') + trailingSlash;
}
