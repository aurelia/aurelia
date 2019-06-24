(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./platform"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const platform_1 = require("./platform");
    exports.Profiler = (function () {
        const now = platform_1.PLATFORM.now;
        const timers = [];
        let profileMap;
        const profiler = {
            createTimer,
            enable,
            disable,
            report,
            enabled: false
        };
        return profiler;
        function createTimer(name) {
            timers.push(name);
            let depth = 0;
            let mark = 0;
            return {
                enter,
                leave
            };
            function enter() {
                if (++depth === 1) {
                    mark = now();
                    ++profileMap[name].topLevelCount;
                }
                ++profileMap[name].totalCount;
            }
            function leave() {
                if (--depth === 0) {
                    profileMap[name].duration += (now() - mark);
                }
            }
        }
        function enable() {
            profileMap = {};
            for (const timer of timers) {
                profileMap[timer] = {
                    name: timer,
                    duration: 0,
                    topLevelCount: 0,
                    totalCount: 0
                };
            }
            profiler.enabled = true;
        }
        function disable() {
            profiler.enabled = false;
        }
        function report(cb) {
            Object.keys(profileMap).map(key => profileMap[key]).sort((a, b) => b.duration - a.duration).forEach(p => {
                cb(p.name, p.duration, p.topLevelCount, p.totalCount);
            });
        }
    })();
});
//# sourceMappingURL=profiler.js.map