(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../flags", "./connectable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const flags_1 = require("../flags");
    const connectable_1 = require("./connectable");
    const { toView, oneTime } = flags_1.BindingMode;
    class MultiInterpolationBinding {
        constructor(observerLocator, interpolation, target, targetProperty, mode, locator) {
            this.$state = 0 /* none */;
            this.$scope = void 0;
            this.interpolation = interpolation;
            this.locator = locator;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.target = target;
            this.targetProperty = targetProperty;
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
        $bind(flags, scope, part) {
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$state |= 4 /* isBound */;
            this.$scope = scope;
            this.part = part;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$bind(flags, scope, part);
            }
        }
        $unbind(flags) {
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            this.$state &= ~4 /* isBound */;
            this.$scope = void 0;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$unbind(flags);
            }
        }
    }
    exports.MultiInterpolationBinding = MultiInterpolationBinding;
    let InterpolationBinding = class InterpolationBinding {
        constructor(sourceExpression, interpolation, target, targetProperty, mode, observerLocator, locator, isFirst) {
            connectable_1.connectable.assignIdTo(this);
            this.$state = 0 /* none */;
            this.interpolation = interpolation;
            this.isFirst = isFirst;
            this.mode = mode;
            this.locator = locator;
            this.observerLocator = observerLocator;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.targetObserver = observerLocator.getAccessor(0 /* none */, target, targetProperty);
        }
        updateTarget(value, flags) {
            this.targetObserver.setValue(value, flags | 16 /* updateTargetInstance */);
        }
        handleChange(_newValue, _previousValue, flags) {
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            const previousValue = this.targetObserver.getValue();
            const newValue = this.interpolation.evaluate(flags, this.$scope, this.locator, this.part);
            if (newValue !== previousValue) {
                this.updateTarget(newValue, flags);
            }
            if ((this.mode & oneTime) === 0) {
                this.version++;
                this.sourceExpression.connect(flags, this.$scope, this, this.part);
                this.unobserve(false);
            }
        }
        $bind(flags, scope, part) {
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$state |= 4 /* isBound */;
            this.$scope = scope;
            this.part = part;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            if (this.mode !== flags_1.BindingMode.oneTime && this.targetObserver.bind) {
                this.targetObserver.bind(flags);
            }
            // since the interpolation already gets the whole value, we only need to let the first
            // text binding do the update if there are multiple
            if (this.isFirst) {
                this.updateTarget(this.interpolation.evaluate(flags, scope, this.locator, part), flags);
            }
            if (this.mode & toView) {
                sourceExpression.connect(flags, scope, this, part);
            }
        }
        $unbind(flags) {
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            this.$state &= ~4 /* isBound */;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            if (this.targetObserver.unbind) {
                this.targetObserver.unbind(flags);
            }
            this.$scope = void 0;
            this.unobserve(true);
        }
    };
    InterpolationBinding = tslib_1.__decorate([
        connectable_1.connectable()
    ], InterpolationBinding);
    exports.InterpolationBinding = InterpolationBinding;
});
//# sourceMappingURL=interpolation-binding.js.map