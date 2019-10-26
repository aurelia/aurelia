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
    class Debouncer {
        constructor(binding, delay) {
            this.binding = binding;
            const taskQueue = binding.locator.get(scheduler_1.IScheduler).getPostRenderTaskQueue();
            const taskQueueOpts = { delay };
            // TODO: expose binding API that tells the outside what method name is the primary change handler
            // Or expose some kind of `decorate` or `applyBehavior` api. This monkey patching is bad and needs to go.
            const methodName = this.methodName = 'callSource' in binding ? 'callSource' : 'handleChange';
            let task = null;
            const originalHandler = this.originalHandler = binding[methodName];
            this.wrappedHandler = (...args) => {
                if (task !== null) {
                    task.cancel();
                }
                task = taskQueue.queueTask(() => originalHandler.call(binding, ...args), taskQueueOpts);
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
    let DebounceBindingBehavior = class DebounceBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let debouncer = lookup.get(binding);
            if (debouncer === void 0) {
                debouncer = new Debouncer(binding, delay);
                lookup.set(binding, debouncer);
            }
            debouncer.start();
        }
        unbind(flags, scope, binding) {
            // The binding exists so it can't have been garbage-collected and a binding can only unbind if it was bound first,
            // so we know for sure the debouncer exists in the lookup.
            const debouncer = lookup.get(binding);
            debouncer.stop();
        }
    };
    DebounceBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('debounce')
    ], DebounceBindingBehavior);
    exports.DebounceBindingBehavior = DebounceBindingBehavior;
});
//# sourceMappingURL=debounce.js.map