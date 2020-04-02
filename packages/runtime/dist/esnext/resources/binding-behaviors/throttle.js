import { __decorate, __metadata } from "tslib";
import { bindingBehavior, BindingInterceptor } from '../binding-behavior';
import { IScheduler, Now } from '@aurelia/scheduler';
import { BindingBehaviorExpression } from '../../binding/ast';
let ThrottleBindingBehavior = class ThrottleBindingBehavior extends BindingInterceptor {
    constructor(binding, expr) {
        super(binding, expr);
        this.opts = { delay: 0 };
        this.firstArg = null;
        this.task = null;
        this.lastCall = 0;
        this.taskQueue = binding.locator.get(IScheduler).getPostRenderTaskQueue();
        this.now = binding.locator.get(Now);
        if (expr.args.length > 0) {
            this.firstArg = expr.args[0];
        }
    }
    callSource(args) {
        this.queueTask(() => this.binding.callSource(args));
        return void 0;
    }
    handleChange(newValue, previousValue, flags) {
        this.queueTask(() => this.binding.handleChange(newValue, previousValue, flags));
    }
    queueTask(callback) {
        const opts = this.opts;
        const now = this.now;
        const nextDelay = this.lastCall + opts.delay - now();
        if (nextDelay > 0) {
            if (this.task !== null) {
                this.task.cancel();
            }
            opts.delay = nextDelay;
            this.task = this.taskQueue.queueTask(() => {
                this.lastCall = now();
                callback();
            }, opts);
        }
        else {
            this.lastCall = now();
            callback();
        }
    }
    $bind(flags, scope, part) {
        if (this.firstArg !== null) {
            const delay = Number(this.firstArg.evaluate(flags, scope, this.locator, part));
            if (!isNaN(delay)) {
                this.opts.delay = delay;
            }
        }
        this.binding.$bind(flags, scope, part);
    }
};
ThrottleBindingBehavior = __decorate([
    bindingBehavior('throttle'),
    __metadata("design:paramtypes", [Object, BindingBehaviorExpression])
], ThrottleBindingBehavior);
export { ThrottleBindingBehavior };
//# sourceMappingURL=throttle.js.map