import { __decorate, __metadata } from "tslib";
import { bindingBehavior, BindingInterceptor } from '../binding-behavior';
import { IScheduler } from '@aurelia/scheduler';
import { BindingBehaviorExpression } from '../../binding/ast';
let DebounceBindingBehavior = class DebounceBindingBehavior extends BindingInterceptor {
    constructor(binding, expr) {
        super(binding, expr);
        this.opts = { delay: 0 };
        this.firstArg = null;
        this.task = null;
        this.taskQueue = binding.locator.get(IScheduler).getPostRenderTaskQueue();
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
        if (this.task !== null) {
            this.task.cancel();
        }
        this.task = this.taskQueue.queueTask(callback, this.opts);
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
DebounceBindingBehavior = __decorate([
    bindingBehavior('debounce'),
    __metadata("design:paramtypes", [Object, BindingBehaviorExpression])
], DebounceBindingBehavior);
export { DebounceBindingBehavior };
//# sourceMappingURL=debounce.js.map