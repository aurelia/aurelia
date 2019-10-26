(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../binding-behavior", "../../scheduler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const binding_behavior_1 = require("../binding-behavior");
    const scheduler_1 = require("../../scheduler");
    class Throttler {
        constructor(binding, delay) {
            this.binding = binding;
            const clock = binding.locator.get(scheduler_1.IClock);
            const taskQueue = binding.locator.get(scheduler_1.IScheduler).getPostRenderTaskQueue();
            const taskQueueOpts = { delay };
            const methodName = this.methodName = 'callSource' in binding ? 'callSource' : 'handleChange';
            let task = null;
            let lastCall = 0;
            let nextDelay = 0;
            const originalHandler = this.originalHandler = binding[methodName];
            this.wrappedHandler = (...args) => {
                nextDelay = lastCall + delay - clock.now();
                if (nextDelay > 0) {
                    if (task !== null) {
                        task.cancel();
                    }
                    taskQueueOpts.delay = nextDelay;
                    task = taskQueue.queueTask(() => {
                        lastCall = clock.now();
                        originalHandler.call(binding, ...args);
                    }, taskQueueOpts);
                }
                else {
                    lastCall = clock.now();
                    originalHandler.call(binding, ...args);
                }
            };
        }
        start() {
            this.binding[this.methodName] = this.wrappedHandler;
        }
        stop() {
            this.binding[this.methodName] = this.originalHandler;
        }
    }
    const lookup = new WeakMap();
    let ThrottleBindingBehavior = class ThrottleBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let throttler = lookup.get(binding);
            if (throttler === void 0) {
                throttler = new Throttler(binding, delay);
                lookup.set(binding, throttler);
            }
            throttler.start();
        }
        unbind(flags, scope, binding) {
            // The binding exists so it can't have been garbage-collected and a binding can only unbind if it was bound first,
            // so we know for sure the throttler exists in the lookup.
            const throttler = lookup.get(binding);
            throttler.stop();
        }
    };
    ThrottleBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('throttle')
    ], ThrottleBindingBehavior);
    exports.ThrottleBindingBehavior = ThrottleBindingBehavior;
});
//# sourceMappingURL=throttle.js.map