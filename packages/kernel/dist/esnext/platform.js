function $noop() { return; }
const $global = (function () {
    if (typeof global !== 'undefined') {
        return global;
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
    }
    catch (_a) {
        // If all fails, give up and create an object.
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return {};
    }
})();
const isBrowserLike = (typeof window !== 'undefined'
    && typeof window.document !== 'undefined');
const isWebWorkerLike = (typeof self === 'object'
    && self.constructor != null
    && self.constructor.name === 'DedicatedWorkerGlobalScope');
const isNodeLike = (typeof process !== 'undefined'
    && process.versions != null
    && process.versions.node != null);
// performance.now polyfill for non-browser envs based on https://github.com/myrne/performance-now
const $now = (function () {
    let getNanoSeconds;
    let hrtime;
    let moduleLoadTime;
    let nodeLoadTime;
    let upTime;
    if ($global.performance != null && $global.performance.now != null) {
        const $performance = $global.performance;
        return function () {
            return $performance.now();
        };
    }
    else if ($global.process != null && $global.process.hrtime != null) {
        const now = function () {
            return (getNanoSeconds() - nodeLoadTime) / 1e6;
        };
        hrtime = $global.process.hrtime;
        getNanoSeconds = function () {
            let hr;
            hr = hrtime();
            return hr[0] * 1e9 + hr[1];
        };
        moduleLoadTime = getNanoSeconds();
        upTime = $global.process.uptime() * 1e9;
        nodeLoadTime = moduleLoadTime - upTime;
        return now;
    }
    else {
        const now = function () {
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
const { $mark, $measure, $getEntriesByName, $getEntriesByType, $clearMarks, $clearMeasures } = (function () {
    if ($global.performance != null &&
        $global.performance.mark != null &&
        $global.performance.measure != null &&
        $global.performance.getEntriesByName != null &&
        $global.performance.getEntriesByType != null &&
        $global.performance.clearMarks != null &&
        $global.performance.clearMeasures != null) {
        const $performance = $global.performance;
        return {
            $mark: function (name) {
                $performance.mark(name);
            },
            $measure: function (name, start, end) {
                $performance.measure(name, start, end);
            },
            $getEntriesByName: function (name) {
                return $performance.getEntriesByName(name);
            },
            $getEntriesByType: function (type) {
                return $performance.getEntriesByType(type);
            },
            $clearMarks: function (name) {
                $performance.clearMarks(name);
            },
            $clearMeasures: function (name) {
                $performance.clearMeasures(name);
            }
        };
    }
    else if ($global.process != null && $global.process.hrtime != null) {
        const entries = [];
        const marksIndex = {};
        const filterEntries = function (key, value) {
            let i = 0;
            const n = entries.length;
            const result = [];
            for (; i < n; i++) {
                if (entries[i][key] === value) {
                    result.push(entries[i]);
                }
            }
            return result;
        };
        const clearEntries = function (type, name) {
            let i = entries.length;
            let entry;
            while (i--) {
                entry = entries[i];
                if (entry.entryType === type && (name === void 0 || entry.name === name)) {
                    entries.splice(i, 1);
                }
            }
        };
        return {
            $mark: function (name) {
                const mark = {
                    name,
                    entryType: 'mark',
                    startTime: $now(),
                    duration: 0
                };
                entries.push(mark);
                marksIndex[name] = mark;
            },
            $measure: function (name, startMark, endMark) {
                let startTime;
                let endTime;
                if (endMark != null) {
                    if (marksIndex[endMark] == null) {
                        throw new SyntaxError(`Failed to execute 'measure' on 'Performance': The mark '${endMark}' does not exist.`);
                    }
                    if (marksIndex[endMark] !== void 0) {
                        endTime = marksIndex[endMark].startTime;
                    }
                    else {
                        endTime = $now();
                    }
                }
                else {
                    endTime = $now();
                }
                if (startMark != null) {
                    if (marksIndex[startMark] == null) {
                        throw new SyntaxError(`Failed to execute 'measure' on 'Performance': The mark '${startMark}' does not exist.`);
                    }
                    if (marksIndex[startMark] !== void 0) {
                        startTime = marksIndex[startMark].startTime;
                    }
                    else {
                        startTime = 0;
                    }
                }
                else {
                    startTime = 0;
                }
                entries.push({
                    name,
                    entryType: 'measure',
                    startTime,
                    duration: endTime - startTime
                });
            },
            $getEntriesByName: function (name) {
                return filterEntries('name', name);
            },
            $getEntriesByType: function (type) {
                return filterEntries('entryType', type);
            },
            $clearMarks: function (name) {
                clearEntries('mark', name);
            },
            $clearMeasures: function (name) {
                clearEntries('measure', name);
            }
        };
    }
    else {
        return {}; // if the runtime doesn't supply these methods, just let them be undefined because the framework doesn't need them
    }
})();
// RAF polyfill for non-browser envs from https://github.com/chrisdickinson/raf/blob/master/index.js
const { $raf, $caf } = (function () {
    let raf = $global.requestAnimationFrame;
    let caf = $global.cancelAnimationFrame;
    if (raf === void 0 || caf === void 0) {
        let last = 0;
        let id = 0;
        const queue = [];
        const frameDuration = 1000 / 60;
        raf = function (callback) {
            let _now;
            let next;
            if (queue.length === 0) {
                _now = $now();
                next = Math.max(0, frameDuration - (_now - last));
                last = next + _now;
                setTimeout(function () {
                    const cp = queue.slice(0);
                    // Clear queue here to prevent callbacks from appending listeners to the current frame's queue
                    queue.length = 0;
                    for (let i = 0; i < cp.length; ++i) {
                        if (!cp[i].cancelled) {
                            try {
                                cp[i].callback(last);
                            }
                            catch (e) {
                                setTimeout(function () { throw e; }, 0);
                            }
                        }
                    }
                }, Math.round(next));
            }
            queue.push({
                handle: ++id,
                callback: callback,
                cancelled: false
            });
            return id;
        };
        caf = function (handle) {
            for (let i = 0; i < queue.length; ++i) {
                if (queue[i].handle === handle) {
                    queue[i].cancelled = true;
                }
            }
        };
    }
    const $$raf = function (callback) {
        return raf.call($global, callback);
    };
    $$raf.cancel = function (time) {
        caf.call($global, time);
    };
    $global.requestAnimationFrame = raf;
    $global.cancelAnimationFrame = caf;
    return { $raf: $$raf, $caf: caf };
})();
const hasOwnProperty = Object.prototype.hasOwnProperty;
const emptyArray = Object.freeze([]);
const emptyObject = Object.freeze({});
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
    requestAnimationFrame(callback) {
        return $raf(callback);
    },
    cancelAnimationFrame(handle) {
        return $caf(handle);
    },
    clearInterval(handle) {
        $global.clearInterval(handle);
    },
    clearTimeout(handle) {
        $global.clearTimeout(handle);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setInterval(handler, timeout, ...args) {
        return $global.setInterval(handler, timeout, ...args);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setTimeout(handler, timeout, ...args) {
        return $global.setTimeout(handler, timeout, ...args);
    },
    restore() {
        Object.assign(PLATFORM, $PLATFORM);
    },
});
export const PLATFORM = { ...$PLATFORM };
//# sourceMappingURL=platform.js.map