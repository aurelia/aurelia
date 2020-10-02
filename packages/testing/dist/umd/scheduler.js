(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/scheduler", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ensureSchedulerEmpty = void 0;
    const scheduler_1 = require("@aurelia/scheduler");
    const kernel_1 = require("@aurelia/kernel");
    function ensureSchedulerEmpty(scheduler) {
        var _a, _b, _c, _d, _e;
        if (!scheduler) {
            scheduler = scheduler_1.Scheduler.get(kernel_1.PLATFORM.global);
        }
        const $scheduler = scheduler;
        // canceling pending heading to remove the sticky tasks
        const microQueue = $scheduler['microtask'];
        microQueue.flush();
        (_a = microQueue['pendingHead']) === null || _a === void 0 ? void 0 : _a.cancel();
        const renderQueue = $scheduler['render'];
        renderQueue.flush();
        (_b = renderQueue['pendingHead']) === null || _b === void 0 ? void 0 : _b.cancel();
        const macroQueue = $scheduler['macroTask'];
        macroQueue.flush();
        (_c = macroQueue['pendingHead']) === null || _c === void 0 ? void 0 : _c.cancel();
        const postRenderQueue = $scheduler['postRender'];
        postRenderQueue.flush();
        (_d = postRenderQueue['pendingHead']) === null || _d === void 0 ? void 0 : _d.cancel();
        const idleQueue = $scheduler['idle'];
        idleQueue.flush();
        (_e = idleQueue['pendingHead']) === null || _e === void 0 ? void 0 : _e.cancel();
    }
    exports.ensureSchedulerEmpty = ensureSchedulerEmpty;
});
//# sourceMappingURL=scheduler.js.map