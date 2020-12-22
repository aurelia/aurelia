"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallBinding = void 0;
class CallBinding {
    constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$hostScope = null;
        this.targetObserver = observerLocator.getObserver(target, targetProperty);
    }
    callSource(args) {
        const overrideContext = this.$scope.overrideContext;
        // really need to delete the following line
        // and the for..in loop below
        // convenience in the template won't outweight the draw back of such confusing feature
        // OR, at the very least, use getter/setter for each property in args to get/set original source
        // ---
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
        this.targetObserver.setValue(($args) => this.interceptor.callSource($args), flags, this.target, this.targetProperty);
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
        this.targetObserver.setValue(null, flags, this.target, this.targetProperty);
        this.isBound = false;
    }
    observeProperty(obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}
exports.CallBinding = CallBinding;
//# sourceMappingURL=call-binding.js.map