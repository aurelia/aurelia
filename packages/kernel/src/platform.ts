const camelCaseLookup = {};
const kebabCaseLookup = {};

const fromCharCode = String.fromCharCode;

export const PLATFORM = {
  global: (function() {
    // Workers don’t have `window`, only `self`
    if (typeof self !== 'undefined') {
      return self;
    }

    if (typeof global !== 'undefined') {
      return global;
    }

    // Not all environments allow eval and Function
    // Use only as a last resort:
    return new Function('return this')();
  })(),
  emptyArray: Object.freeze([]),
  emptyObject: Object.freeze({}),
  /* tslint:disable-next-line:no-empty */
  noop() { },
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

  toArray<T = any>(input: ArrayLike<T>): T[] {
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
  },

  createTaskFlushRequester(onFlush: () => void) {
    return function requestFlush() {
      // We dispatch a timeout with a specified delay of 0 for engines that
      // can reliably accommodate that request. This will usually be snapped
      // to a 4 millisecond delay, but once we're flushing, there's no delay
      // between events.
      const timeoutHandle = setTimeout(handleFlushTimer, 0);

      // However, since this timer gets frequently dropped in Firefox
      // workers, we enlist an interval handle that will try to fire
      // an event 20 times per second until it succeeds.
      const intervalHandle = setInterval(handleFlushTimer, 50);

      function handleFlushTimer() {
        // Whichever timer succeeds will cancel both timers and request the
        // flush.
        clearTimeout(timeoutHandle);
        clearInterval(intervalHandle);
        onFlush();
      }
    };
  },

  createMicroTaskFlushRequestor(onFlush: () => void): () => void {
    const observer = new MutationObserver(onFlush);
    const node = document.createTextNode('');
    const values = Object.create(null);
    let val = 'a';

    values.a = 'b';
    values.b = 'a';
    observer.observe(node, { characterData: true });

    return function requestFlush() {
      node.data = val = values[val];
    };
  }
};
