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

const encode = encodeURIComponent;
const encodeKey = (k: string) => encode(k).replace('%24', '$');

// these types are reverse-engineered from aurelia-path.. don't shoot the messenger..
type Scalar = null | undefined | boolean | number | string;
export interface IQueryParams {
  [key: string]: Scalar | this | (string | string[] | this)[];
}
type ComplexQueryParams = Scalar | IQueryParams | (string | string[] | IQueryParams)[];
type SimpleQueryParams = string | IQueryParams | (string | IQueryParams)[];

/**
 * Recursively builds part of query string for parameter.
 *
 * @param key - Parameter name for query string.
 * @param value - Parameter value to deserialize.
 * @param traditional - Boolean Use the old URI template standard (RFC6570)
 * @returns Array with serialized parameter(s)
 */
function buildParam(key: string, value: ComplexQueryParams, traditional?: boolean): string[] {
  let result: string[] = [];
  if (value == null) {
    return result;
  }
  if (Array.isArray(value)) {
    for (let i = 0, l = value.length; i < l; i++) {
      if (traditional) {
        result.push(`${encodeKey(key)}=${encode(value[i] as string)}`);
      } else {
        const arrayKey = `${key}[${(typeof value[i] === 'object' && value[i] != null ? i : '')}]`;
        result = result.concat(buildParam(arrayKey, value[i]));
      }
    }
  } else if (typeof value === 'object' && !traditional) {
    for (const propertyName in value) {
      result = result.concat(buildParam(`${key}[${propertyName}]`, value[propertyName]));
    }
  } else {
    result.push(`${encodeKey(key)}=${encode(value as string)}`);
  }
  return result;
}

/**
 * Generate a query string from an object.
 *
 * @param params - Object containing the keys and values to be used.
 * @param traditional - Boolean Use the old URI template standard (RFC6570)
 * @returns The generated query string, excluding leading '?'.
 */
export function buildQueryString(params?: IQueryParams, traditional?: boolean): string {
  if (params == null) {
    return '';
  }
  const pairs: string[] = [];
  const keys = Object.keys(params).sort();
  let key: string;
  for (let i = 0, len = keys.length; i < len; ++i) {
    key = keys[i];
    pairs.push(...buildParam(key, params[key], traditional));
  }

  if (pairs.length === 0) {
    return '';
  }

  return pairs.join('&');
}

/**
 * Process parameter that was recognized as scalar param (primitive value or shallow array).
 *
 * @param existedParam - Object with previously parsed values for specified key.
 * @param value - Parameter value to append.
 * @returns Initial primitive value or transformed existedParam if parameter was recognized as an array.
 */
function processScalarParam(existedParam: SimpleQueryParams, value: string | IQueryParams): SimpleQueryParams {
  if (Array.isArray(existedParam)) {
    // value is already an array, so push on the next value.
    existedParam.push(value);
    return existedParam;
  }
  if (existedParam !== undefined) {
    // value isn't an array, but since a second value has been specified,
    // convert value into an array.
    return [existedParam, value];
  }
  // value is a scalar.
  return value;
}
/**
 * Sequentially process parameter that was recognized as complex value (object or array).
 * For each keys part, if the current level is undefined create an
 * object or array based on the type of the next keys part.
 *
 * @param queryParams - root-level result object.
 * @param keys - Collection of keys related to this parameter.
 * @param value - Parameter value to append.
 */
function parseComplexParam(queryParams: IQueryParams, keys: (string | number)[], value: string): void {
  let currentParams = queryParams as IQueryParams & (string | IQueryParams)[];
  const keysLastIndex = keys.length - 1;
  let key: number;
  let prevValue: SimpleQueryParams;
  for (let j = 0; j <= keysLastIndex; ++j) {
    key = (keys[j] === '' ? currentParams.length : keys[j]) as number;
    if (j < keysLastIndex) {
      // The value has to be an array or a false value
      // It can happen that the value is no array if the key was repeated with traditional style like `list=1&list[]=2`
      if (!currentParams[key] || typeof currentParams[key] === 'object') {
        prevValue = currentParams[key];
      } else {
        prevValue = [currentParams[key]];
      }
      if (prevValue) {
        currentParams = currentParams[key] = prevValue as typeof currentParams;
      } else if (isNaN(keys[j + 1] as number)) {
        // Kinda have no choice here
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        currentParams = currentParams[key] = {} as typeof currentParams;
      } else {
        currentParams = currentParams[key] = [] as [] & typeof currentParams;
      }
    } else {
      currentParams = currentParams[key] = value as string & typeof currentParams;
    }
  }
}

/**
 * Parse a query string into a queryParams object.
 *
 * @param queryString - The query string to parse.
 * @returns Object with keys and values mapped from the query string.
 */
export function parseQueryString(queryString: string): IQueryParams {
  const queryParams: IQueryParams = {};
  if (!queryString || typeof queryString !== 'string') {
    return queryParams;
  }

  let query = queryString;
  if (query.startsWith('?')) {
    query = query.slice(1);
  }

  const pairs = query.replace(/\+/g, ' ').split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    const key = decodeURIComponent(pair[0]);
    if (!key) {
      continue;
    }
    // split object key into its parts
    let keys = key.split('][');
    let keysLastIndex = keys.length - 1;

    // If the first keys part contains [ and the last ends with ], then []
    // are correctly balanced, split key to parts
    // Else it's basic key
    if (keys[0].includes("[") && keys[keysLastIndex].endsWith("]")) {
      keys[keysLastIndex] = keys[keysLastIndex].replace(/\]$/, '');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      keys = keys.shift()!.split('[').concat(keys); // outer condition already ensures not-null
      keysLastIndex = keys.length - 1;
    } else {
      keysLastIndex = 0;
    }

    if (pair.length >= 2) {
      const value = pair[1] ? decodeURIComponent(pair[1]) : '';
      if (keysLastIndex) {
        parseComplexParam(queryParams, keys, value);
      } else {
        queryParams[key] = processScalarParam(queryParams[key] as SimpleQueryParams, value);
      }
    } else {
      queryParams[key] = true;
    }
  }
  return queryParams;
}
