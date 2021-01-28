"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebounceBindingBehavior = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_1 = require("@aurelia/runtime");
class DebounceBindingBehavior extends runtime_1.BindingInterceptor {
    constructor(binding, expr) {
        super(binding, expr);
        this.opts = { delay: 0 };
        this.firstArg = null;
        this.task = null;
        this.taskQueue = binding.locator.get(kernel_1.IPlatform).taskQueue;
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
        // Queue the new one before canceling the old one, to prevent early yield
        const task = this.task;
        this.task = this.taskQueue.queueTask(() => {
            this.task = null;
            return callback();
        }, this.opts);
        task === null || task === void 0 ? void 0 : task.cancel();
    }
    $bind(flags, scope, hostScope) {
        if (this.firstArg !== null) {
            const delay = Number(this.firstArg.evaluate(flags, scope, hostScope, this.locator, null));
            if (!isNaN(delay)) {
                this.opts.delay = delay;
            }
        }
        this.binding.$bind(flags, scope, hostScope);
    }
    $unbind(flags) {
        var _a;
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
        this.binding.$unbind(flags);
    }
}
exports.DebounceBindingBehavior = DebounceBindingBehavior;
runtime_1.bindingBehavior('debounce')(DebounceBindingBehavior);
//# sourceMappingURL=debounce.js.map