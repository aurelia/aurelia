var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../binding-behavior.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebounceBindingBehavior = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const binding_behavior_js_1 = require("../binding-behavior.js");
    let DebounceBindingBehavior = class DebounceBindingBehavior extends binding_behavior_js_1.BindingInterceptor {
        constructor(binding, expr) {
            super(binding, expr);
            this.opts = { delay: 0 };
            this.firstArg = null;
            this.task = null;
            this.taskQueue = binding.locator.get(kernel_1.IPlatform).macroTaskQueue;
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
            this.task = this.taskQueue.queueTask(() => {
                this.task = null;
                return callback();
            }, this.opts);
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
    };
    DebounceBindingBehavior = __decorate([
        binding_behavior_js_1.bindingBehavior('debounce')
    ], DebounceBindingBehavior);
    exports.DebounceBindingBehavior = DebounceBindingBehavior;
});
//# sourceMappingURL=debounce.js.map