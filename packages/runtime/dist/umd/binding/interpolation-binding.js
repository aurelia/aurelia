var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "@aurelia/scheduler", "../flags", "../observation/observer-locator", "./connectable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InterpolationBinding = exports.MultiInterpolationBinding = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const scheduler_1 = require("@aurelia/scheduler");
    const flags_1 = require("../flags");
    const observer_locator_1 = require("../observation/observer-locator");
    const connectable_1 = require("./connectable");
    const { toView, oneTime } = flags_1.BindingMode;
    const queueTaskOptions = {
        reusable: false,
        preempt: true,
    };
    class MultiInterpolationBinding {
        constructor(observerLocator, interpolation, target, targetProperty, mode, locator) {
            this.observerLocator = observerLocator;
            this.interpolation = interpolation;
            this.target = target;
            this.targetProperty = targetProperty;
            this.mode = mode;
            this.locator = locator;
            this.interceptor = this;
            this.isBound = false;
            this.$scope = void 0;
            // Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
            // value converters and binding behaviors.
            // Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
            // in which case the renderer will create the TextBinding directly
            const expressions = interpolation.expressions;
            const parts = this.parts = Array(expressions.length);
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                parts[i] = new InterpolationBinding(expressions[i], interpolation, target, targetProperty, mode, observerLocator, locator, i === 0);
            }
        }
        $bind(flags, scope, hostScope) {
            if (this.isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.interceptor.$unbind(flags);
            }
            this.isBound = true;
            this.$scope = scope;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].interceptor.$bind(flags, scope, hostScope);
            }
        }
        $unbind(flags) {
            if (!this.isBound) {
                return;
            }
            this.isBound = false;
            this.$scope = void 0;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].interceptor.$unbind(flags);
            }
        }
        dispose() {
            this.interceptor = (void 0);
            this.interpolation = (void 0);
            this.locator = (void 0);
            this.target = (void 0);
        }
    }
    exports.MultiInterpolationBinding = MultiInterpolationBinding;
    let InterpolationBinding = /** @class */ (() => {
        let InterpolationBinding = class InterpolationBinding {
            constructor(sourceExpression, interpolation, target, targetProperty, mode, observerLocator, locator, isFirst) {
                this.sourceExpression = sourceExpression;
                this.interpolation = interpolation;
                this.target = target;
                this.targetProperty = targetProperty;
                this.mode = mode;
                this.observerLocator = observerLocator;
                this.locator = locator;
                this.isFirst = isFirst;
                this.interceptor = this;
                this.$hostScope = null;
                this.task = null;
                this.isBound = false;
                connectable_1.connectable.assignIdTo(this);
                this.$scheduler = locator.get(scheduler_1.IScheduler);
                this.targetObserver = observerLocator.getAccessor(0 /* none */, target, targetProperty);
            }
            updateTarget(value, flags) {
                this.targetObserver.setValue(value, flags | 8 /* updateTargetInstance */);
            }
            handleChange(_newValue, _previousValue, flags) {
                var _a, _b;
                if (!this.isBound) {
                    return;
                }
                const targetObserver = this.targetObserver;
                // Alpha: during bind a simple strategy for bind is always flush immediately
                // todo:
                //  (1). determine whether this should be the behavior
                //  (2). if not, then fix tests to reflect the changes/scheduler to properly yield all with aurelia.start().wait()
                const shouldQueueFlush = (flags & 32 /* fromBind */) === 0 && (targetObserver.type & 64 /* Layout */) > 0;
                const newValue = this.interpolation.evaluate(flags, this.$scope, this.$hostScope, this.locator);
                const oldValue = targetObserver.getValue();
                const interceptor = this.interceptor;
                // todo(fred): maybe let the observer decides whether it updates
                if (newValue !== oldValue) {
                    if (shouldQueueFlush) {
                        flags |= 4096 /* noTargetObserverQueue */;
                        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
                        (_b = targetObserver.task) === null || _b === void 0 ? void 0 : _b.cancel();
                        targetObserver.task = this.task = this.$scheduler.queueRenderTask(() => {
                            var _a, _b;
                            (_b = (_a = targetObserver).flushChanges) === null || _b === void 0 ? void 0 : _b.call(_a, flags);
                            this.task = targetObserver.task = null;
                        }, queueTaskOptions);
                    }
                    interceptor.updateTarget(newValue, flags);
                }
                // todo: merge this with evaluate above
                if ((this.mode & oneTime) === 0) {
                    this.version++;
                    this.sourceExpression.connect(flags, this.$scope, this.$hostScope, interceptor);
                    interceptor.unobserve(false);
                }
            }
            $bind(flags, scope, hostScope) {
                if (this.isBound) {
                    if (this.$scope === scope) {
                        return;
                    }
                    this.interceptor.$unbind(flags);
                }
                this.isBound = true;
                this.$scope = scope;
                this.$hostScope = hostScope;
                const sourceExpression = this.sourceExpression;
                if (sourceExpression.bind) {
                    sourceExpression.bind(flags, scope, hostScope, this.interceptor);
                }
                const targetObserver = this.targetObserver;
                const mode = this.mode;
                if (mode !== flags_1.BindingMode.oneTime && targetObserver.bind) {
                    targetObserver.bind(flags);
                }
                // since the interpolation already gets the whole value, we only need to let the first
                // text binding do the update if there are multiple
                if (this.isFirst) {
                    this.interceptor.updateTarget(this.interpolation.evaluate(flags, scope, hostScope, this.locator), flags);
                }
                if ((mode & toView) > 0) {
                    sourceExpression.connect(flags, scope, hostScope, this.interceptor);
                }
            }
            $unbind(flags) {
                if (!this.isBound) {
                    return;
                }
                this.isBound = false;
                const sourceExpression = this.sourceExpression;
                if (sourceExpression.unbind) {
                    sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
                }
                const targetObserver = this.targetObserver;
                const task = this.task;
                if (targetObserver.unbind) {
                    targetObserver.unbind(flags);
                }
                if (task != null) {
                    task.cancel();
                    if (task === targetObserver.task) {
                        targetObserver.task = null;
                    }
                    this.task = null;
                }
                this.$scope = void 0;
                this.interceptor.unobserve(true);
            }
            dispose() {
                this.interceptor = (void 0);
                this.sourceExpression = (void 0);
                this.locator = (void 0);
                this.targetObserver = (void 0);
            }
        };
        InterpolationBinding = __decorate([
            connectable_1.connectable(),
            __metadata("design:paramtypes", [Object, Object, Object, String, Number, Object, Object, Boolean])
        ], InterpolationBinding);
        return InterpolationBinding;
    })();
    exports.InterpolationBinding = InterpolationBinding;
});
//# sourceMappingURL=interpolation-binding.js.map