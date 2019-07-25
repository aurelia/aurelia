(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../binding-behavior"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const binding_behavior_1 = require("../binding-behavior");
    let PriorityBindingBehavior = class PriorityBindingBehavior {
        bind(binding, priority = 4096 /* low */) {
            const { targetObserver } = binding;
            if (targetObserver != void 0) {
                this[binding.id] = targetObserver.priority;
                if (typeof priority === 'number') {
                    targetObserver.priority = priority;
                }
                else {
                    switch (priority) {
                        case 'preempt':
                            targetObserver.priority = 32768 /* 'preempt' */;
                            break;
                        case 'high':
                            targetObserver.priority = 28672 /* 'high' */;
                            break;
                        case 'bind':
                            targetObserver.priority = 24576 /* 'bind' */;
                            break;
                        case 'attach':
                            targetObserver.priority = 20480 /* 'attach' */;
                            break;
                        case 'normal':
                            targetObserver.priority = 16384 /* 'normal' */;
                            break;
                        case 'propagate':
                            targetObserver.priority = 12288 /* 'propagate' */;
                            break;
                        case 'connect':
                            targetObserver.priority = 8192 /* 'connect' */;
                            break;
                        case 'low':
                            targetObserver.priority = 4096 /* 'low' */;
                    }
                }
            }
        }
        unbind(binding) {
            if (binding.targetObserver != void 0) {
                binding.targetObserver.priority = this[binding.id];
            }
        }
    };
    PriorityBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('priority')
    ], PriorityBindingBehavior);
    exports.PriorityBindingBehavior = PriorityBindingBehavior;
});
//# sourceMappingURL=priority.js.map