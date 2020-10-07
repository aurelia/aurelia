(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallBinding = void 0;
    class CallBinding {
        constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
            this.sourceExpression = sourceExpression;
            this.locator = locator;
            this.interceptor = this;
            this.isBound = false;
            this.$hostScope = null;
            this.targetObserver = observerLocator.getObserver(0 /* none */, target, targetProperty);
        }
        callSource(args) {
            const overrideContext = this.$scope.overrideContext;
            Object.assign(overrideContext, args);
            const result = this.sourceExpression.evaluate(128 /* mustEvaluate */, this.$scope, this.$hostScope, this.locator, null);
            for (const prop in args) {
                Reflect.deleteProperty(overrideContext, prop);
            }
            return result;
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
            if (this.sourceExpression.hasBind) {
                this.sourceExpression.bind(flags, scope, hostScope, this.interceptor);
            }
            this.targetObserver.setValue(($args) => this.interceptor.callSource($args), flags);
            // add isBound flag and remove isBinding flag
            this.isBound = true;
        }
        $unbind(flags) {
            if (!this.isBound) {
                return;
            }
            if (this.sourceExpression.hasUnbind) {
                this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
            }
            this.$scope = void 0;
            this.targetObserver.setValue(null, flags);
            this.isBound = false;
        }
        observeProperty(flags, obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
        dispose() {
            this.interceptor = (void 0);
            this.sourceExpression = (void 0);
            this.locator = (void 0);
            this.targetObserver = (void 0);
        }
    }
    exports.CallBinding = CallBinding;
});
//# sourceMappingURL=call-binding.js.map