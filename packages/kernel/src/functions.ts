const camelCaseLookup: Record<string, string> = {};
const kebabCaseLookup: Record<string, string> = {};
const isNumericLookup: Record<string, boolean> = {};

/**
 * Efficiently determine whether the provided property key is numeric
 * (and thus could be an array indexer) or not.
 *
 * Always returns true for values of type `'number'`.
 *
 * Otherwise, only returns true for strings that consist only of positive integers.
 *
 * Results are cached.
 */
export function isNumeric(value: unknown): value is number | string {
  switch (typeof value) {
    case 'number':
      return true;
    case 'string': {
      const result = isNumericLookup[value];
      if (result !== void 0) {
        return result;
      }
      const { length } = value;
      if (length === 0) {
        return isNumericLookup[value] = false;
      }
      let ch = 0;
      for (let i = 0; i < length; ++i) {
        ch = value.charCodeAt(i);
        if (ch < 0x30 /*0*/ || ch > 0x39/*9*/) {
          return isNumericLookup[value] = false;
        }
      }
      return isNumericLookup[value] = true;
    }
    default:
      return false;
  }
}

/**
 * Efficiently convert a kebab-cased string to camelCase.
 *
 * Separators that signal the next character to be capitalized, are: `-`, `.`, `_`.
 *
 * Primarily used by Aurelia to convert DOM attribute names to ViewModel property names.
 *
 * Results are cached.
 */
export function camelCase(input: string): string {
  // benchmark: http://jsben.ch/qIz4Z
  let value = camelCaseLookup[input];
  if (value !== void 0) return value;
  value = '';
  let first = true;
  let sep = false;
  let char: string;
  for (let i = 0, ii = input.length; i < ii; ++i) {
    char = input.charAt(i);
    if (char === '-' || char === '.' || char === '_') {
      sep = true; // skip separators
    } else {
      value = value + (first ? char.toLowerCase() : (sep ? char.toUpperCase() : char));
      sep = false;
    }
    first = false;
  }
  return camelCaseLookup[input] = value;
}

/**
 * Efficiently convert a camelCased string to kebab-case.
 *
 * Primarily used by Aurelia to convert ViewModel property names to DOM attribute names.
 *
 * Results are cached.
 */
export function kebabCase(input: string): string {
  // benchmark: http://jsben.ch/v7K9T
  let value = kebabCaseLookup[input];
  if (value !== void 0) return value;
  value = '';
  let first = true;
  let char: string, lower: string;
  for (let i = 0, ii = input.length; i < ii; ++i) {
    char = input.charAt(i);
    lower = char.toLowerCase();
    value = value + (first ? lower : (char !== lower ? `-${lower}` : lower));
    first = false;
  }
  return kebabCaseLookup[input] = value;
}

/**
 * Efficiently (up to 10x faster than `Array.from`) convert an `ArrayLike` to a real array.
 *
 * Primarily used by Aurelia to convert DOM node lists to arrays.
 */
export function toArray<T = unknown>(input: ArrayLike<T>): T[] {
  // benchmark: http://jsben.ch/xjsyF
  const { length } = input;
  const arr = Array(length);
  for (let i = 0; i < length; ++i) {
      arr[i] = input[i];
  }
  return arr;
}

const ids: Record<string, number> = {};

/**
 * Retrieve the next ID in a sequence for a given string, starting with `1`.
 *
 * Used by Aurelia to assign unique ID's to controllers and resources.
 *
 * Aurelia will always prepend the context name with `au$`, so as long as you avoid
 * using that convention you should be safe from collisions.
 */
export function nextId(context: string): number {
  if (ids[context] === void 0) {
    ids[context] = 0;
  }
  return ++ids[context];
}

/**
 * Reset the ID for the given string, so that `nextId` will return `1` again for the next call.
 *
 * Used by Aurelia to reset ID's in between unit tests.
 */
export function resetId(context: string): void {
  ids[context] = 0;
}
