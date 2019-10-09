(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "../lifecycle", "./connectable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const lifecycle_1 = require("../lifecycle");
    const connectable_1 = require("./connectable");
    const slice = Array.prototype.slice;
    let LetBinding = class LetBinding {
        constructor(sourceExpression, targetProperty, observerLocator, locator, toBindingContext = false) {
            connectable_1.connectable.assignIdTo(this);
            this.$state = 0 /* none */;
            this.$lifecycle = locator.get(lifecycle_1.ILifecycle);
            this.$scope = void 0;
            this.locator = locator;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = null;
            this.targetProperty = targetProperty;
            this.toBindingContext = toBindingContext;
        }
        handleChange(_newValue, _previousValue, flags) {
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            if (flags & 16 /* updateTargetInstance */) {
                const { target, targetProperty } = this;
                const previousValue = target[targetProperty];
                const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part);
                if (newValue !== previousValue) {
                    target[targetProperty] = newValue;
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
                this.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            this.part = part;
            this.target = (this.toBindingContext ? scope.bindingContext : scope.overrideContext);
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            // sourceExpression might have been changed during bind
            this.target[this.targetProperty] = this.sourceExpression.evaluate(flags | 4096 /* fromBind */, scope, this.locator, part);
            this.sourceExpression.connect(flags, scope, this, part);
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
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = void 0;
            this.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
        }
    };
    LetBinding = tslib_1.__decorate([
        connectable_1.connectable()
    ], LetBinding);
    exports.LetBinding = LetBinding;
});
//# sourceMappingURL=let-binding.js.map