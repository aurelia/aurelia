(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "@aurelia/runtime", "../../observation/event-manager"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const event_manager_1 = require("../../observation/event-manager");
    let UpdateTriggerBindingBehavior = class UpdateTriggerBindingBehavior {
        constructor(observerLocator) {
            this.observerLocator = observerLocator;
        }
        bind(flags, scope, binding, ...events) {
            if (events.length === 0) {
                throw kernel_1.Reporter.error(9);
            }
            if (binding.mode !== runtime_1.BindingMode.twoWay && binding.mode !== runtime_1.BindingMode.fromView) {
                throw kernel_1.Reporter.error(10);
            }
            this.persistentFlags = flags & 2080374799 /* persistentBindingFlags */;
            // ensure the binding's target observer has been set.
            const targetObserver = this.observerLocator.getObserver(this.persistentFlags | flags, binding.target, binding.targetProperty);
            if (!targetObserver.handler) {
                throw kernel_1.Reporter.error(10);
            }
            binding.targetObserver = targetObserver;
            // stash the original element subscribe function.
            targetObserver.originalHandler = binding.targetObserver.handler;
            // replace the element subscribe function with one that uses the correct events.
            targetObserver.handler = new event_manager_1.EventSubscriber(binding.locator.get(runtime_1.IDOM), events);
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            binding.targetObserver.handler.dispose();
            binding.targetObserver.handler = binding.targetObserver.originalHandler;
            binding.targetObserver.originalHandler = null;
        }
    };
    UpdateTriggerBindingBehavior = tslib_1.__decorate([
        runtime_1.bindingBehavior('updateTrigger'),
        tslib_1.__param(0, runtime_1.IObserverLocator)
    ], UpdateTriggerBindingBehavior);
    exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;
});
//# sourceMappingURL=update-trigger.js.map