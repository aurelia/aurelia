const camelCaseLookup: Record<string, string> = {};
const kebabCaseLookup: Record<string, string> = {};

export const PLATFORM = {
  global: (function(): unknown {
    // Workers don’t have `window`, only `self`
    // https://github.com/Microsoft/tslint-microsoft-contrib/issues/415
    // tslint:disable-next-line:no-typeof-undefined
    if (typeof self !== 'undefined') {
      return self;
    }

    // https://github.com/Microsoft/tslint-microsoft-contrib/issues/415
    // tslint:disable-next-line:no-typeof-undefined
    if (typeof global !== 'undefined') {
      return global;
    }

    // Not all environments allow eval and Function
    // Use only as a last resort:
    // tslint:disable-next-line:no-function-constructor-with-string-args
    return new Function('return this')();
  })(),
  emptyArray: Object.freeze([]),
  emptyObject: Object.freeze({}),
  /* tslint:disable-next-line:no-empty */
  noop(): void { },
  now(): number {
    return performance.now();
  },

  camelCase(input: string): string {
    // benchmark: http://jsben.ch/qIz4Z
    let value = camelCaseLookup[input];
    if (value !== undefined) return value;
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
  },

  kebabCase(input: string): string {
    // benchmark: http://jsben.ch/v7K9T
    let value = kebabCaseLookup[input];
    if (value !== undefined) return value;
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
  },

  toArray<T = unknown>(input: ArrayLike<T>): T[] {
    // benchmark: http://jsben.ch/xjsyF
    const len = input.length;
    const arr = Array(len);
    for (let i = 0; i < len; ++i) {
        arr[i] = input[i];
    }
    return arr;
  },

  requestAnimationFrame(callback: (time: number) => void): number {
    return requestAnimationFrame(callback);
  }
};
