import { __decorate } from "tslib";
import { bindingBehavior } from '../binding-behavior';
import { IScheduler, IClock } from '../../scheduler';
class Throttler {
    constructor(binding, delay) {
        this.binding = binding;
        const clock = binding.locator.get(IClock);
        const taskQueue = binding.locator.get(IScheduler).getPostRenderTaskQueue();
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
ThrottleBindingBehavior = __decorate([
    bindingBehavior('throttle')
], ThrottleBindingBehavior);
export { ThrottleBindingBehavior };
//# sourceMappingURL=throttle.js.map