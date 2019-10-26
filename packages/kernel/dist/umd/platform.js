(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                const hr = hrtime();
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
        hasOwnProperty,
        restore() {
            Object.assign(exports.PLATFORM, $PLATFORM);
        },
    });
    exports.PLATFORM = { ...$PLATFORM };
});
//# sourceMappingURL=platform.js.map