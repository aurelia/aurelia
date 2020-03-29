
// these types are reverse-engineered from aurelia-path.. don't shoot the messenger..
type Scalar = null | undefined | boolean | number | string;
export interface IQueryParams {
  [key: string]: Scalar | this | (string | string[] | this)[];
}
type SimpleQueryParams = string | IQueryParams | (string | IQueryParams)[];

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
