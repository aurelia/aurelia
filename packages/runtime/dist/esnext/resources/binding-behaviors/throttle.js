var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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