import { IPlatform } from '@aurelia/kernel';
import { bindingBehavior, BindingInterceptor } from '@aurelia/runtime';
const defaultDelay = 200;
// A binding behavior that limits
// - (v1) the rate at which the view-model is updated in two-way bindings, OR
// - (v1 + v2) the rate at which the view is updated in to-view binding scenarios.
export class ThrottleBindingBehavior extends BindingInterceptor {
    constructor(binding, expr) {
        super(binding, expr);
        this.opts = { delay: 0 };
        this.firstArg = null;
        this.task = null;
        this.lastCall = 0;
        this.delay = 0;
        this.platform = binding.locator.get(IPlatform);
        this.taskQueue = this.platform.taskQueue;
        if (expr.args.length > 0) {
            this.firstArg = expr.args[0];
        }
    }
    callSource(args) {
        this.queueTask(() => this.binding.callSource(args));
        return void 0;
    }
    handleChange(newValue, oldValue, flags) {
        // when source has changed before the latest throttled value from target
        // then discard that value, and take latest value from source only
        if (this.task !== null) {
            this.task.cancel();
            this.task = null;
            this.lastCall = this.platform.performanceNow();
        }
        this.binding.handleChange(newValue, oldValue, flags);
    }
    updateSource(newValue, flags) {
        this.queueTask(() => this.binding.updateSource(newValue, flags));
    }
    queueTask(callback) {
        const opts = this.opts;
        const platform = this.platform;
        const nextDelay = this.lastCall + opts.delay - platform.performanceNow();
        if (nextDelay > 0) {
            // Queue the new one before canceling the old one, to prevent early yield
            const task = this.task;
            opts.delay = nextDelay;
            this.task = this.taskQueue.queueTask(() => {
                this.lastCall = platform.performanceNow();
                this.task = null;
                opts.delay = this.delay;
                callback();
            }, opts);
            task === null || task === void 0 ? void 0 : task.cancel();
        }
        else {
            this.lastCall = platform.performanceNow();
            callback();
        }
    }
    $bind(flags, scope, hostScope) {
        if (this.firstArg !== null) {
            const delay = Number(this.firstArg.evaluate(flags, scope, hostScope, this.locator, null));
            this.opts.delay = this.delay = isNaN(delay) ? defaultDelay : delay;
        }
        this.binding.$bind(flags, scope, hostScope);
    }
    $unbind(flags) {
        var _a;
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
        super.$unbind(flags);
    }
}
bindingBehavior('throttle')(ThrottleBindingBehavior);
//# sourceMappingURL=throttle.js.map