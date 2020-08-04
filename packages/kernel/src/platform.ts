import { IPerformance, IWindowOrWorkerGlobalScope, IPerformanceEntry } from './interfaces';

function $noop(): void { return; }

declare let process: { versions: { node: unknown } };
declare let global: IWindowOrWorkerGlobalScope;
declare let self: IWindowOrWorkerGlobalScope;
declare let window: IWindowOrWorkerGlobalScope;

const $global: IWindowOrWorkerGlobalScope = (function (): IWindowOrWorkerGlobalScope {
  if (typeof global !== 'undefined') {
    return global as unknown as IWindowOrWorkerGlobalScope;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  try {
    // Not all environments allow eval and Function. Use only as a last resort:
    // eslint-disable-next-line no-new-func
    return new Function('return this')();
  } catch {
    // If all fails, give up and create an object.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as IWindowOrWorkerGlobalScope;
  }
})();

const isBrowserLike = (
  typeof window !== 'undefined'
  && typeof (window as unknown as { document: unknown }).document !== 'undefined'
);

const isWebWorkerLike = (
  typeof self === 'object'
  && self.constructor != null
  && self.constructor.name === 'DedicatedWorkerGlobalScope'
);

const isNodeLike = (
  typeof process !== 'undefined'
  && process.versions != null
  && process.versions.node != null
);

// performance.now polyfill for non-browser envs based on https://github.com/myrne/performance-now
const $now = (function (): () => number {
  let getNanoSeconds: () => number;
  let hrtime: (time?: [number, number]) => [number, number];
  let moduleLoadTime: number;
  let nodeLoadTime: number;
  let upTime: number;

  if ($global.performance?.now != null) {
    const $performance = $global.performance;
    return function (): number {
      return $performance.now();
    };
  } else if ($global.process?.hrtime != null) {
    const now = function (): number {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = $global.process.hrtime;
    getNanoSeconds = function (): number {
      const hr: [number, number] = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = $global.process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
    return now;
  } else {
    const now = function (): number {
      return Date.now() - nodeLoadTime;
    };
    nodeLoadTime = Date.now();
    return now;
  }
})();

/* eslint-disable */
function ensurePerformance(window: any) {
  const _entries: IPerformanceEntry[] = [];
  const _marksIndex = {} as any;

  function _filterEntries(key: string, value: any) {
    var i = 0, n = _entries.length, result = [];
    for (; i < n; i++) {
      if ((_entries[i] as any)[key] == value) {
        result.push(_entries[i]);
      }
    }
    return result;
  }

  function _clearEntries(type: string, name: string) {
    var i = _entries.length, entry;
    while (i--) {
      entry = _entries[i];
      if (entry.entryType == type && (name === void 0 || entry.name == name)) {
        _entries.splice(i, 1);
      }
    }
  };

  if (window.performance === undefined) {
    window.performance = {};
  }

  if (window.performance.now === undefined) {
    let nowOffset = Date.now();

    window.performance.now = function now() {
      return Date.now() - nowOffset;
    };
  }

  if (!window.performance.mark) {
    window.performance.mark = window.performance.webkitMark || function (name: string) {
      const mark = {
        name,
        entryType: "mark",
        startTime: window.performance.now(),
        duration: 0
      };

      _entries.push(mark);
      _marksIndex[name] = mark;
    };
  }


  if (!window.performance.measure) {
    window.performance.measure = window.performance.webkitMeasure || function (name: string, startMark: string, endMark: string) {
      startMark = _marksIndex[startMark].startTime;
      endMark = _marksIndex[endMark].startTime;

      _entries.push({
        name,
        entryType: "measure",
        startTime: startMark as unknown as number,
        duration: (endMark as unknown as number)- (startMark as unknown as number)
      });
    };
  }


  if (!window.performance.getEntriesByType) {
    window.performance.getEntriesByType = window.performance.webkitGetEntriesByType || function (type: string) {
      return _filterEntries("entryType", type);
    };
  }


  if (!window.performance.getEntriesByName) {
    window.performance.getEntriesByName = window.performance.webkitGetEntriesByName || function (name: string) {
      return _filterEntries("name", name);
    };
  }


  if (!window.performance.clearMarks) {
    window.performance.clearMarks = window.performance.webkitClearMarks || function (name: string) {
      _clearEntries("mark", name);
    };
  }


  if (!window.performance.clearMeasures) {
    window.performance.clearMeasures = window.performance.webkitClearMeasures || function (name: string) {
      _clearEntries("measure", name);
    };
  }
}
/* eslint-enable */

const hasOwnProperty = Object.prototype.hasOwnProperty as unknown as {
  call<V, T = object, K extends PropertyKey = PropertyKey>(target: T, key: K): target is (
    T & { [P in K]: V; }
  );
  call<T, K extends keyof T>(target: T, key: K): target is (
    T & { [P in K]-?: T[P]; }
  );
};

const emptyArray = Object.freeze([]) as unknown as any[];
const emptyObject = Object.freeze({}) as any;

const $PLATFORM = {
  /**
   * `true` if there is a `window` variable in the global scope with a `document` property.
   *
   * NOTE: this does not guarantee that the code is actually running in a browser, as some libraries tamper with globals.
   * The only conclusion that can be drawn is that the `window` global is available and likely behaves similar to how it would in a browser.
   */
  isBrowserLike,

  /**
   * `true` if there is a `self` variable (of type `object`) in the global scope with constructor name `'DedicatedWorkerGlobalScope'`.
   *
   * NOTE: this does not guarantee that the code is actually running in a web worker, as some libraries tamper with globals.
   * The only conclusion that can be drawn is that the `self` global is available and likely behaves similar to how it would in a web worker.
   */
  isWebWorkerLike,

  /**
   * `true` if there is a `process` variable in the global scope with a `versions` property which has a `node` property.
   *
   * NOTE: this is not a guarantee that the code is actually running in nodejs, as some libraries tamper with globals.
   * The only conclusion that can be drawn is that the `process` global is available and likely behaves similar to how it would in nodejs.
   */
  isNodeLike,

  global: $global,
  emptyArray,
  emptyObject,
  noop: $noop,
  now: $now,
  hasOwnProperty,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  performance: $global.performance,

  restore(): void {
    Object.assign(PLATFORM, $PLATFORM);
  },
};

ensurePerformance($PLATFORM);

interface IPlatform {
  /**
   * `true` if there is a `window` variable in the global scope with a `document` property.
   *
   * NOTE: this does not guarantee that the code is actually running in a browser, as some libraries tamper with globals.
   * The only conclusion that can be drawn is that the `window` global is available and likely behaves similar to how it would in a browser.
   */
  isBrowserLike: boolean;

  /**
   * `true` if there is a `self` variable (of type `object`) in the global scope with constructor name `'DedicatedWorkerGlobalScope'`.
   *
   * NOTE: this does not guarantee that the code is actually running in a web worker, as some libraries tamper with globals.
   * The only conclusion that can be drawn is that the `self` global is available and likely behaves similar to how it would in a web worker.
   */
  isWebWorkerLike: boolean;

  /**
   * `true` if there is a `process` variable in the global scope with a `versions` property which has a `node` property.
   *
   * NOTE: this is not a guarantee that the code is actually running in nodejs, as some libraries tamper with globals.
   * The only conclusion that can be drawn is that the `process` global is available and likely behaves similar to how it would in nodejs.
   */
  isNodeLike: boolean;

  global: IWindowOrWorkerGlobalScope;
  emptyArray: any[];
  emptyObject: any;
  now(): number;

  hasOwnProperty: {
    call<V, T = object, K extends PropertyKey = PropertyKey>(target: T, key: K): target is (
      T & { [P in K]: V; }
    );
    call<T, K extends keyof T>(target: T, key: K): target is (
      T & { [P in K]-?: T[P]; }
    );
  };

  performance: IPerformance;

  noop(): void;

  /**
   * Restore the global `PLATFORM` object to its original state as it was immediately after module initialization.
   * Useful for when you need to stub out one or more of its methods in a unit test.
   *
   * Extraneous properties are NOT removed.
   */
  restore(): void;
}

export const PLATFORM: IPlatform = { ...$PLATFORM };
