import { IPerformance, IPerformanceEntry, ITimerHandler, IWindowOrWorkerGlobalScope } from './interfaces';

function $noop(): void { return; }

declare let process: { versions: { node: unknown } };
declare let global: IWindowOrWorkerGlobalScope;
declare let self: IWindowOrWorkerGlobalScope;
declare let window: IWindowOrWorkerGlobalScope;
declare function setTimeout(handler: (...args: unknown[]) => void, timeout: number): unknown;

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

  if ($global.performance != null && $global.performance.now != null) {
    const $performance = $global.performance;
    return function (): number {
      return $performance.now();
    };
  } else if ($global.process != null && $global.process.hrtime != null) {
    const now = function (): number {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = $global.process.hrtime;
    getNanoSeconds = function (): number {
      let hr: [number, number];
      hr = hrtime();
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

// performance.mark / measure polyfill based on https://github.com/blackswanny/performance-polyfill
// note: this is NOT intended to be a polyfill for browsers that don't support it; it's just for NodeJS
// TODO: probably want to move environment-specific logic to the appropriate runtime (e.g. the NodeJS polyfill
// to runtime-html-jsdom)
const {
  $mark,
  $measure,
  $getEntriesByName,
  $getEntriesByType,
  $clearMarks,
  $clearMeasures
} = (function (): {
  $mark: IWindowOrWorkerGlobalScope['performance']['mark'];
  $measure: IWindowOrWorkerGlobalScope['performance']['measure'];
  $getEntriesByName: IWindowOrWorkerGlobalScope['performance']['getEntriesByName'];
  $getEntriesByType: IWindowOrWorkerGlobalScope['performance']['getEntriesByType'];
  $clearMarks: IWindowOrWorkerGlobalScope['performance']['clearMarks'];
  $clearMeasures: IWindowOrWorkerGlobalScope['performance']['clearMeasures'];
 } {
  if (
    $global.performance != null &&
    $global.performance.mark != null &&
    $global.performance.measure != null &&
    $global.performance.getEntriesByName != null &&
    $global.performance.getEntriesByType != null &&
    $global.performance.clearMarks != null &&
    $global.performance.clearMeasures != null
  ) {
    const $performance = $global.performance;
    return {
      $mark: function(name: string): void {
        $performance.mark(name);
      },
      $measure: function(name: string, start?: string, end?: string): void {
        $performance.measure(name, start, end);
      },
      $getEntriesByName: function(name: string): IPerformanceEntry[] {
        return $performance.getEntriesByName(name);
      },
      $getEntriesByType: function(type: string): IPerformanceEntry[] {
        return $performance.getEntriesByType(type);
      },
      $clearMarks: function(name?: string): void {
        $performance.clearMarks(name);
      },
      $clearMeasures: function(name?: string): void {
        $performance.clearMeasures(name);
      }
    };
  } else if ($global.process != null && $global.process.hrtime != null) {
    const entries: IPerformanceEntry[] = [];
    const marksIndex: Record<string, IPerformanceEntry> = {};

    const filterEntries = function (key: keyof IPerformanceEntry, value: string): IPerformanceEntry[] {
      let i = 0;
      const n = entries.length;
      const result = [];
      for (; i < n; i++) {
        if (entries[i][key] === value) {
          result.push(entries[i]);
        }
      }
      return	result;
    };

    const clearEntries = function (type: string, name?: string): void {
      let i = entries.length;
      let entry: IPerformanceEntry;
      while (i--) {
        entry = entries[i];
        if (entry.entryType === type && (name === void 0 || entry.name === name)) {
          entries.splice(i, 1);
        }
      }
    };

    return {
      $mark: function(name: string): void {
        const mark: IPerformanceEntry = {
          name,
          entryType: 'mark',
          startTime: $now(),
          duration: 0
        };
        entries.push(mark);
        marksIndex[name] = mark;
      },
      $measure: function(name: string, startMark?: string, endMark?: string): void {
        let startTime: number;
        let endTime: number;

        if (endMark != null) {
          if (marksIndex[endMark] == null) {
            throw new SyntaxError(`Failed to execute 'measure' on 'Performance': The mark '${endMark}' does not exist.`);
          }
          if (marksIndex[endMark] !== void 0) {
            endTime = marksIndex[endMark].startTime;
          } else {
            endTime = $now();
          }
        } else {
          endTime = $now();
        }
        if (startMark != null) {
          if (marksIndex[startMark] == null) {
            throw new SyntaxError(`Failed to execute 'measure' on 'Performance': The mark '${startMark}' does not exist.`);
          }
          if (marksIndex[startMark] !== void 0) {
            startTime = marksIndex[startMark].startTime;
          } else {
            startTime = 0;
          }
        } else {
          startTime = 0;
        }

        entries.push({
          name,
          entryType: 'measure',
          startTime,
          duration: endTime - startTime
        });
      },
      $getEntriesByName: function(name: string): IPerformanceEntry[] {
        return filterEntries('name', name);
      },
      $getEntriesByType: function(type: string): IPerformanceEntry[] {
        return filterEntries('entryType', type);
      },
      $clearMarks: function(name?: string): void {
        clearEntries('mark', name);
      },
      $clearMeasures: function(name?: string): void {
        clearEntries('measure', name);
      }
    };
  } else {
    return {} as any; // if the runtime doesn't supply these methods, just let them be undefined because the framework doesn't need them
  }
})();

// RAF polyfill for non-browser envs from https://github.com/chrisdickinson/raf/blob/master/index.js
const { $raf, $caf } = (function (): { $raf(callback: (time: number) => void): number; $caf(handle: number): void } {
  let raf: (callback: (time: number) => void) => number = $global.requestAnimationFrame;
  let caf: (handle: number) => void = $global.cancelAnimationFrame;

  if (raf === void 0 || caf === void 0) {
    let last = 0;
    let id = 0;
    const queue: { handle: number; cancelled: boolean; callback(time: number): void }[] = [];
    const frameDuration = 1000 / 60;

    raf = function(callback: (time: number) => void): number {
      let _now: number;
      let next: number;
      if (queue.length === 0) {
        _now = $now();
        next = Math.max(0, frameDuration - (_now - last));
        last = next + _now;
        setTimeout(
          function (): void {
            const cp = queue.slice(0);
            // Clear queue here to prevent callbacks from appending listeners to the current frame's queue
            queue.length = 0;
            for (let i = 0; i < cp.length; ++i) {
              if (!cp[i].cancelled) {
                try {
                  cp[i].callback(last);
                } catch (e) {
                  setTimeout(function (): void { throw e; }, 0);
                }
              }
            }
          },
          Math.round(next)
        );
      }
      queue.push({
        handle: ++id,
        callback: callback,
        cancelled: false
      });
      return id;
    };

    caf = function(handle: number): void {
      for (let i = 0; i < queue.length; ++i) {
        if (queue[i].handle === handle) {
          queue[i].cancelled = true;
        }
      }
    };
  }

  const $$raf = function(callback: (time: number) => void): number {
    return raf.call($global, callback);
  };
  $$raf.cancel = function (time: number): void {
    caf.call($global, time);
  };
  $global.requestAnimationFrame = raf;
  $global.cancelAnimationFrame = caf;
  return { $raf: $$raf, $caf: caf };
})();

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

const $PLATFORM = Object.freeze({
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
  mark: $mark,
  measure: $measure,
  getEntriesByName: $getEntriesByName,
  getEntriesByType: $getEntriesByType,
  clearMarks: $clearMarks,
  clearMeasures: $clearMeasures,
  hasOwnProperty,

  requestAnimationFrame(callback: (time: number) => void): number {
    return $raf(callback);
  },

  cancelAnimationFrame(handle: number): void {
    return $caf(handle);
  },

  clearInterval(handle?: number): void {
    $global.clearInterval(handle);
  },

  clearTimeout(handle?: number): void {
    $global.clearTimeout(handle);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setInterval(handler: ITimerHandler, timeout?: number, ...args: any[]): number {
    return $global.setInterval(handler, timeout, ...args);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTimeout(handler: ITimerHandler, timeout?: number, ...args: any[]): number {
    return $global.setTimeout(handler, timeout, ...args);
  },

  restore(): void {
    Object.assign(PLATFORM, $PLATFORM);
  },
});

interface IPlatform extends IPerformance {
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

  hasOwnProperty: {
    call<V, T = object, K extends PropertyKey = PropertyKey>(target: T, key: K): target is (
      T & { [P in K]: V; }
    );
    call<T, K extends keyof T>(target: T, key: K): target is (
      T & { [P in K]-?: T[P]; }
    );
  };

  noop(): void;

  requestAnimationFrame(callback: (time: number) => void): number;
  cancelAnimationFrame(handle: number): void;
  clearInterval(handle?: number): void;
  clearTimeout(handle?: number): void;
  setInterval(handler: ITimerHandler, timeout?: number, ...args: any[]): number;
  setTimeout(handler: ITimerHandler, timeout?: number, ...args: any[]): number;

  /**
   * Restore the global `PLATFORM` object to its original state as it was immediately after module initialization.
   * Useful for when you need to stub out one or more of its methods in a unit test.
   *
   * Extraneous properties are NOT removed.
   */
  restore(): void;
}

export const PLATFORM: IPlatform = { ...$PLATFORM };
