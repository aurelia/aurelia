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
        define(["require", "exports", "@aurelia/kernel", "../observation", "../observation/observer-locator", "./connectable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LetBinding = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const observation_1 = require("../observation");
    const observer_locator_1 = require("../observation/observer-locator");
    const connectable_1 = require("./connectable");
    let LetBinding = class LetBinding {
        constructor(sourceExpression, targetProperty, observerLocator, locator, toBindingContext = false) {
            this.sourceExpression = sourceExpression;
            this.targetProperty = targetProperty;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.toBindingContext = toBindingContext;
            this.interceptor = this;
            this.isBound = false;
            this.$scope = void 0;
            this.$hostScope = null;
            this.task = null;
            this.target = null;
            connectable_1.connectable.assignIdTo(this);
            this.$lifecycle = locator.get(observation_1.ILifecycle);
        }
        handleChange(_newValue, _previousValue, flags) {
            if (!this.isBound) {
                return;
            }
            if (flags & 8 /* updateTargetInstance */) {
                const target = this.target;
                const targetProperty = this.targetProperty;
                const previousValue = target[targetProperty];
                this.version++;
                const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, this.interceptor);
                this.interceptor.unobserve(false);
                if (newValue !== previousValue) {
                    target[targetProperty] = newValue;
                }
                return;
            }
            throw new Error('Unexpected handleChange context in LetBinding');
        }
        $bind(flags, scope, hostScope) {
            if (this.isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.interceptor.$unbind(flags | 32 /* fromBind */);
            }
            this.$scope = scope;
            this.$hostScope = hostScope;
            this.target = (this.toBindingContext ? (hostScope !== null && hostScope !== void 0 ? hostScope : scope).bindingContext : (hostScope !== null && hostScope !== void 0 ? hostScope : scope).overrideContext);
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.hasBind) {
                sourceExpression.bind(flags, scope, hostScope, this.interceptor);
            }
            // sourceExpression might have been changed during bind
            this.target[this.targetProperty] = this.sourceExpression.evaluate(flags | 32 /* fromBind */, scope, hostScope, this.locator, this.interceptor);
            // add isBound flag and remove isBinding flag
            this.isBound = true;
        }
        $unbind(flags) {
            if (!this.isBound) {
                return;
            }
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.hasUnbind) {
                sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
            }
            this.$scope = void 0;
            this.interceptor.unobserve(true);
            // remove isBound and isUnbinding flags
            this.isBound = false;
        }
    };
    LetBinding = __decorate([
        connectable_1.connectable(),
        __metadata("design:paramtypes", [Object, String, Object, Object, Boolean])
    ], LetBinding);
    exports.LetBinding = LetBinding;
});
//# sourceMappingURL=let-binding.js.map