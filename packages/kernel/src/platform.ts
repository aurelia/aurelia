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
    // benchmark: http://jsben.ch/lCFIe
    let value = camelCaseLookup[input];
    if (value !== undefined) {
      return value;
    }
    let char = input.charCodeAt(0); // make first char toLower
    if (char > 64 && char < 91) { // 65-90 = A-Z
      value = fromCharCode(char + 32); // 32 is the offset between lower case and upper case char codes
    } else {
      value = fromCharCode(char);
    }
    for (let i = 1, ii = input.length; i < ii; ++i) {
      char = input.charCodeAt(i);
      if (char === 45 /*-*/ || char === 46 /*.*/ || char === 95 /*_*/) {
        const next = input.charCodeAt(++i);
        if (next > 96 && next < 123) { // 97-122 = a-z
          value += fromCharCode(next - 32); // make char following a separator toUpper
          continue;
        }
      }
      value += fromCharCode(char);
    }
    return camelCaseLookup[input] = value;
  },

  kebabCase(input: string): string {
    // benchmark: http://jsben.ch/K6D8o
    let value = kebabCaseLookup[input];
    if (value !== undefined) {
      return value;
    }
    let char = input.charCodeAt(0); // make first char toLower
    if (char > 64 && char < 91) { // 65-90 = A-Z
      value = fromCharCode(char + 32); // 32 is the offset between lower case and upper case char codes
    } else {
      value = fromCharCode(char);
    }
    for (let i = 1, ii = input.length; i < ii; ++i) {
      char = input.charCodeAt(i);
      if (char > 64 && char < 91) {
        value += `-${fromCharCode(char + 32)}`;
        continue;
      }
      value += fromCharCode(char);
    }
    return kebabCaseLookup[input] = value;
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
