(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const ast_1 = require("./ast");
    const slice = Array.prototype.slice;
    class Call {
        constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
            this.$state = 0 /* none */;
            this.locator = locator;
            this.sourceExpression = sourceExpression;
            this.targetObserver = observerLocator.getObserver(0 /* none */, target, targetProperty);
        }
        callSource(args) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('Call', 'callSource', slice.call(arguments));
            }
            const overrideContext = this.$scope.overrideContext;
            Object.assign(overrideContext, args);
            const result = this.sourceExpression.evaluate(2097152 /* mustEvaluate */, this.$scope, this.locator, this.part);
            for (const prop in args) {
                Reflect.deleteProperty(overrideContext, prop);
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
            return result;
        }
        $bind(flags, scope, part) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('Call', '$bind', slice.call(arguments));
            }
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    if (kernel_1.Tracer.enabled) {
                        kernel_1.Tracer.leave();
                    }
                    return;
                }
                this.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            this.part = part;
            if (ast_1.hasBind(this.sourceExpression)) {
                this.sourceExpression.bind(flags, scope, this);
            }
            this.targetObserver.setValue(($args) => this.callSource($args), flags);
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
        $unbind(flags) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('Call', '$unbind', slice.call(arguments));
            }
            if (!(this.$state & 4 /* isBound */)) {
                if (kernel_1.Tracer.enabled) {
                    kernel_1.Tracer.leave();
                }
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            if (ast_1.hasUnbind(this.sourceExpression)) {
                this.sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = void 0;
            this.targetObserver.setValue(null, flags);
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
        observeProperty(flags, obj, propertyName) {
            return;
        }
        handleChange(newValue, previousValue, flags) {
            return;
        }
    }
    exports.Call = Call;
});
//# sourceMappingURL=call.js.map