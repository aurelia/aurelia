import { __decorate } from "tslib";
import { bindingBehavior, } from '../binding-behavior';
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
PriorityBindingBehavior = __decorate([
    bindingBehavior('priority')
], PriorityBindingBehavior);
export { PriorityBindingBehavior };
//# sourceMappingURL=priority.js.map