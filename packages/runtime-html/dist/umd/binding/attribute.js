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
        define(["require", "exports", "@aurelia/kernel", "@aurelia/runtime", "../observation/element-attribute-observer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AttributeBinding = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const element_attribute_observer_1 = require("../observation/element-attribute-observer");
    // BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
    const { oneTime, toView, fromView } = runtime_1.BindingMode;
    // pre-combining flags for bitwise checks is a minor perf tweak
    const toViewOrOneTime = toView | oneTime;
    const taskOptions = {
        reusable: false,
        preempt: true,
    };
    /**
     * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
     */
    let AttributeBinding = class AttributeBinding {
        constructor(sourceExpression, target, 
        // some attributes may have inner structure
        // such as class -> collection of class names
        // such as style -> collection of style rules
        //
        // for normal attributes, targetAttribute and targetProperty are the same and can be ignore
        targetAttribute, targetProperty, mode, observerLocator, locator) {
            this.sourceExpression = sourceExpression;
            this.targetAttribute = targetAttribute;
            this.targetProperty = targetProperty;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.interceptor = this;
            this.isBound = false;
            this.$scope = null;
            this.$hostScope = null;
            this.task = null;
            this.persistentFlags = 0 /* none */;
            this.target = target;
            runtime_1.connectable.assignIdTo(this);
            this.$scheduler = locator.get(runtime_1.IScheduler);
        }
        updateTarget(value, flags) {
            flags |= this.persistentFlags;
            this.targetObserver.setValue(value, flags | 8 /* updateTargetInstance */);
        }
        updateSource(value, flags) {
            flags |= this.persistentFlags;
            this.sourceExpression.assign(flags | 16 /* updateSourceExpression */, this.$scope, this.$hostScope, this.locator, value);
        }
        handleChange(newValue, _previousValue, flags) {
            var _a, _b;
            if (!this.isBound) {
                return;
            }
            flags |= this.persistentFlags;
            const mode = this.mode;
            const interceptor = this.interceptor;
            const sourceExpression = this.sourceExpression;
            const $scope = this.$scope;
            const locator = this.locator;
            if (mode === runtime_1.BindingMode.fromView) {
                flags &= ~8 /* updateTargetInstance */;
                flags |= 16 /* updateSourceExpression */;
            }
            if (flags & 8 /* updateTargetInstance */) {
                const targetObserver = this.targetObserver;
                // Alpha: during bind a simple strategy for bind is always flush immediately
                // todo:
                //  (1). determine whether this should be the behavior
                //  (2). if not, then fix tests to reflect the changes/scheduler to properly yield all with aurelia.start().wait()
                const shouldQueueFlush = (flags & 32 /* fromBind */) === 0 && (targetObserver.type & 64 /* Layout */) > 0;
                const oldValue = targetObserver.getValue();
                if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                    newValue = sourceExpression.evaluate(flags, $scope, this.$hostScope, locator);
                }
                if (newValue !== oldValue) {
                    if (shouldQueueFlush) {
                        flags |= 4096 /* noTargetObserverQueue */;
                        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
                        (_b = targetObserver.task) === null || _b === void 0 ? void 0 : _b.cancel();
                        targetObserver.task = this.task = this.$scheduler.queueRenderTask(() => {
                            var _a, _b;
                            (_b = (_a = targetObserver).flushChanges) === null || _b === void 0 ? void 0 : _b.call(_a, flags);
                            this.task = targetObserver.task = null;
                        }, taskOptions);
                    }
                    interceptor.updateTarget(newValue, flags);
                }
                if ((mode & oneTime) === 0) {
                    this.version++;
                    sourceExpression.connect(flags, $scope, this.$hostScope, interceptor);
                    interceptor.unobserve(false);
                }
                return;
            }
            if (flags & 16 /* updateSourceExpression */) {
                if (newValue !== this.sourceExpression.evaluate(flags, $scope, this.$hostScope, locator)) {
                    interceptor.updateSource(newValue, flags);
                }
                return;
            }
            throw new Error('Unexpected handleChange context in AttributeBinding');
        }
        $bind(flags, scope, hostScope, projection) {
            if (this.isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.interceptor.$unbind(flags | 32 /* fromBind */);
            }
            // Store flags which we can only receive during $bind and need to pass on
            // to the AST during evaluate/connect/assign
            this.persistentFlags = flags & 31751 /* persistentBindingFlags */;
            this.$scope = scope;
            this.$hostScope = hostScope;
            this.projection = projection;
            let sourceExpression = this.sourceExpression;
            if (sourceExpression.hasBind) {
                sourceExpression.bind(flags, scope, hostScope, this.interceptor);
            }
            let targetObserver = this.targetObserver;
            if (!targetObserver) {
                targetObserver = this.targetObserver = new element_attribute_observer_1.AttributeObserver(this.$scheduler, flags, this.observerLocator, this.target, this.targetProperty, this.targetAttribute);
            }
            if (targetObserver.bind) {
                targetObserver.bind(flags);
            }
            // during bind, binding behavior might have changed sourceExpression
            sourceExpression = this.sourceExpression;
            const $mode = this.mode;
            const interceptor = this.interceptor;
            if ($mode & toViewOrOneTime) {
                interceptor.updateTarget(sourceExpression.evaluate(flags, scope, this.$hostScope, this.locator), flags);
            }
            if ($mode & toView) {
                sourceExpression.connect(flags, scope, this.$hostScope, this);
            }
            if ($mode & fromView) {
                targetObserver[this.id] |= 16 /* updateSourceExpression */;
                targetObserver.subscribe(interceptor);
            }
            // add isBound flag and remove isBinding flag
            this.isBound = true;
        }
        $unbind(flags) {
            if (!this.isBound) {
                return;
            }
            // clear persistent flags
            this.persistentFlags = 0 /* none */;
            if (this.sourceExpression.hasUnbind) {
                this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
            }
            this.$scope = null;
            const targetObserver = this.targetObserver;
            const task = this.task;
            if (targetObserver.unbind) {
                targetObserver.unbind(flags);
            }
            if (targetObserver.unsubscribe) {
                targetObserver.unsubscribe(this.interceptor);
                targetObserver[this.id] &= ~16 /* updateSourceExpression */;
            }
            if (task != null) {
                task.cancel();
                if (task === targetObserver.task) {
                    targetObserver.task = null;
                }
                this.task = null;
            }
            this.interceptor.unobserve(true);
            // remove isBound and isUnbinding flags
            this.isBound = false;
        }
        connect(flags) {
            if (this.isBound) {
                flags |= this.persistentFlags;
                this.sourceExpression.connect(flags | 128 /* mustEvaluate */, this.$scope, this.$hostScope, this.interceptor); // why do we have a connect method here in the first place? will this be called after bind?
            }
        }
        dispose() {
            this.interceptor = (void 0);
            this.sourceExpression = (void 0);
            this.locator = (void 0);
            this.targetObserver = (void 0);
            this.target = (void 0);
        }
    };
    AttributeBinding = __decorate([
        runtime_1.connectable(),
        __metadata("design:paramtypes", [Object, Object, String, String, Number, Object, Object])
    ], AttributeBinding);
    exports.AttributeBinding = AttributeBinding;
});
//# sourceMappingURL=attribute.js.map