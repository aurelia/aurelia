import { IPerformanceEntry, ITimerHandler, IWindowOrWorkerGlobalScope } from './interfaces';

declare var global: IWindowOrWorkerGlobalScope;
declare var self: IWindowOrWorkerGlobalScope;
declare var window: IWindowOrWorkerGlobalScope;
declare function setTimeout(handler: (...args: unknown[]) => void, timeout: number): unknown;

const $global: IWindowOrWorkerGlobalScope = (function(): IWindowOrWorkerGlobalScope {
  // https://github.com/Microsoft/tslint-microsoft-contrib/issues/415
  // tslint:disable:no-typeof-undefined
  if (typeof global !== 'undefined') {
    return global as unknown as IWindowOrWorkerGlobalScope;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  // tslint:enable:no-typeof-undefined
  try {
    // Not all environments allow eval and Function. Use only as a last resort:
    // tslint:disable-next-line:no-function-constructor-with-string-args function-constructor
    return new Function('return this')();
  } catch {
    // If all fails, give up and create an object.
    // tslint:disable-next-line:no-object-literal-type-assertion
    return {} as IWindowOrWorkerGlobalScope;
  }
})();

// performance.now polyfill for non-browser envs based on https://github.com/myrne/performance-now
const $now = (function(): () => number {
  let getNanoSeconds: () => number;
  let hrtime: (time?: [number, number]) => [number, number];
  let moduleLoadTime: number;
  let nodeLoadTime: number;
  let upTime: number;

  if (($global.performance !== undefined && $global.performance !== null) && $global.performance.now) {
    const $performance = $global.performance;
    return function(): number {
      return $performance.now();
    };
  } else if (($global.process !== undefined && $global.process !== null) && $global.process.hrtime) {
    const now = function(): number {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = $global.process.hrtime;
    getNanoSeconds = function(): number {
      let hr: [number, number];
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = $global.process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
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
} = (function(): {
  $mark: IWindowOrWorkerGlobalScope['performance']['mark'];
  $measure: IWindowOrWorkerGlobalScope['performance']['measure'];
  $getEntriesByName: IWindowOrWorkerGlobalScope['performance']['getEntriesByName'];
  $getEntriesByType: IWindowOrWorkerGlobalScope['performance']['getEntriesByType'];
  $clearMarks: IWindowOrWorkerGlobalScope['performance']['clearMarks'];
  $clearMeasures: IWindowOrWorkerGlobalScope['performance']['clearMeasures'];
 } {
  if (
    $global.performance !== undefined &&
    $global.performance !== null &&
    $global.performance.mark &&
    $global.performance.measure &&
    $global.performance.getEntriesByName &&
    $global.performance.getEntriesByType &&
    $global.performance.clearMarks &&
    $global.performance.clearMeasures
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
  } else if ($global.process !== undefined && $global.process !== null && $global.process.hrtime) {
    const entries: IPerformanceEntry[] = [];
    const marksIndex: Record<string, IPerformanceEntry> = {};

    const filterEntries = function (key: string, value: string): IPerformanceEntry[] {
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

    const clearEntries = function (type: string, name: string): void {
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

        if (endMark !== undefined && marksIndex[endMark] === undefined) {
          throw new SyntaxError(`Failed to execute 'measure' on 'Performance': The mark '${endMark}' does not exist.`);
        }
        if (startMark !== undefined && marksIndex[startMark] === undefined) {
          throw new SyntaxError(`Failed to execute 'measure' on 'Performance': The mark '${startMark}' does not exist.`);
        }

        if (marksIndex[startMark]) {
          startTime = marksIndex[startMark].startTime;
        } else {
          startTime = 0;
        }
        if (marksIndex[endMark]) {
          endTime = marksIndex[endMark].startTime;
        } else {
          endTime = $now();
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
  }
})();

// RAF polyfill for non-browser envs from https://github.com/chrisdickinson/raf/blob/master/index.js
const $raf = (function(): (callback: (time: number) => void) => number {
  const vendors = ['moz', 'webkit'];
  const suffix = 'AnimationFrame';
  let raf: (callback: (time: number) => void) => number = $global[`request${suffix}`];
  let caf: (handle: number) => void = $global[`cancel${suffix}`] || $global[`cancelRequest${suffix}`];

  for (let i = 0; !raf && i < vendors.length; ++i) {
    raf = $global[`${vendors[i]}Request${suffix}`];
    caf = $global[`${vendors[i]}Cancel${suffix}`] || $global[`${vendors[i]}CancelRequest${suffix}`];
  }

  // Some versions of FF have rAF but not cAF
  if (!raf || !caf) {
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
          function(): void {
            const cp = queue.slice(0);
            // Clear queue here to prevent callbacks from appending listeners to the current frame's queue
            queue.length = 0;
            for (let i = 0; i < cp.length; ++i) {
              if (!cp[i].cancelled) {
                try {
                  cp[i].callback(last);
                } catch (e) {
                  setTimeout(function(): void { throw e; }, 0);
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
  $$raf.cancel = function(): void {
    caf.apply($global, arguments);
  };
  $global.requestAnimationFrame = raf;
  $global.cancelAnimationFrame = caf;
  return $$raf;
})();

const camelCaseLookup: Record<string, string> = {};
const kebabCaseLookup: Record<string, string> = {};

export const PLATFORM = {
  global: $global,
  emptyArray: Object.freeze([]),
  emptyObject: Object.freeze({}),
  noop(): void { return; },
  now: $now,
  mark: $mark,
  measure: $measure,
  getEntriesByName: $getEntriesByName,
  getEntriesByType: $getEntriesByType,
  clearMarks: $clearMarks,
  clearMeasures: $clearMeasures,

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
    return $raf(callback);
  },

  clearInterval(handle?: number): void {
    $global.clearInterval(handle);
  },

  clearTimeout(handle?: number): void {
    $global.clearTimeout(handle);
  },

  // tslint:disable-next-line:no-any
  setInterval(handler: ITimerHandler, timeout?: number, ...args: any[]): number {
    return $global.setInterval(handler, timeout, ...args);
  },

  // tslint:disable-next-line:no-any
  setTimeout(handler: ITimerHandler, timeout?: number, ...args: any[]): number {
    return $global.setTimeout(handler, timeout, ...args);
  }
};
