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
        define(["require", "exports", "@aurelia/kernel", "../flags", "../lifecycle", "../observation/observer-locator", "./ast", "./connectable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const flags_1 = require("../flags");
    const lifecycle_1 = require("../lifecycle");
    const observer_locator_1 = require("../observation/observer-locator");
    const ast_1 = require("./ast");
    const connectable_1 = require("./connectable");
    // BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
    const { oneTime, toView, fromView } = flags_1.BindingMode;
    // pre-combining flags for bitwise checks is a minor perf tweak
    const toViewOrOneTime = toView | oneTime;
    let PropertyBinding = class PropertyBinding {
        constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.interceptor = this;
            this.$state = 0 /* none */;
            this.$scope = void 0;
            this.targetObserver = void 0;
            this.persistentFlags = 0 /* none */;
            connectable_1.connectable.assignIdTo(this);
            this.$lifecycle = locator.get(lifecycle_1.ILifecycle);
        }
        ;
        updateTarget(value, flags) {
            flags |= this.persistentFlags;
            this.targetObserver.setValue(value, flags);
        }
        updateSource(value, flags) {
            flags |= this.persistentFlags;
            this.sourceExpression.assign(flags, this.$scope, this.locator, value, this.part);
        }
        handleChange(newValue, _previousValue, flags) {
            if ((this.$state & 4 /* isBound */) === 0) {
                return;
            }
            flags |= this.persistentFlags;
            if ((flags & 16 /* updateTargetInstance */) > 0) {
                const previousValue = this.targetObserver.getValue();
                // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
                if (this.sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                    newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part);
                }
                if (newValue !== previousValue) {
                    this.interceptor.updateTarget(newValue, flags);
                }
                if ((this.mode & oneTime) === 0) {
                    this.version++;
                    this.sourceExpression.connect(flags, this.$scope, this.interceptor, this.part);
                    this.interceptor.unobserve(false);
                }
                return;
            }
            if ((flags & 32 /* updateSourceExpression */) > 0) {
                if (newValue !== this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part)) {
                    this.interceptor.updateSource(newValue, flags);
                }
                return;
            }
            throw kernel_1.Reporter.error(15, flags);
        }
        $bind(flags, scope, part) {
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.interceptor.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            // Force property binding to always be strict
            flags |= 4 /* isStrictBindingStrategy */;
            // Store flags which we can only receive during $bind and need to pass on
            // to the AST during evaluate/connect/assign
            this.persistentFlags = flags & 2080374799 /* persistentBindingFlags */;
            this.$scope = scope;
            this.part = part;
            let sourceExpression = this.sourceExpression;
            if (ast_1.hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this.interceptor);
            }
            let targetObserver = this.targetObserver;
            if (!targetObserver) {
                if (this.mode & fromView) {
                    targetObserver = this.targetObserver = this.observerLocator.getObserver(flags, this.target, this.targetProperty);
                }
                else {
                    targetObserver = this.targetObserver = this.observerLocator.getAccessor(flags, this.target, this.targetProperty);
                }
            }
            if (this.mode !== flags_1.BindingMode.oneTime && targetObserver.bind) {
                targetObserver.bind(flags);
            }
            // during bind, binding behavior might have changed sourceExpression
            sourceExpression = this.sourceExpression;
            if (this.mode & toViewOrOneTime) {
                this.interceptor.updateTarget(sourceExpression.evaluate(flags, scope, this.locator, part), flags);
            }
            if (this.mode & toView) {
                sourceExpression.connect(flags, scope, this.interceptor, part);
            }
            if (this.mode & fromView) {
                targetObserver.subscribe(this.interceptor);
                if ((this.mode & toView) === 0) {
                    this.interceptor.updateSource(targetObserver.getValue(), flags);
                }
                targetObserver[this.id] |= 32 /* updateSourceExpression */;
            }
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            // clear persistent flags
            this.persistentFlags = 0 /* none */;
            if (ast_1.hasUnbind(this.sourceExpression)) {
                this.sourceExpression.unbind(flags, this.$scope, this.interceptor);
            }
            this.$scope = void 0;
            if (this.targetObserver.unbind) {
                this.targetObserver.unbind(flags);
            }
            if (this.targetObserver.unsubscribe) {
                this.targetObserver.unsubscribe(this.interceptor);
                this.targetObserver[this.id] &= ~32 /* updateSourceExpression */;
            }
            this.interceptor.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
        }
    };
    PropertyBinding = __decorate([
        connectable_1.connectable(),
        __metadata("design:paramtypes", [Object, Object, String, Number, Object, Object])
    ], PropertyBinding);
    exports.PropertyBinding = PropertyBinding;
});
//# sourceMappingURL=property-binding.js.map